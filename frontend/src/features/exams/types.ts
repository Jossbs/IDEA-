import type { AcademicLevel } from '@/features/subjects/types'

/** Difficulty of a question — mirrors the backend `DifficultyLevel` enum. */
export type DifficultyLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export const DIFFICULTY_LEVELS: DifficultyLevel[] = ['LOW', 'MEDIUM', 'HIGH']

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
}

/** Kind of question — mirrors the backend `QuestionType` enum. */
export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_TEXT'

export const QUESTION_TYPES: QuestionType[] = [
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'TRUE_FALSE',
  'SHORT_TEXT',
]

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  SINGLE_CHOICE: 'Opción única',
  MULTIPLE_CHOICE: 'Opción múltiple',
  TRUE_FALSE: 'Verdadero / Falso',
  SHORT_TEXT: 'Respuesta corta',
}

/** Whether a type uses radio (one correct) or checkbox (many) selection. */
export function selectionMode(type: QuestionType): 'single' | 'multiple' {
  return type === 'MULTIPLE_CHOICE' ? 'multiple' : 'single'
}

/** True for types whose options the teacher edits freely (add/remove). */
export function hasEditableOptions(type: QuestionType): boolean {
  return type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE'
}

/** True for types that carry answer options at all (SHORT_TEXT does not). */
export function hasOptions(type: QuestionType): boolean {
  return type !== 'SHORT_TEXT'
}

/** A single answer option within a question. */
export interface ExamOption {
  id: string
  text: string
  /** Whether this option counts as correct. */
  isCorrect: boolean
}

/**
 * A question (reactivo) being authored, with its answer options.
 *
 * Carries the full backend contract: `type` drives grading, `points` its weight
 * and `difficulty` is analytics metadata. `sortOrder` is derived from the list
 * position at submit time, so it is not stored here.
 */
export interface ExamQuestion {
  id: string
  text: string
  type: QuestionType
  points: number
  difficulty: DifficultyLevel
  options: ExamOption[]
}

/** The full exam being authored (local form state). */
export interface ExamDraft {
  title: string
  /**
   * References a subject's identifier; empty until chosen. The academic level
   * is derived from the chosen subject (shown as "Física - Bachillerato"),
   * so the exam has no separate level field.
   */
  subjectId: string
  description: string
  /** Draft vs. published — maps to the backend `is_published`. */
  isPublished: boolean
  /** Declared total the exam is worth; must equal the sum of question points. */
  totalPoints: number
  /** Minimum score to accredit (nota de acreditación). */
  passingScore: number
  /** Delivery deadline as a `datetime-local` value ('' = none). */
  dueAt: string
  /** Student user ids this exam is directed to (optional). */
  studentIds: string[]
  questions: ExamQuestion[]
}

/** Sum of the points distributed across the exam's questions. */
export function distributedPoints(questions: ExamQuestion[]): number {
  return questions.reduce((sum, q) => sum + (Number.isFinite(q.points) ? q.points : 0), 0)
}

/** A student in the teacher's directory (GET /api/students). */
export interface Student {
  userId: string
  email: string
  fullName: string
}

/** Minimum / default number of options a new choice question starts with. */
export const MIN_OPTIONS = 2
export const DEFAULT_OPTIONS = 4

export function createOption(isCorrect = false, text = ''): ExamOption {
  return { id: crypto.randomUUID(), text, isCorrect }
}

/** Builds the default option set for a choice question (first one correct). */
export function createChoiceOptions(): ExamOption[] {
  return Array.from({ length: DEFAULT_OPTIONS }, (_, i) => createOption(i === 0))
}

/** Builds the fixed Verdadero/Falso options for a TRUE_FALSE question. */
export function createTrueFalseOptions(): ExamOption[] {
  return [createOption(true, 'Verdadero'), createOption(false, 'Falso')]
}

/** Returns the option set appropriate for a given question type. */
export function optionsForType(type: QuestionType): ExamOption[] {
  switch (type) {
    case 'TRUE_FALSE':
      return createTrueFalseOptions()
    case 'SHORT_TEXT':
      return []
    default:
      return createChoiceOptions()
  }
}

export function createQuestion(): ExamQuestion {
  return {
    id: crypto.randomUUID(),
    text: '',
    type: 'SINGLE_CHOICE',
    points: 1,
    difficulty: 'MEDIUM',
    options: createChoiceOptions(),
  }
}

export function createExamDraft(): ExamDraft {
  return {
    title: '',
    subjectId: '',
    description: '',
    isPublished: false,
    totalPoints: 10,
    passingScore: 6,
    dueAt: '',
    studentIds: [],
    questions: [createQuestion()],
  }
}

/** Trims an ISO date-time ("2026-06-25T14:30:00") to a `datetime-local` value. */
export function toDateTimeLocal(iso: string | null): string {
  return iso ? iso.slice(0, 16) : ''
}

/** Maps a fetched exam detail into editable draft state (for the edit form). */
export function detailToDraft(detail: ExamDetail): ExamDraft {
  return {
    title: detail.title,
    subjectId: detail.subjectId,
    description: detail.description ?? '',
    isPublished: detail.published,
    totalPoints: detail.totalPoints,
    passingScore: detail.passingScore,
    dueAt: toDateTimeLocal(detail.dueAt),
    studentIds: detail.assignedStudentIds,
    questions: detail.questions.map((q) => ({
      id: q.questionId,
      text: q.questionText,
      type: q.questionType,
      points: q.points,
      difficulty: q.difficultyLevel,
      options: q.options.map((o) => ({
        id: o.optionId,
        text: o.optionText,
        isCorrect: o.isCorrect,
      })),
    })),
  }
}

/* ───────────────────────────────────────────────────────────
 * Backend contract (POST /api/exams) — mirrors the Spring DTOs.
 * ─────────────────────────────────────────────────────────── */

export interface CreateOptionPayload {
  optionText: string
  isCorrect: boolean
}

export interface CreateQuestionPayload {
  questionText: string
  questionType: QuestionType
  difficultyLevel: DifficultyLevel
  points: number
  sortOrder: number
  options: CreateOptionPayload[]
}

export interface CreateExamPayload {
  title: string
  subjectId: string
  description: string | null
  isPublished: boolean
  totalPoints: number
  passingScore: number
  /** ISO `datetime-local` string, or null when no deadline. */
  dueAt: string | null
  studentIds: string[]
  questions: CreateQuestionPayload[]
}

export interface CreateExamResponse {
  examId: string
  message: string
}

/* ───────────────────────────────────────────────────────────
 * Read models (GET /api/exams · /api/exams/{id}) — mirror the Spring DTOs.
 * ─────────────────────────────────────────────────────────── */

/** Flat summary for the teacher dashboard list. */
export interface ExamSummary {
  examId: string
  title: string
  subjectName: string
  academicLevel: AcademicLevel
  published: boolean
  questionCount: number
  updateTimestamp: string
  totalPoints: number
  passingScore: number
  dueAt: string | null
  /** Average submitted score across attempts; null when there are none yet. */
  averageScore: number | null
}

export interface OptionDetail {
  optionId: string
  optionText: string
  isCorrect: boolean
}

export interface QuestionDetail {
  questionId: string
  questionText: string
  questionType: QuestionType
  difficultyLevel: DifficultyLevel
  points: number
  sortOrder: number
  options: OptionDetail[]
}

/** Full teacher-facing exam detail (edit/preview foundation). */
export interface ExamDetail {
  examId: string
  title: string
  description: string | null
  subjectId: string
  subjectName: string
  academicLevel: AcademicLevel
  published: boolean
  totalPoints: number
  passingScore: number
  dueAt: string | null
  assignedStudentIds: string[]
  questions: QuestionDetail[]
}

/* ── Results (GET /api/exams/{id}/results) ── */

export type AttemptStatus = 'GRADED' | 'PENDING_REVIEW'

export interface ResultEntry {
  attemptId: string
  studentName: string
  submittedAt: string
  score: number
  status: AttemptStatus
  pendingReview: boolean
}

/* ── Manual review (GET/POST /api/exams/{id}/attempts/{attemptId}/review) ── */

export interface ReviewItem {
  questionId: string
  questionText: string
  maxPoints: number
  answerText: string
}

export interface AttemptReview {
  attemptId: string
  studentName: string
  autoScore: number
  maxScore: number
  status: AttemptStatus
  items: ReviewItem[]
}

export interface QuestionGrade {
  questionId: string
  points: number
}

export interface ExamResults {
  examId: string
  examTitle: string
  subjectName: string
  maxScore: number
  passingScore: number
  results: ResultEntry[]
}

/** Maps the local draft to the backend payload (sortOrder = list position). */
export function toCreateExamPayload(exam: ExamDraft): CreateExamPayload {
  const description = exam.description.trim()
  return {
    title: exam.title.trim(),
    subjectId: exam.subjectId,
    description: description === '' ? null : description,
    isPublished: exam.isPublished,
    totalPoints: exam.totalPoints,
    passingScore: exam.passingScore,
    dueAt: exam.dueAt.trim() === '' ? null : exam.dueAt,
    studentIds: exam.studentIds,
    questions: exam.questions.map((q, index) => ({
      questionText: q.text.trim(),
      questionType: q.type,
      difficultyLevel: q.difficulty,
      points: q.points,
      sortOrder: index,
      options: hasOptions(q.type)
        ? q.options.map((o) => ({ optionText: o.text.trim(), isCorrect: o.isCorrect }))
        : [],
    })),
  }
}

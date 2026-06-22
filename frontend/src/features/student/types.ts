/** Student-facing types — mirror the backend /api/student contract. */
import type { AcademicLevel } from '@/features/subjects/types'
import type { QuestionType } from '@/features/exams/types'

export type AttemptStatus = 'GRADED' | 'PENDING_REVIEW'

/** A published exam card in the student's list. */
export interface StudentExamCard {
  examId: string
  title: string
  subjectName: string
  academicLevel: AcademicLevel
  questionCount: number
  alreadyTaken: boolean
  /** Outcome once submitted; null while still pending. */
  attemptStatus: AttemptStatus | null
  score: number | null
  maxScore: number | null
}

export interface StudentOption {
  optionId: string
  optionText: string
}

export interface StudentQuestion {
  questionId: string
  questionText: string
  questionType: QuestionType
  points: number
  options: StudentOption[]
}

/** Sanitized exam to take (no answer key). */
export interface StudentExam {
  examId: string
  title: string
  durationMinutes: number | null
  questions: StudentQuestion[]
}

/** One question's answer in a submission. */
export interface AnswerSubmission {
  questionId: string
  selectedOptionIds?: string[]
  answerText?: string
}

export interface AttemptResult {
  attemptId: string
  status: AttemptStatus
  score: number
  maxScore: number
}

/* ── Student self-review (GET /api/student/exams/{id}/result) ── */

export interface StudentAnswerOption {
  optionId: string
  optionText: string
  correct: boolean
  selected: boolean
}

export interface StudentAnswerReview {
  questionId: string
  questionText: string
  questionType: QuestionType
  points: number
  /** Points earned; null for short-text (part of the manual total). */
  awardedPoints: number | null
  correct: boolean
  autoGraded: boolean
  answerText: string | null
  options: StudentAnswerOption[]
}

export interface StudentAttemptReview {
  examId: string
  examTitle: string
  status: AttemptStatus
  score: number
  maxScore: number
  questions: StudentAnswerReview[]
}

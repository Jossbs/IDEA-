import type { AcademicLevel } from '@/features/subjects/types'

/** A single answer option within a question. */
export interface ExamOption {
  id: string
  text: string
  /** Whether this option is the correct answer (one per question). */
  isCorrect: boolean
}

/** A question (reactivo) with its answer options. */
export interface ExamQuestion {
  id: string
  text: string
  options: ExamOption[]
}

/** The full exam being authored. Local form state for now (no backend yet). */
export interface ExamDraft {
  title: string
  /** References a subject's identifier; empty until chosen. */
  subjectId: string
  level: AcademicLevel | ''
  questions: ExamQuestion[]
}

/** Minimum / default number of options a new question starts with. */
export const MIN_OPTIONS = 2
export const DEFAULT_OPTIONS = 4

export function createOption(isCorrect = false): ExamOption {
  return { id: crypto.randomUUID(), text: '', isCorrect }
}

export function createQuestion(): ExamQuestion {
  const options = Array.from({ length: DEFAULT_OPTIONS }, (_, i) => createOption(i === 0))
  return { id: crypto.randomUUID(), text: '', options }
}

export function createExamDraft(): ExamDraft {
  return { title: '', subjectId: '', level: '', questions: [createQuestion()] }
}

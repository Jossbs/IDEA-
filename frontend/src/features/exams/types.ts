/** Difficulty of a question — mirrors the dictionary's `difficulty_level`. */
export type DifficultyLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export const DIFFICULTY_LEVELS: DifficultyLevel[] = ['LOW', 'MEDIUM', 'HIGH']

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
}

/** A single answer option within a question. */
export interface ExamOption {
  id: string
  text: string
  /** Whether this option is the correct answer (one per question). */
  isCorrect: boolean
}

/**
 * A question (reactivo) with its answer options.
 *
 * Note: per the data dictionary, questions belong to a subject (a reusable
 * bank), not to the exam directly. We author them inline here for now and will
 * map them to the subject's bank + an exam-question link once the backend lands.
 */
export interface ExamQuestion {
  id: string
  text: string
  difficulty: DifficultyLevel
  options: ExamOption[]
}

/** The full exam being authored. Local form state for now (no backend yet). */
export interface ExamDraft {
  title: string
  /**
   * References a subject's identifier; empty until chosen. The academic level
   * is derived from the chosen subject (shown as "Física - Bachillerato"),
   * so the exam has no separate level field.
   */
  subjectId: string
  description: string
  /** Draft vs. published — maps to the dictionary's `is_published`. */
  isPublished: boolean
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
  return { id: crypto.randomUUID(), text: '', difficulty: 'MEDIUM', options }
}

export function createExamDraft(): ExamDraft {
  return {
    title: '',
    subjectId: '',
    description: '',
    isPublished: false,
    questions: [createQuestion()],
  }
}

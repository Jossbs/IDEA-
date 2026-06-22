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

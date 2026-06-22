/** Subjects domain types and UI labels. Mirrors the backend contract. */

export type AcademicLevel =
  | 'PRIMARY'
  | 'SECONDARY'
  | 'HIGH_SCHOOL'
  | 'UNIVERSITY'
  | 'POSTGRADUATE'

/** Spanish labels for the academic-level dropdown (code stays in English). */
export const ACADEMIC_LEVEL_LABELS: Record<AcademicLevel, string> = {
  PRIMARY: 'Primaria',
  SECONDARY: 'Secundaria',
  HIGH_SCHOOL: 'Bachillerato',
  UNIVERSITY: 'Universidad',
  POSTGRADUATE: 'Posgrado',
}

export const ACADEMIC_LEVELS = Object.keys(ACADEMIC_LEVEL_LABELS) as AcademicLevel[]

export type Subject = {
  subjectIdentifier: string
  subjectName: string
  academicLevel: AcademicLevel
  activeRecord: boolean
  creationTimestamp: string
  updateTimestamp: string
}

export type SubjectRequest = {
  subjectName: string
  academicLevel: AcademicLevel
}

/**
 * Predefined catalog of common subjects shown in the dropdown. Teachers pick
 * one of these or choose "Otro" to type a subject not listed here.
 */
export const SUBJECT_CATALOG = [
  'Matemáticas',
  'Física',
  'Química',
  'Biología',
  'Historia',
  'Geografía',
  'Lengua y Literatura',
  'Inglés',
  'Educación Física',
  'Informática',
  'Arte',
  'Música',
  'Filosofía',
  'Economía',
] as const

/** Sentinel value for the "Otro" (manual entry) option in the dropdown. */
export const SUBJECT_CATALOG_OTHER = '__OTHER__'

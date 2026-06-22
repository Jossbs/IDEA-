/** Auth domain types — mirror the backend contract (com.idea.auth). */

export type Role = 'TEACHER' | 'STUDENT'

export const ROLE_LABELS: Record<Role, string> = {
  TEACHER: 'Docente',
  STUDENT: 'Alumno',
}

export interface AuthUser {
  userId: string
  email: string
  fullName: string
  role: Role
}

/** POST /api/auth/login · /register · /refresh response. */
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  user: AuthUser
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  role: Role
}

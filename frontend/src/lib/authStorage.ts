/**
 * Token/session storage, decoupled from React so the `apiClient` can read and
 * refresh credentials outside the component tree. Persisted in localStorage so
 * a reload keeps the session. The React `AuthProvider` mirrors this into state.
 */
import type { AuthResponse, AuthUser } from '@/features/auth/types'

const ACCESS_KEY = 'idea.accessToken'
const REFRESH_KEY = 'idea.refreshToken'
const USER_KEY = 'idea.user'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

/** Persists the full session from an auth/refresh response. */
export function setSession(auth: AuthResponse): void {
  localStorage.setItem(ACCESS_KEY, auth.accessToken)
  localStorage.setItem(REFRESH_KEY, auth.refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user))
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

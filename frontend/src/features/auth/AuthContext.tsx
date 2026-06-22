import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '@/lib/apiClient'
import { clearSession, getStoredUser, setSession } from '@/lib/authStorage'
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from './types'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (request: LoginRequest) => Promise<AuthUser>
  register: (request: RegisterRequest) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Holds the authenticated user in React state, mirrored from localStorage so a
 * reload restores the session. Token plumbing lives in `apiClient`/`authStorage`;
 * this only exposes who is logged in and the login/register/logout actions.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser())

  const apply = useCallback((auth: AuthResponse): AuthUser => {
    setSession(auth)
    setUser(auth.user)
    return auth.user
  }, [])

  const login = useCallback(
    async (request: LoginRequest) => apply(await api.post<AuthResponse>('/auth/login', request)),
    [apply],
  )

  const register = useCallback(
    async (request: RegisterRequest) =>
      apply(await api.post<AuthResponse>('/auth/register', request)),
    [apply],
  )

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, login, register, logout }),
    [user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.')
  }
  return ctx
}

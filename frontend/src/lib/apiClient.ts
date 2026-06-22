/**
 * Thin fetch wrapper around the backend REST API.
 *
 * All calls are relative to `/api`, which the Vite dev proxy (and the Nginx
 * reverse-proxy in production) forward to the Spring Boot service. It attaches
 * the bearer access token, transparently refreshes it once on a 401 (with a
 * single-flight guard so concurrent requests share one refresh), and logs the
 * user out if the refresh fails. Errors are normalized from RFC-7807
 * ProblemDetail responses into a typed `ApiError`.
 */
import { clearSession, getAccessToken, getRefreshToken, setSession } from './authStorage'

const API_BASE = '/api'
const LOGIN_PATH = '/login'

export type FieldErrors = Record<string, string>

/** Error carrying the parsed ProblemDetail so the UI can show field-level hints. */
export class ApiError extends Error {
  status: number
  fieldErrors?: FieldErrors

  constructor(message: string, status: number, fieldErrors?: FieldErrors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

function isAuthEndpoint(path: string): boolean {
  return path.startsWith('/auth/')
}

// Single-flight refresh: concurrent 401s await the same in-flight refresh.
let refreshInFlight: Promise<boolean> | null = null

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        if (!res.ok) return false
        setSession(await res.json())
        return true
      } catch {
        return false
      }
    })().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

function forceLogout(): void {
  clearSession()
  if (typeof window !== 'undefined' && window.location.pathname !== LOGIN_PATH) {
    window.location.assign(LOGIN_PATH)
  }
}

async function parseError(response: Response): Promise<ApiError> {
  let detail = `Error ${response.status}`
  let fieldErrors: FieldErrors | undefined
  try {
    const body = await response.json()
    detail = body.detail ?? body.title ?? detail
    fieldErrors = body.errors
  } catch {
    /* non-JSON error body — keep the generic message */
  }
  return new ApiError(detail, response.status, fieldErrors)
}

async function send(path: string, options: RequestInit): Promise<Response> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  }
  if (token && !isAuthEndpoint(path)) {
    headers.Authorization = `Bearer ${token}`
  }
  return fetch(`${API_BASE}${path}`, { ...options, headers })
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response = await send(path, options)

  // Transparent refresh-and-retry on an expired/absent access token.
  if (response.status === 401 && !isAuthEndpoint(path)) {
    const refreshed = await refreshTokens()
    if (refreshed) {
      response = await send(path, options)
    } else {
      forceLogout()
      throw await parseError(response)
    }
  }

  if (!response.ok) {
    throw await parseError(response)
  }

  // 204 No Content and empty bodies have nothing to parse.
  if (response.status === 204) {
    return undefined as T
  }
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

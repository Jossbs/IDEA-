/**
 * Thin fetch wrapper around the backend REST API.
 *
 * All calls are relative to `/api`, which the Vite dev proxy (and the Nginx
 * reverse-proxy in production) forward to the Spring Boot service. Errors are
 * normalized from RFC-7807 ProblemDetail responses into a typed `ApiError`.
 */
const API_BASE = '/api'

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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  })

  if (!response.ok) {
    // ProblemDetail bodies are JSON; fall back gracefully if not.
    let detail = `Error ${response.status}`
    let fieldErrors: FieldErrors | undefined
    try {
      const body = await response.json()
      detail = body.detail ?? body.title ?? detail
      fieldErrors = body.errors
    } catch {
      /* non-JSON error body — keep the generic message */
    }
    throw new ApiError(detail, response.status, fieldErrors)
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

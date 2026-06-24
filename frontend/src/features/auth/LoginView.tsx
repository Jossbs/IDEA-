import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/design-system/components/Button'
import { TextField } from '@/design-system/components/Field'
import { ApiError } from '@/lib/apiClient'
import { AuthShell } from './AuthShell'
import { useAuth } from './AuthContext'

/** Email + password login. On success, returns to where the user came from. */
export function LoginView() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo iniciar sesión.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthShell
      title="Bienvenido de nuevo"
      subtitle="Inicia sesión para continuar en IDEA"
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-semibold text-secondary hover:underline">
            Crear cuenta
          </Link>
        </>
      }
    >
      <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Correo"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tucorreo@idea.edu"
          required
        />
        <TextField
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        {error && (
          <p
            role="alert"
            className="font-inter rounded-md border border-danger/20 bg-danger-bg px-3 py-2 text-sm text-danger-text"
          >
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={pending}>
          {pending ? 'Entrando…' : 'Iniciar sesión'}
        </Button>
      </form>
    </AuthShell>
  )
}

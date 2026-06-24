import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/design-system/components/Button'
import { CustomSelect } from '@/design-system/components/CustomSelect'
import { TextField } from '@/design-system/components/Field'
import { ApiError } from '@/lib/apiClient'
import { AuthShell } from './AuthShell'
import { useAuth } from './AuthContext'
import { ROLE_LABELS } from './types'
import type { Role } from './types'

const ROLES: Role[] = ['TEACHER', 'STUDENT']

/** Open self-registration: the user picks their own role (teacher or student). */
export function RegisterView() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('TEACHER')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setPending(true)
    try {
      await register({ fullName, email, password, role })
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        setFieldErrors(err.fieldErrors ?? {})
      } else {
        setError('No se pudo crear la cuenta.')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Regístrate para empezar a usar IDEA"
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            Iniciar sesión
          </Link>
        </>
      }
    >
      <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Nombre completo"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={fieldErrors.fullName}
          placeholder="Ej. Ana Sofía Ramírez"
          required
        />
        <TextField
          label="Correo"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          placeholder="tucorreo@idea.edu"
          required
        />
        <TextField
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          placeholder="Mínimo 8 caracteres"
          required
        />
        <CustomSelect
          label="Soy…"
          value={role}
          onChange={(value) => setRole(value as Role)}
          error={fieldErrors.role}
          options={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
        />

        {error && (
          <p
            role="alert"
            className="rounded-md border border-danger/20 bg-danger-bg px-3 py-2 text-sm text-danger-text"
          >
            {error}
          </p>
        )}

        <Button type="submit" variant="accent" size="lg" fullWidth disabled={pending}>
          {pending ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthShell>
  )
}

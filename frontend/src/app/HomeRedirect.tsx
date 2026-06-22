import { Navigate } from 'react-router-dom'
import { Card } from '@/design-system/components/Card'
import { useAuth } from '@/features/auth/AuthContext'

/**
 * Index landing. Teachers go straight to their workspace; students get a
 * placeholder until their exam area lands (next milestone: attempts module).
 */
export function HomeRedirect() {
  const { user } = useAuth()

  if (user?.role === 'TEACHER') {
    return <Navigate to="/subjects" replace />
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card className="grid gap-3 text-center shadow-sm">
        <h1 className="font-nunito text-2xl font-extrabold text-secondary">
          ¡Hola, {user?.fullName}!
        </h1>
        <p className="font-inter text-secondary/70">
          Tu panel de alumno estará disponible muy pronto. Cuando un docente te asigne un examen,
          podrás resolverlo desde aquí.
        </p>
      </Card>
    </div>
  )
}

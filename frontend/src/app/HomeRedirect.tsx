import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { StudentHomeView } from '@/features/student/StudentHomeView'

/**
 * Index landing. Teachers go straight to their workspace; students see their
 * available-exams dashboard.
 */
export function HomeRedirect() {
  const { user } = useAuth()

  if (user?.role === 'TEACHER') {
    return <Navigate to="/subjects" replace />
  }
  return <StudentHomeView />
}

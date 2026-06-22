import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import type { Role } from '@/features/auth/types'

/**
 * Route guard used as a layout element. Redirects unauthenticated users to
 * `/login` (remembering where they came from), and—if a `role` is required—
 * sends authenticated-but-wrong-role users back to the home redirect.
 */
export function RequireAuth({ role }: { role?: Role }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (role && user.role !== role) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

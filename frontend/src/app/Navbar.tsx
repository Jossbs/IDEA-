import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { ROLE_LABELS } from '@/features/auth/types'
import { cn } from '@/lib/cn'

type NavItem = { label: string; to: string }

/** Teacher workspace modules (students don't see these). */
const teacherNav: NavItem[] = [
  { label: 'Materias', to: '/subjects' },
  { label: 'Exámenes', to: '/exams' },
]

const linkBase = 'font-inter pb-1 text-base font-medium text-white border-b-2 transition-opacity'

/**
 * Top navigation bar. Slate-blue (`primary`) band with the brand on the left,
 * role-aware module links, and the signed-in user with a sign-out action.
 *
 * The PNG logo is dark artwork, so it sits inside a white rounded chip to keep
 * strong contrast against the dark navbar (accessibility).
 */
export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const navItems = user?.role === 'TEACHER' ? teacherNav : []

  return (
    <header className="bg-primary shadow-card">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-6 py-3 md:px-10">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="inline-flex rounded-lg bg-white p-1.5 shadow-sm">
            <img src="/logo.png" alt="Logotipo de IDEA" className="h-12 w-auto md:h-14" />
          </span>
          <div className="leading-tight">
            <p className="font-nunito text-xl font-extrabold text-white">IDEA</p>
            <p className="font-inter text-xs text-white/80">
              Interfaz Digital para la Evaluación Académica
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="ml-auto flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  linkBase,
                  isActive
                    ? 'border-accent opacity-100'
                    : 'border-transparent opacity-80 hover:opacity-100',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Signed-in user */}
        {user && (
          <div className="flex items-center gap-3 border-l border-white/20 pl-4">
            <div className="hidden text-right leading-tight sm:block">
              <p className="font-inter text-sm font-semibold text-white">{user.fullName}</p>
              <p className="font-inter text-xs text-white/70">{ROLE_LABELS[user.role]}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="font-inter rounded-lg border border-white/30 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

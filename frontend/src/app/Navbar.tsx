import { NavLink, useNavigate } from 'react-router-dom'
import { BrandLockup } from '@/design-system/BrandLockup'
import { useAuth } from '@/features/auth/AuthContext'
import { ROLE_LABELS } from '@/features/auth/types'
import { cn } from '@/lib/cn'

type NavItem = { label: string; to: string }

/** Teacher workspace modules (students don't see these). */
const teacherNav: NavItem[] = [
  { label: 'Materias', to: '/subjects' },
  { label: 'Exámenes', to: '/exams' },
]

const linkBase =
  'font-sans pb-1 text-sm md:text-base font-medium border-b-2 transition-colors'

/**
 * Top navigation bar. A clean white (`surface`) band with a subtle bottom
 * border carries the navy IDEA lockup on the left, role-aware module links,
 * and the signed-in user with a sign-out action.
 *
 * The brand is an inline SVG (navy + cyan on transparent) shown directly on
 * the light surface — no chip needed. Its container fixes the height and
 * preserves the 350:100 aspect ratio so the mark scales responsively.
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
    <header className="bg-surface border-b border-subtle">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 md:gap-4 md:px-10">
        {/* Brand — responsive SVG lockup, height-driven, aspect-locked */}
        <NavLink to="/" className="block h-9 shrink-0 aspect-[350/100] sm:h-10 md:h-12">
          <BrandLockup />
        </NavLink>

        {/* Navigation */}
        <nav className="ml-auto flex items-center gap-4 md:gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  linkBase,
                  isActive
                    ? 'border-accent text-primary'
                    : 'border-transparent text-muted hover:text-main',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Signed-in user */}
        {user && (
          <div className="flex items-center gap-3 border-l border-subtle pl-3 md:pl-4">
            <div className="hidden text-right leading-tight sm:block">
              <p className="font-sans text-sm font-semibold text-main">{user.fullName}</p>
              <p className="font-sans text-xs text-muted">{ROLE_LABELS[user.role]}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="font-sans rounded-md border border-focus px-3 py-1.5 text-sm font-medium text-main transition-colors hover:bg-app focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

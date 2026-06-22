import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'

type NavItem = { label: string; to: string; ready: boolean }

const navItems: NavItem[] = [
  { label: 'Materias', to: '/subjects', ready: true },
  { label: 'Exámenes', to: '/exams', ready: false },
  { label: 'Bancos de Preguntas', to: '/question-banks', ready: false },
  { label: 'Reportes', to: '/reports', ready: false },
]

const linkBase = 'font-inter pb-1 text-base font-medium text-white border-b-2 transition-opacity'

/**
 * Top navigation bar. Slate-blue (`primary`) band with the prominent brand logo
 * on the left and the module links on the right — active tab underlined in
 * terracotta (`accent`).
 *
 * The PNG logo is dark artwork, so it sits inside a white rounded chip to keep
 * strong contrast against the dark navbar (accessibility). Modules not built yet
 * render as inert labels until their routes exist.
 */
export function Navbar() {
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
          {navItems.map((item) =>
            item.ready ? (
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
            ) : (
              <span
                key={item.to}
                title="Próximamente"
                className={cn(linkBase, 'cursor-default border-transparent opacity-60')}
              >
                {item.label}
              </span>
            ),
          )}
        </nav>
      </div>
    </header>
  )
}

import type { ReactNode } from 'react'
import { BrandLockup } from '@/design-system/BrandLockup'

/** Centered, distraction-free shell for the login/register screens. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-app px-4 py-10">
      {/* Full width with side margins on mobile; capped on larger screens. */}
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          {/* Brand lockup, height-driven + aspect-locked, centered over the card. */}
          <div className="h-16 w-auto aspect-[350/100]">
            <BrandLockup />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-main">{title}</h1>
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
          </div>
        </div>

        {/* Surface card: hairline border + soft elevation, generous padding. */}
        <div className="rounded-lg border border-subtle bg-surface p-8 shadow-lg">{children}</div>

        <p className="mt-6 text-center text-sm text-muted">{footer}</p>
      </div>
    </main>
  )
}

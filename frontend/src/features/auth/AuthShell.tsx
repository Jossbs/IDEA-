import type { ReactNode } from 'react'
import { Card } from '@/design-system/components/Card'

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
    <main className="flex min-h-screen items-center justify-center bg-base px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="inline-flex rounded-xl bg-white p-2 shadow-sm">
            <img src="/logo.png" alt="Logotipo de IDEA" className="h-14 w-auto" />
          </span>
          <div>
            <h1 className="font-nunito text-2xl font-extrabold text-secondary">{title}</h1>
            <p className="font-inter mt-1 text-sm text-secondary/70">{subtitle}</p>
          </div>
        </div>

        <Card className="shadow-card">{children}</Card>

        <p className="font-inter mt-6 text-center text-sm text-secondary/70">{footer}</p>
      </div>
    </main>
  )
}

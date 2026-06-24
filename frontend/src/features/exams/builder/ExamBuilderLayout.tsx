import type { ReactNode } from 'react'
import { Button } from '@/design-system/components/Button'
import { CheckCircleIcon, ChevronLeftIcon, EyeIcon, SendIcon } from '@/design-system/icons'

type ExamBuilderLayoutProps = {
  title: string
  onTitleChange: (value: string) => void
  onBack?: () => void
  onPreview?: () => void
  onPublish?: () => void
  children: ReactNode
}

/**
 * Full-screen builder shell. A sticky `surface` top bar (back · editable title ·
 * autosave status · preview/publish) floats over an `app`-tinted canvas whose
 * content column is centered and capped at 800px for a focused, Notion-like feel.
 */
export function ExamBuilderLayout({
  title,
  onTitleChange,
  onBack,
  onPreview,
  onPublish,
  children,
}: ExamBuilderLayoutProps) {
  return (
    <div className="min-h-screen bg-app">
      <header className="sticky top-0 z-20 border-b border-subtle bg-surface shadow-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-2.5 md:px-6">
          {/* Back */}
          <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0 px-2">
            <ChevronLeftIcon />
            <span className="hidden sm:inline">Volver</span>
          </Button>

          {/* Editable exam title */}
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            aria-label="Título del examen"
            placeholder="Examen sin título"
            className="min-w-0 flex-1 truncate rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-main transition-colors placeholder:text-muted hover:border-subtle focus:border-secondary focus:bg-surface focus:outline-none md:text-base"
          />

          {/* Autosave status */}
          <span className="hidden shrink-0 items-center gap-1.5 text-xs font-medium text-muted sm:inline-flex">
            <CheckCircleIcon className="size-4 text-success-text" />
            Autoguardado
          </span>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onPreview}>
              <EyeIcon />
              <span className="hidden md:inline">Vista previa</span>
            </Button>
            <Button variant="accent" size="sm" onClick={onPublish}>
              <SendIcon />
              Publicar
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[800px] px-4 py-8 md:py-10">{children}</main>
    </div>
  )
}

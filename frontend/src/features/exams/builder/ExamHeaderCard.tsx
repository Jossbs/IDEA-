import { AutoGrowTextarea } from './AutoGrowTextarea'

type ExamHeaderCardProps = {
  title: string
  onTitleChange: (value: string) => void
  description?: string
  onDescriptionChange?: (value: string) => void
}

/**
 * Intro card at the top of the canvas. Borderless inputs that read as plain
 * text until focused — a large `main` title (H1) and a `muted` description —
 * with a thin `secondary` accent on top echoing Google-Forms style.
 */
export function ExamHeaderCard({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
}: ExamHeaderCardProps) {
  return (
    <section className="mb-6 overflow-hidden rounded-md border border-subtle bg-surface shadow-sm">
      <div className="h-1.5 bg-secondary" />
      <div className="p-6">
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          aria-label="Título del examen"
          placeholder="Título del examen"
          className="w-full border-0 border-b-2 border-transparent bg-transparent pb-1 text-2xl font-bold text-main transition-colors placeholder:text-muted/60 focus:border-secondary focus:outline-none md:text-3xl"
        />
        <AutoGrowTextarea
          value={description}
          onChange={(e) => onDescriptionChange?.(e.target.value)}
          aria-label="Descripción o instrucciones"
          placeholder="Descripción o instrucciones para el alumno…"
          className="mt-3 border-b-2 border-transparent pb-1 text-base text-muted transition-colors placeholder:text-muted/60 focus:border-subtle"
        />
      </div>
    </section>
  )
}

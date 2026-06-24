import { useState } from 'react'
import { CopyIcon, GripVerticalIcon, TrashIcon } from '@/design-system/icons'
import { AutoGrowTextarea } from './AutoGrowTextarea'

type QuestionType = 'multiple' | 'open'

type QuestionCardProps = {
  /** 1-based position, rendered as the question label. */
  index: number
  defaultPrompt?: string
  defaultType?: QuestionType
  defaultPoints?: number
  defaultRequired?: boolean
  onDuplicate?: () => void
  onDelete?: () => void
}

/** Small accessible on/off switch tied to the question's "required" flag. */
function RequiredToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-secondary' : 'bg-subtle'
      }`}
    >
      <span
        className={`inline-block size-4 transform rounded-full bg-surface shadow-sm transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

/** Placeholder for the (yet-to-be-built) answer editor, by question type. */
function OptionsPlaceholder({ type }: { type: QuestionType }) {
  if (type === 'open') {
    return (
      <div className="mt-4 rounded-md border border-dashed border-subtle px-3 py-3 text-sm text-muted">
        Respuesta abierta del alumno
      </div>
    )
  }
  return (
    <ul className="mt-4 space-y-2">
      {['Opción 1', 'Opción 2'].map((label) => (
        <li key={label} className="flex items-center gap-2 text-sm text-muted">
          <span className="size-4 shrink-0 rounded-full border border-subtle" />
          {label}
        </li>
      ))}
      <li className="flex items-center gap-2 text-sm text-muted/70">
        <span className="size-4 shrink-0 rounded-full border border-dashed border-subtle" />
        Agregar opción
      </li>
    </ul>
  )
}

/**
 * Independent question card (mockup). Draggable header with a native type
 * <select>, an auto-growing prompt, a per-type answer placeholder, and a footer
 * (points · required toggle · duplicate/delete) split off by a subtle divider.
 */
export function QuestionCard({
  index,
  defaultPrompt = '',
  defaultType = 'multiple',
  defaultPoints = 1,
  defaultRequired = true,
  onDuplicate,
  onDelete,
}: QuestionCardProps) {
  const [type, setType] = useState<QuestionType>(defaultType)
  const [points, setPoints] = useState(defaultPoints)
  const [required, setRequired] = useState(defaultRequired)

  return (
    <article className="mb-4 rounded-md border border-subtle bg-surface p-5 shadow-sm transition-shadow focus-within:border-secondary hover:shadow-md">
      {/* Header: drag handle + type select */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-muted">
          <button
            type="button"
            aria-label="Reordenar pregunta"
            className="cursor-grab rounded p-1 hover:bg-app hover:text-main active:cursor-grabbing"
          >
            <GripVerticalIcon className="size-5" />
          </button>
          <span className="text-sm font-semibold text-main">Pregunta {index}</span>
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as QuestionType)}
          aria-label="Tipo de pregunta"
          className="rounded-md border border-subtle bg-surface px-3 py-1.5 text-sm text-main transition-colors focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30"
        >
          <option value="multiple">Opción Múltiple</option>
          <option value="open">Abierta</option>
        </select>
      </div>

      {/* Body: prompt + answer placeholder */}
      <div className="mt-4">
        <AutoGrowTextarea
          defaultValue={defaultPrompt}
          aria-label={`Enunciado de la pregunta ${index}`}
          placeholder="Escribe la pregunta…"
          className="border-b-2 border-transparent pb-1 text-lg text-main transition-colors placeholder:text-muted/60 focus:border-secondary"
        />
        <OptionsPlaceholder type={type} />
      </div>

      {/* Footer: points · required · actions */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-subtle pt-4">
        <label className="flex items-center gap-2 text-sm text-muted">
          <span className="font-medium text-main">Puntos</span>
          <input
            type="number"
            min={0}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="w-16 rounded-md border border-subtle bg-surface px-2 py-1 text-sm text-main focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30"
          />
        </label>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-muted">
            <span className="font-medium text-main">Obligatorio</span>
            <RequiredToggle checked={required} onChange={setRequired} />
          </label>

          <div className="flex items-center gap-1 border-l border-subtle pl-3">
            <button
              type="button"
              onClick={onDuplicate}
              aria-label="Duplicar pregunta"
              className="rounded-md p-2 text-muted transition-colors hover:bg-app hover:text-main"
            >
              <CopyIcon />
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label="Eliminar pregunta"
              className="rounded-md p-2 text-muted transition-colors hover:bg-danger-bg hover:text-danger-text"
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

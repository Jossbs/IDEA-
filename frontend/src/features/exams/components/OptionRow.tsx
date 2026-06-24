import { XIcon } from '@/design-system/icons'
import { cn } from '@/lib/cn'
import type { ExamOption } from '../types'

type OptionRowProps = {
  option: ExamOption
  index: number
  /** Radio group name — the owning question id, so radios are grouped per question. */
  groupName: string
  /** 'single' → radio (one correct); 'multiple' → checkbox (many correct). */
  mode: 'single' | 'multiple'
  /** False for fixed options (Verdadero/Falso), which can't be retyped. */
  editableText: boolean
  canRemove: boolean
  onTextChange: (text: string) => void
  onMarkCorrect: () => void
  onRemove: () => void
}

/**
 * One answer option: a "correct answer" control (radio for single-choice,
 * checkbox for multiple-choice), the answer text input, and a subtle
 * remove-option icon button.
 */
export function OptionRow({
  option,
  index,
  groupName,
  mode,
  editableText,
  canRemove,
  onTextChange,
  onMarkCorrect,
  onRemove,
}: OptionRowProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors',
        option.isCorrect
          ? 'border-success-text/50 bg-success-bg/40'
          : 'border-subtle bg-surface hover:border-focus',
      )}
    >
      <input
        type={mode === 'multiple' ? 'checkbox' : 'radio'}
        name={mode === 'multiple' ? undefined : groupName}
        checked={option.isCorrect}
        onChange={onMarkCorrect}
        aria-label={`Marcar la opción ${index + 1} como correcta`}
        className="size-4 shrink-0 accent-success"
      />
      <input
        type="text"
        value={option.text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={`Opción ${index + 1}`}
        readOnly={!editableText}
        className={cn(
          'font-inter flex-1 bg-transparent text-main outline-none placeholder:text-muted/70',
          !editableText && 'cursor-default text-muted',
        )}
      />
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Eliminar opción ${index + 1}`}
          title="Eliminar opción"
          className="shrink-0 rounded-md p-0.5 text-muted opacity-0 transition-all hover:text-danger-text focus-visible:opacity-100 group-hover:opacity-100"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  )
}

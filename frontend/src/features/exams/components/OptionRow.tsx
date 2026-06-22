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
        'flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors',
        option.isCorrect ? 'border-success/40 bg-success/5' : 'border-secondary/15 bg-white',
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
          'font-inter flex-1 bg-transparent text-secondary outline-none placeholder:text-secondary/40',
          !editableText && 'cursor-default text-secondary/70',
        )}
      />
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Eliminar opción ${index + 1}`}
          title="Eliminar opción"
          className="text-secondary/50 transition-colors hover:text-accent"
        >
          <XIcon />
        </button>
      )}
    </div>
  )
}

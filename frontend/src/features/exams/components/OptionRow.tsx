import { XIcon } from '@/design-system/icons'
import { cn } from '@/lib/cn'
import type { ExamOption } from '../types'

type OptionRowProps = {
  option: ExamOption
  index: number
  /** Radio group name — the owning question id, so one option is correct per question. */
  groupName: string
  canRemove: boolean
  onTextChange: (text: string) => void
  onMarkCorrect: () => void
  onRemove: () => void
}

/**
 * One answer option: a "correct answer" radio (sage green when selected),
 * the answer text input, and a subtle remove-option icon button.
 */
export function OptionRow({
  option,
  index,
  groupName,
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
        type="radio"
        name={groupName}
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
        className="font-inter flex-1 bg-transparent text-secondary outline-none placeholder:text-secondary/40"
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        aria-label={`Eliminar opción ${index + 1}`}
        title="Eliminar opción"
        className="text-secondary/50 transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-secondary/50"
      >
        <XIcon />
      </button>
    </div>
  )
}

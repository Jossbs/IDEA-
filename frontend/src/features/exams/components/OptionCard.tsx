import { CheckIcon } from '@/design-system/icons'
import { cn } from '@/lib/cn'

type OptionCardProps = {
  /** Badge shown at the left: a letter (A, B, C…) when unselected. */
  label: string
  text: string
  selected: boolean
  /** Checkbox semantics (square badge) vs. radio semantics (round badge). */
  multiple: boolean
  onSelect: () => void
}

/**
 * Full-area clickable answer card for the student runner — replaces the bare
 * radio/checkbox. Three states, all on the slate-blue (primary) axis:
 *
 *  · Default   white surface, hairline border
 *  · Hover     lifts (shadow-md), subtle translate, primary-tinted border
 *  · Selected  translucent primary fill, thick primary border, check fades in
 *
 * Kept presentational so the same card serves single, multiple and true/false.
 */
export function OptionCard({ label, text, selected, multiple, onSelect }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      role={multiple ? 'checkbox' : 'radio'}
      aria-checked={selected}
      className={cn(
        'group relative flex w-full items-center gap-4 rounded-xl bg-surface p-4 text-left',
        'cursor-pointer transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-app',
        // border-2 in both states keeps the box steady (no 1px reflow on select).
        selected
          ? 'border-2 border-primary bg-primary/5 shadow-sm'
          : 'border-2 border-subtle hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md',
      )}
    >
      {/* Letter badge → fills with primary once chosen. */}
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center text-sm font-bold transition-colors duration-200',
          multiple ? 'rounded-lg' : 'rounded-full',
          selected
            ? 'bg-primary text-white'
            : 'bg-main/5 text-muted group-hover:bg-primary/10 group-hover:text-primary',
        )}
      >
        {label}
      </span>

      <span
        className={cn(
          'font-inter flex-1 text-base leading-snug transition-colors',
          selected ? 'font-semibold text-main' : 'text-main',
        )}
      >
        {text}
      </span>

      {/* Check appears softly on the right when the card is selected. */}
      <span
        aria-hidden="true"
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-all duration-200 ease-out',
          selected ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
        )}
      >
        <CheckIcon className="size-4" />
      </span>
    </button>
  )
}

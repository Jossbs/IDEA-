import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { CheckIcon, ChevronDownIcon } from '@/design-system/icons'

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

type CustomSelectProps = {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Optional label + inline error, mirroring the design-system Field layout. */
  label?: string
  error?: string
  disabled?: boolean
  autoFocus?: boolean
  id?: string
  className?: string
}

/** Index of the next non-disabled option in `dir` (+1 / -1), wrapping around. */
function nextEnabled(options: SelectOption[], from: number, dir: 1 | -1): number {
  const n = options.length
  if (n === 0) return -1
  let i = from
  for (let step = 0; step < n; step++) {
    i = (i + dir + n) % n
    if (!options[i].disabled) return i
  }
  return from
}

/**
 * Accessible, design-system styled dropdown that replaces native `<select>`
 * (whose OS hover/focus chrome clashes with the IDEA look). Keyboard-driven
 * (↑/↓/Enter/Esc), closes on outside click, and themes hover to `primary`.
 *
 * Controlled via `value`/`onChange`. Pass `label`/`error` to render it inside a
 * form exactly like `Field` does.
 */
export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecciona…',
  label,
  error,
  disabled,
  autoFocus,
  id,
  className,
}: CustomSelectProps) {
  const reactId = useId()
  const controlId = id ?? reactId
  const listboxId = `${controlId}-listbox`

  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLLIElement | null>>([])

  const selected = options.find((o) => o.value === value)

  // Close when clicking outside the component.
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  // Keep the highlighted option scrolled into view.
  useEffect(() => {
    if (open && activeIndex >= 0) {
      optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [open, activeIndex])

  function openMenu() {
    if (disabled) return
    const selectedIndex = options.findIndex((o) => o.value === value)
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : nextEnabled(options, -1, 1))
    setOpen(true)
  }

  function closeMenu() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function commit(index: number) {
    const opt = options[index]
    if (!opt || opt.disabled) return
    onChange(opt.value)
    closeMenu()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openMenu()
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => nextEnabled(options, i, 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => nextEnabled(options, i, -1))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        commit(activeIndex)
        break
      case 'Escape':
        e.preventDefault()
        closeMenu()
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div className={cn(label && 'grid gap-1.5', className)}>
      {label && (
        <label htmlFor={controlId} className="text-sm font-medium text-main">
          {label}
        </label>
      )}

      <div ref={containerRef} className="relative">
        <button
          ref={triggerRef}
          id={controlId}
          type="button"
          disabled={disabled}
          autoFocus={autoFocus}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-md border bg-surface px-3 py-2 text-left text-main transition-colors',
            'focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            open
              ? 'border-primary ring-2 ring-primary'
              : error
                ? 'border-danger'
                : 'border-subtle hover:border-focus',
          )}
        >
          <span className={cn('truncate', !selected && 'text-muted')}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDownIcon
            className={cn('size-4 shrink-0 text-muted transition-transform', open && 'rotate-180')}
          />
        </button>

        {open && (
          <ul
            id={listboxId}
            role="listbox"
            aria-activedescendant={activeIndex >= 0 ? `${controlId}-opt-${activeIndex}` : undefined}
            className="scrollbar-thin absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-md border border-subtle bg-surface py-1 shadow-lg"
          >
            {options.map((opt, index) => {
              const isSelected = opt.value === value
              const isActive = index === activeIndex
              return (
                <li
                  key={opt.value}
                  ref={(el) => {
                    optionRefs.current[index] = el
                  }}
                  id={`${controlId}-opt-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled}
                  onMouseEnter={() => !opt.disabled && setActiveIndex(index)}
                  onClick={() => commit(index)}
                  className={cn(
                    'flex items-center justify-between gap-2 px-3 py-2 text-main',
                    opt.disabled
                      ? 'cursor-not-allowed text-muted/60'
                      : 'cursor-pointer',
                    isActive && !opt.disabled && 'bg-primary/5 font-medium text-primary',
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <CheckIcon className="size-4 shrink-0 text-primary" />}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {error && <span className="text-sm text-danger-text">{error}</span>}
    </div>
  )
}

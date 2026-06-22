import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const controlClasses =
  'w-full rounded-lg border bg-surface px-3 py-2 text-base text-secondary ' +
  'transition-colors duration-150 placeholder:text-secondary/40 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-surface'

function fieldBorder(hasError: boolean): string {
  return hasError
    ? 'border-danger focus-visible:ring-danger'
    : 'border-secondary/20 focus-visible:ring-accent'
}

type LabelWrapProps = {
  label: string
  error?: string
  children: ReactNode
}

/** Label + control + inline error, stacked vertically. */
function LabelWrap({ label, error, children }: LabelWrapProps) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-secondary/70">{label}</span>
      {children}
      {error && <span className="text-sm text-danger">{error}</span>}
    </label>
  )
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export function TextField({ label, error, className, ...props }: TextFieldProps) {
  return (
    <LabelWrap label={label} error={error}>
      <input className={cn(controlClasses, fieldBorder(Boolean(error)), className)} {...props} />
    </LabelWrap>
  )
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
}

export function SelectField({ label, error, className, children, ...props }: SelectFieldProps) {
  return (
    <LabelWrap label={label} error={error}>
      <select className={cn(controlClasses, fieldBorder(Boolean(error)), className)} {...props}>
        {children}
      </select>
    </LabelWrap>
  )
}

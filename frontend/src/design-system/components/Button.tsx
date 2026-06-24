import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-md font-sans font-semibold ' +
  'transition-colors duration-150 select-none cursor-pointer ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-app ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'

const variantClasses: Record<ButtonVariant, string> = {
  // Navy — saving actions & navigation.
  primary:
    'bg-primary text-white hover:bg-primary-hover active:bg-primary-active focus-visible:ring-primary',
  // Cyan — primary CTAs ("Crear Examen", confirm).
  accent:
    'bg-secondary text-white hover:bg-secondary-hover active:bg-secondary-active focus-visible:ring-secondary',
  // Neutral outline — secondary actions on a surface.
  secondary:
    'bg-surface text-main border border-subtle hover:bg-app hover:border-focus active:bg-subtle/60 focus-visible:ring-focus',
  danger: 'bg-danger text-white hover:brightness-95 active:brightness-90 focus-visible:ring-danger',
  ghost:
    'bg-transparent text-main hover:bg-app active:bg-subtle/60 focus-visible:ring-focus',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-base',
  lg: 'h-12 px-6 text-lg',
}

/**
 * Reusable design-system button.
 * Enforces the 60-30-10 hierarchy with accessible :hover/:focus-visible/:active states.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', fullWidth = false, className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    />
  )
})

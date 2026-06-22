import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/**
 * Elevated surface container. Pure-white card lifted off the oat-white base
 * with a subtle shadow; generous default padding.
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-secondary/10 bg-surface p-6 shadow-card',
        className,
      )}
      {...props}
    />
  )
}

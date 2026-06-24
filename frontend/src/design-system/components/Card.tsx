import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/**
 * Elevated surface container. Pure-white card lifted off the app background
 * with a hairline `subtle` border and a light shadow; generous default padding.
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-subtle bg-surface p-6 shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

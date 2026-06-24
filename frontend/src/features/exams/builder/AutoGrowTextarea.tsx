import { useEffect, useRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/**
 * Borderless textarea that grows with its content (single line by default).
 * Used by the builder canvas for title/description and question prompts so
 * the editor reads like a document rather than a form.
 */
export function AutoGrowTextarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null)

  function resize(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  // Fit the initial content (uncontrolled defaultValue) once mounted.
  useEffect(() => {
    if (ref.current) resize(ref.current)
  }, [])

  return (
    <textarea
      ref={ref}
      rows={1}
      onInput={(e) => resize(e.currentTarget)}
      className={cn('w-full resize-none overflow-hidden bg-transparent outline-none', className)}
      {...props}
    />
  )
}

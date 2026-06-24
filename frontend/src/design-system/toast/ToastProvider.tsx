import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { CheckCircleIcon, XIcon } from '@/design-system/icons'

type ToastVariant = 'success' | 'error' | 'info'
type Toast = { id: number; message: string; variant: ToastVariant }

type ToastApi = {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'border-success/30 bg-success-bg text-success-text',
  error: 'border-danger/30 bg-danger-bg text-danger-text',
  info: 'border-info/30 bg-info-bg text-info-text',
}

const AUTO_DISMISS_MS = 3500

/**
 * Lightweight, dependency-free toast system. Wrap the app once; read it with
 * `useToast()`. Toasts stack in the bottom-right corner and auto-dismiss.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const remove = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (message: string, variant: ToastVariant) => {
      const id = nextId.current++
      setToasts((list) => [...list, { id, message, variant }])
      window.setTimeout(() => remove(id), AUTO_DISMISS_MS)
    },
    [remove],
  )

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push(m, 'success'),
      error: (m) => push(m, 'error'),
      info: (m) => push(m, 'info'),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-xs flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              role="status"
              className={cn(
                'animate-fade-slide-up pointer-events-auto flex items-start gap-2 rounded-md border px-3 py-2.5 text-sm font-medium shadow-lg',
                VARIANT_STYLES[toast.variant],
              )}
            >
              {toast.variant === 'success' && <CheckCircleIcon className="mt-0.5 size-4 shrink-0" />}
              <span className="flex-1">{toast.message}</span>
              <button
                type="button"
                onClick={() => remove(toast.id)}
                aria-label="Cerrar notificación"
                className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

/** Access the toast API. Must be called under a <ToastProvider>. */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}

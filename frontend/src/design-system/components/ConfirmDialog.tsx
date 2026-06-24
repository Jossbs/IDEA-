import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'

type ConfirmDialogProps = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  /** Disables both actions and shows a busy label while the action runs. */
  pending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Centered confirmation modal over a dimmed backdrop. Rendered through a portal
 * so it escapes any stacking/overflow context. The parent controls visibility
 * by mounting/unmounting it. Cancels on backdrop click or Escape.
 */
export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-main/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onCancel}
    >
      <div
        className="animate-pop-in w-full max-w-sm rounded-lg border border-subtle bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-lg font-bold text-main">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm text-muted">{description}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={pending}>
            {pending ? 'Eliminando…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface ServiceDialogShellProps {
  open: boolean
  pending?: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  footer: ReactNode
}

export function ServiceDialogShell({
  open,
  pending = false,
  title,
  description,
  onClose,
  children,
  footer,
}: ServiceDialogShellProps) {
  const { t } = useTranslation('adminServices')
  const titleId = useId()
  const descId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement as HTMLElement | null
    const focusable = dialogRef.current?.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
    )
    focusable?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !pending) {
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused.current?.focus()
    }
  }, [open, pending, onClose])

  if (!open) return null

  return (
    <div className="service-dialog-root">
      <button
        type="button"
        className="service-dialog__backdrop"
        aria-label={t('close')}
        disabled={pending}
        onClick={() => {
          if (!pending) onClose()
        }}
      />
      <div
        ref={dialogRef}
        className="service-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
      >
        <div className="service-dialog__header">
          <h2 id={titleId}>{title}</h2>
          {description ? <p id={descId}>{description}</p> : null}
        </div>
        <div className="service-dialog__body">{children}</div>
        <div className="service-dialog__footer">{footer}</div>
      </div>
    </div>
  )
}

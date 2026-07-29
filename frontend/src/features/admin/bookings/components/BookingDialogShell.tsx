import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface BookingDialogShellProps {
  open: boolean
  pending?: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  footer: ReactNode
}

export function BookingDialogShell({
  open,
  pending = false,
  title,
  description,
  onClose,
  children,
  footer,
}: BookingDialogShellProps) {
  const { t } = useTranslation('adminBookings')
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
    <div className="booking-dialog-root">
      <button
        type="button"
        className="booking-dialog__backdrop"
        aria-label={t('close')}
        disabled={pending}
        onClick={() => {
          if (!pending) onClose()
        }}
      />
      <div
        ref={dialogRef}
        className="booking-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
      >
        <div className="booking-dialog__header">
          <h2 id={titleId}>{title}</h2>
          {description ? <p id={descId}>{description}</p> : null}
        </div>
        <div className="booking-dialog__body">{children}</div>
        <div className="booking-dialog__footer">{footer}</div>
      </div>
    </div>
  )
}

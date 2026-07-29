import { useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'

interface BookingCancelDialogProps {
  open: boolean
  pending: boolean
  errorMessage?: string | null
  requestId?: string | null
  onConfirm: () => void
  onClose: () => void
}

export function BookingCancelDialog({
  open,
  pending,
  errorMessage,
  requestId,
  onConfirm,
  onClose,
}: BookingCancelDialogProps) {
  const { t } = useTranslation('bookings')
  const titleId = useId()
  const descId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement as HTMLElement | null
    cancelRef.current?.focus()

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
        aria-label={t('cancelDialogDismiss')}
        disabled={pending}
        onClick={() => {
          if (!pending) onClose()
        }}
      />
      <div
        className="booking-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <h2 id={titleId}>{t('cancelDialogTitle')}</h2>
        <p id={descId}>{t('cancelDialogDescription')}</p>

        {errorMessage ? (
          <div className="booking-form-error" role="alert">
            <p>{errorMessage}</p>
            {requestId ? (
              <p className="booking-form-error__meta">
                {t('requestId')}: <code>{requestId}</code>
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="booking-dialog__actions">
          <Button
            ref={cancelRef}
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={onClose}
          >
            {t('cancelDialogKeep')}
          </Button>
          <Button type="button" disabled={pending} onClick={onConfirm}>
            {pending ? t('cancelling') : t('cancelConfirm')}
          </Button>
        </div>
      </div>
    </div>
  )
}

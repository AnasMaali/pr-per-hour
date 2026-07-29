import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { Textarea } from '@/shared/components/Textarea'
import { BookingDialogShell } from '@/features/admin/bookings/components/BookingDialogShell'
import type { AdminBooking } from '@/features/admin/bookings/types/adminBookings.types'
import { NOTES_MAX_LENGTH } from '@/features/admin/bookings/utils/adminBookingFilters'
import {
  notesToPayload,
  validateNotesInput,
} from '@/features/admin/bookings/utils/adminBookingValidation'

interface BookingNotesDialogProps {
  open: boolean
  booking: AdminBooking | null
  pending: boolean
  errorMessage: string | null
  fieldError: string | null
  requestId: string | null
  onClose: () => void
  onSubmit: (notes: string | null) => void
}

export function BookingNotesDialog({
  open,
  booking,
  pending,
  errorMessage,
  fieldError,
  requestId,
  onClose,
  onSubmit,
}: BookingNotesDialogProps) {
  const { t } = useTranslation('adminBookings')
  const [value, setValue] = useState('')
  const [clientError, setClientError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setValue(booking?.notes ?? '')
    setClientError(null)
  }, [open, booking])

  function resolveError(key: string | null): string | undefined {
    if (!key) return undefined
    if (key.startsWith('validation') || key.startsWith('error')) return t(key)
    return key
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (pending) return
    const validationKey = validateNotesInput(value)
    setClientError(validationKey)
    if (validationKey) return
    onSubmit(notesToPayload(value))
  }

  return (
    <BookingDialogShell
      open={open}
      pending={pending}
      title={t('notesDialogTitle')}
      description={t('notesDialogDescription')}
      onClose={onClose}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={onClose}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" form="admin-booking-notes-form" disabled={pending}>
            {pending ? t('savingNotes') : t('saveNotes')}
          </Button>
        </>
      }
    >
      <form
        id="admin-booking-notes-form"
        className="booking-form"
        onSubmit={handleSubmit}
        noValidate
      >
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

        <Textarea
          id="admin-booking-notes"
          name="notes"
          label={t('notes')}
          value={value}
          disabled={pending}
          rows={6}
          hint={t('notesHint', { max: NOTES_MAX_LENGTH })}
          error={resolveError(clientError ?? fieldError)}
          onChange={(event) => setValue(event.target.value)}
        />
      </form>
    </BookingDialogShell>
  )
}

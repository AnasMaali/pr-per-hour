import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { BookingDialogShell } from '@/features/admin/bookings/components/BookingDialogShell'
import type { AdminBooking } from '@/features/admin/bookings/types/adminBookings.types'
import {
  meetingLinkToPayload,
  validateMeetingLinkInput,
} from '@/features/admin/bookings/utils/adminBookingValidation'

interface BookingMeetingLinkDialogProps {
  open: boolean
  booking: AdminBooking | null
  pending: boolean
  errorMessage: string | null
  fieldError: string | null
  requestId: string | null
  onClose: () => void
  onSubmit: (meetingLink: string | null) => void
}

export function BookingMeetingLinkDialog({
  open,
  booking,
  pending,
  errorMessage,
  fieldError,
  requestId,
  onClose,
  onSubmit,
}: BookingMeetingLinkDialogProps) {
  const { t } = useTranslation('adminBookings')
  const [value, setValue] = useState('')
  const [clientError, setClientError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setValue(booking?.meeting_link ?? '')
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
    const validationKey = validateMeetingLinkInput(value)
    setClientError(validationKey)
    if (validationKey) return
    onSubmit(meetingLinkToPayload(value))
  }

  return (
    <BookingDialogShell
      open={open}
      pending={pending}
      title={t('meetingLinkDialogTitle')}
      description={t('meetingLinkDialogDescription')}
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
          <Button type="submit" form="admin-booking-link-form" disabled={pending}>
            {pending ? t('savingMeetingLink') : t('saveMeetingLink')}
          </Button>
        </>
      }
    >
      <form
        id="admin-booking-link-form"
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

        <Input
          id="admin-booking-meeting-link"
          name="meeting_link"
          label={t('meetingLink')}
          value={value}
          disabled={pending}
          hint={t('meetingLinkHint')}
          error={resolveError(clientError ?? fieldError)}
          onChange={(event) => setValue(event.target.value)}
        />
      </form>
    </BookingDialogShell>
  )
}

import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { Select } from '@/shared/components/Select'
import { BookingDialogShell } from '@/features/admin/bookings/components/BookingDialogShell'
import type {
  AdminBooking,
  AdminBookingStatus,
} from '@/features/admin/bookings/types/adminBookings.types'
import { allowedStatusTransitions } from '@/features/admin/bookings/utils/adminBookingFilters'

interface BookingStatusDialogProps {
  open: boolean
  booking: AdminBooking | null
  pending: boolean
  errorMessage: string | null
  requestId: string | null
  onClose: () => void
  onSubmit: (status: AdminBookingStatus) => void
}

export function BookingStatusDialog({
  open,
  booking,
  pending,
  errorMessage,
  requestId,
  onClose,
  onSubmit,
}: BookingStatusDialogProps) {
  const { t } = useTranslation('adminBookings')
  const transitions = booking ? allowedStatusTransitions(booking.status) : []
  const [nextStatus, setNextStatus] = useState<AdminBookingStatus | ''>('')

  useEffect(() => {
    if (!open || !booking) return
    const allowed = allowedStatusTransitions(booking.status)
    setNextStatus(allowed[0] ?? '')
  }, [open, booking])

  const terminal = transitions.length === 0

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!nextStatus || pending || terminal) return
    onSubmit(nextStatus)
  }

  return (
    <BookingDialogShell
      open={open}
      pending={pending}
      title={t('statusDialogTitle')}
      description={
        booking
          ? t('statusDialogDescription', {
              current: t(`status.${booking.status}`),
            })
          : undefined
      }
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
          <Button
            type="submit"
            form="admin-booking-status-form"
            disabled={pending || terminal || !nextStatus}
          >
            {pending ? t('savingStatus') : t('saveStatus')}
          </Button>
        </>
      }
    >
      {terminal ? (
        <p className="booking-dialog-note">{t('statusTerminalNote')}</p>
      ) : (
        <form
          id="admin-booking-status-form"
          className="booking-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <Select
            id="admin-booking-next-status"
            name="status"
            label={t('newStatus')}
            value={nextStatus}
            disabled={pending}
            options={transitions.map((status) => ({
              value: status,
              label: t(`status.${status}`),
            }))}
            onChange={(event) =>
              setNextStatus(event.target.value as AdminBookingStatus)
            }
          />
          <p className="field__hint">{t('statusTransitionHint')}</p>
        </form>
      )}

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
    </BookingDialogShell>
  )
}

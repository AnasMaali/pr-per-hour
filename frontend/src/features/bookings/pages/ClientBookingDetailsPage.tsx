import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ApiClientError } from '@/shared/api/errors'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { InlineLoader } from '@/shared/components/InlineLoader'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { BookingCancelDialog } from '@/features/bookings/components/BookingCancelDialog'
import { BookingDetailsSummary } from '@/features/bookings/components/BookingDetailsSummary'
import { useCancelBookingMutation } from '@/features/bookings/queries/useCancelBookingMutation'
import { useClientBookingQuery } from '@/features/bookings/queries/useClientBookingQuery'
import { canClientCancelStatus } from '@/features/bookings/utils/bookingFormatting'
import { mapBookingApiError } from '@/features/bookings/utils/mapBookingApiError'
import '@/features/bookings/styles/client-bookings.css'

export function ClientBookingDetailsPage() {
  const { t } = useTranslation('bookings')
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const query = useClientBookingQuery(id)
  const cancelMutation = useCancelBookingMutation()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [cancelRequestId, setCancelRequestId] = useState<string | null>(null)
  const [cancelSuccess, setCancelSuccess] = useState(false)

  const createdFlash = Boolean(
    (location.state as { bookingCreated?: boolean } | null)?.bookingCreated,
  )

  const booking = query.data
  const isNotFound =
    query.error instanceof ApiClientError &&
    query.error.normalized.status === 404
  const isForbidden =
    query.error instanceof ApiClientError &&
    query.error.normalized.isForbidden

  const requestId =
    query.error instanceof ApiClientError
      ? query.error.normalized.requestId
      : null

  useDocumentMeta({
    title: booking
      ? t('detailsMetaTitle', {
          title: booking.service?.title ?? t('unknownService'),
        })
      : t('detailsMetaFallbackTitle'),
    description: t('detailsMetaDescription'),
    robots: 'noindex, nofollow',
    syncThemeColor: true,
  })

  async function handleConfirmCancel() {
    if (!booking) return
    setCancelError(null)
    setCancelRequestId(null)
    try {
      await cancelMutation.mutateAsync(booking.id)
      setCancelSuccess(true)
      setDialogOpen(false)
    } catch (error) {
      const mapped = mapBookingApiError(error)
      setCancelRequestId(mapped.requestId)
      setCancelError(
        mapped.formMessageKey
          ? t(mapped.formMessageKey)
          : mapped.formMessage ?? t('errorCannotCancel'),
      )
    }
  }

  if (query.isPending) {
    return (
      <div className="client-bookings-page">
        <InlineLoader />
      </div>
    )
  }

  if (isNotFound) {
    return (
      <div className="client-bookings-page">
        <EmptyState
          title={t('detailsNotFoundTitle')}
          description={t('detailsNotFoundDescription')}
        />
        <p>
          <Link className="btn" to="/dashboard/bookings">
            {t('backToBookings')}
          </Link>
        </p>
      </div>
    )
  }

  if (isForbidden) {
    return (
      <div className="client-bookings-page">
        <EmptyState
          title={t('detailsForbiddenTitle')}
          description={t('detailsForbiddenDescription')}
        />
        <p>
          <Link className="btn" to="/dashboard/bookings">
            {t('backToBookings')}
          </Link>
        </p>
      </div>
    )
  }

  if (query.isError || !booking) {
    return (
      <div className="client-bookings-page">
        <ErrorState
          title={t('detailsErrorTitle')}
          description={t('detailsErrorDescription')}
          requestId={requestId}
          onRetry={() => {
            void query.refetch()
          }}
        />
        <p>
          <Link className="btn btn--secondary" to="/dashboard/bookings">
            {t('backToBookings')}
          </Link>
        </p>
      </div>
    )
  }

  const canCancel = canClientCancelStatus(booking.status)

  return (
    <div className="client-bookings-page">
      {createdFlash ? (
        <p className="booking-form__success" role="status">
          {t('createSuccess')}
        </p>
      ) : null}
      {cancelSuccess ? (
        <p className="booking-form__success" role="status">
          {t('cancelSuccess')}
        </p>
      ) : null}

      <BookingDetailsSummary booking={booking} />

      {canCancel ? (
        <div className="booking-details__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setCancelError(null)
              setDialogOpen(true)
            }}
          >
            {t('cancelBooking')}
          </Button>
        </div>
      ) : null}

      <BookingCancelDialog
        open={dialogOpen}
        pending={cancelMutation.isPending}
        errorMessage={cancelError}
        requestId={cancelRequestId}
        onClose={() => {
          if (!cancelMutation.isPending) setDialogOpen(false)
        }}
        onConfirm={() => {
          void handleConfirmCancel()
        }}
      />
    </div>
  )
}

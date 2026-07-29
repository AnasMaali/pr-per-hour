import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ApiClientError } from '@/shared/api/errors'
import { Button } from '@/shared/components/Button'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageLoader } from '@/shared/components/PageLoader'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { AdminBookingDetailsSummary } from '@/features/admin/bookings/components/AdminBookingDetailsSummary'
import { BookingMeetingLinkDialog } from '@/features/admin/bookings/components/BookingMeetingLinkDialog'
import { BookingNotesDialog } from '@/features/admin/bookings/components/BookingNotesDialog'
import { BookingStatusDialog } from '@/features/admin/bookings/components/BookingStatusDialog'
import { useAdminBookingQuery } from '@/features/admin/bookings/queries/useAdminBookingQuery'
import { useUpdateBookingNotesMutation } from '@/features/admin/bookings/queries/useUpdateBookingNotesMutation'
import { useUpdateBookingStatusMutation } from '@/features/admin/bookings/queries/useUpdateBookingStatusMutation'
import { useUpdateMeetingLinkMutation } from '@/features/admin/bookings/queries/useUpdateMeetingLinkMutation'
import type { AdminBookingStatus } from '@/features/admin/bookings/types/adminBookings.types'
import { allowedStatusTransitions } from '@/features/admin/bookings/utils/adminBookingFilters'
import { mapAdminBookingApiError } from '@/features/admin/bookings/utils/mapAdminBookingApiError'
import '@/features/admin/bookings/styles/admin-bookings.css'

export function AdminBookingDetailsPage() {
  const { t, i18n } = useTranslation('adminBookings')
  const { id: idParam } = useParams()
  const bookingId = Number.parseInt(idParam ?? '', 10)
  const validId = Number.isFinite(bookingId) && bookingId > 0 ? bookingId : null

  const bookingQuery = useAdminBookingQuery(validId)
  const statusMutation = useUpdateBookingStatusMutation()
  const meetingMutation = useUpdateMeetingLinkMutation()
  const notesMutation = useUpdateBookingNotesMutation()

  const [statusOpen, setStatusOpen] = useState(false)
  const [meetingOpen, setMeetingOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [dialogMessage, setDialogMessage] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const booking = bookingQuery.data

  useDocumentMeta({
    title: booking
      ? t('detailMetaTitle', { id: booking.id })
      : t('detailMetaTitleFallback'),
    description: t('detailMetaDescription'),
    robots: 'noindex, nofollow',
    syncThemeColor: true,
  })

  const detailRequestId =
    bookingQuery.error instanceof ApiClientError
      ? bookingQuery.error.normalized.requestId
      : null

  const detailStatus =
    bookingQuery.error instanceof ApiClientError
      ? bookingQuery.error.normalized.status
      : null

  const canUpdateStatus =
    booking && allowedStatusTransitions(booking.status).length > 0

  function mapError(error: unknown) {
    const mapped = mapAdminBookingApiError(error)
    setRequestId(mapped.requestId)
    setFieldError(
      mapped.fieldErrors.status ??
        mapped.fieldErrors.meeting_link ??
        mapped.fieldErrors.notes ??
        null,
    )
    setDialogMessage(
      mapped.formMessageKey ? t(mapped.formMessageKey) : mapped.formMessage,
    )
  }

  async function handleStatus(status: AdminBookingStatus) {
    if (!booking) return
    setDialogMessage(null)
    setFieldError(null)
    setRequestId(null)
    try {
      await statusMutation.mutateAsync({
        id: booking.id,
        payload: { status },
      })
      setStatusOpen(false)
      setSuccessMessage(t('successStatusUpdated'))
    } catch (error) {
      mapError(error)
    }
  }

  async function handleMeetingLink(meetingLink: string | null) {
    if (!booking) return
    setDialogMessage(null)
    setFieldError(null)
    setRequestId(null)
    try {
      await meetingMutation.mutateAsync({
        id: booking.id,
        payload: { meeting_link: meetingLink },
      })
      setMeetingOpen(false)
      setSuccessMessage(t('successMeetingLinkUpdated'))
    } catch (error) {
      mapError(error)
    }
  }

  async function handleNotes(notes: string | null) {
    if (!booking) return
    setDialogMessage(null)
    setFieldError(null)
    setRequestId(null)
    try {
      await notesMutation.mutateAsync({
        id: booking.id,
        payload: { notes },
      })
      setNotesOpen(false)
      setSuccessMessage(t('successNotesUpdated'))
    } catch (error) {
      mapError(error)
    }
  }

  if (validId === null) {
    return (
      <div className="admin-booking-details-page">
        <ErrorState
          title={t('detailNotFoundTitle')}
          description={t('detailNotFoundDescription')}
        />
        <Link className="btn btn--secondary" to="/admin/bookings">
          {t('backToList')}
        </Link>
      </div>
    )
  }

  if (bookingQuery.isPending) {
    return <PageLoader label={t('loadingDetail')} />
  }

  if (bookingQuery.isError) {
    const title =
      detailStatus === 403
        ? t('detailForbiddenTitle')
        : detailStatus === 404
          ? t('detailNotFoundTitle')
          : t('detailErrorTitle')
    const description =
      detailStatus === 403
        ? t('detailForbiddenDescription')
        : detailStatus === 404
          ? t('detailNotFoundDescription')
          : t('detailErrorDescription')

    return (
      <div className="admin-booking-details-page">
        <ErrorState
          title={title}
          description={description}
          requestId={detailRequestId}
          onRetry={() => {
            void bookingQuery.refetch()
          }}
        />
        <Link className="btn btn--secondary" to="/admin/bookings">
          {t('backToList')}
        </Link>
      </div>
    )
  }

  if (!booking) return null

  return (
    <div className="admin-booking-details-page">
      <header className="admin-booking-details-header">
        <div>
          <p className="admin-booking-details-eyebrow">
            <Link to="/admin/bookings">{t('backToList')}</Link>
          </p>
          <h1>{t('detailTitle', { id: booking.id })}</h1>
          <p>{t('detailLead')}</p>
        </div>
        <div className="admin-booking-details-actions">
          <Button
            type="button"
            disabled={!canUpdateStatus}
            onClick={() => {
              setDialogMessage(null)
              setFieldError(null)
              setRequestId(null)
              setSuccessMessage(null)
              setStatusOpen(true)
            }}
          >
            {t('updateStatus')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setDialogMessage(null)
              setFieldError(null)
              setRequestId(null)
              setSuccessMessage(null)
              setMeetingOpen(true)
            }}
          >
            {t('updateMeetingLink')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setDialogMessage(null)
              setFieldError(null)
              setRequestId(null)
              setSuccessMessage(null)
              setNotesOpen(true)
            }}
          >
            {t('updateNotes')}
          </Button>
        </div>
      </header>

      {successMessage ? (
        <div
          className="admin-bookings-success"
          role="status"
          aria-live="polite"
        >
          <p>{successMessage}</p>
        </div>
      ) : null}

      <AdminBookingDetailsSummary booking={booking} locale={i18n.language} />

      <BookingStatusDialog
        open={statusOpen}
        booking={booking}
        pending={statusMutation.isPending}
        errorMessage={statusOpen ? dialogMessage : null}
        requestId={statusOpen ? requestId : null}
        onClose={() => {
          if (!statusMutation.isPending) setStatusOpen(false)
        }}
        onSubmit={(status) => {
          void handleStatus(status)
        }}
      />

      <BookingMeetingLinkDialog
        open={meetingOpen}
        booking={booking}
        pending={meetingMutation.isPending}
        errorMessage={meetingOpen ? dialogMessage : null}
        fieldError={meetingOpen ? fieldError : null}
        requestId={meetingOpen ? requestId : null}
        onClose={() => {
          if (!meetingMutation.isPending) setMeetingOpen(false)
        }}
        onSubmit={(meetingLink) => {
          void handleMeetingLink(meetingLink)
        }}
      />

      <BookingNotesDialog
        open={notesOpen}
        booking={booking}
        pending={notesMutation.isPending}
        errorMessage={notesOpen ? dialogMessage : null}
        fieldError={notesOpen ? fieldError : null}
        requestId={notesOpen ? requestId : null}
        onClose={() => {
          if (!notesMutation.isPending) setNotesOpen(false)
        }}
        onSubmit={(notes) => {
          void handleNotes(notes)
        }}
      />
    </div>
  )
}

import { useTranslation } from 'react-i18next'
import { AdminBookingStatusBadge } from '@/features/admin/bookings/components/AdminBookingStatusBadge'
import type { AdminBooking } from '@/features/admin/bookings/types/adminBookings.types'
import {
  formatBookingDateTimeStamp,
  formatBookingTime,
} from '@/features/admin/bookings/utils/adminBookingFilters'

interface AdminBookingDetailsSummaryProps {
  booking: AdminBooking
  locale: string
}

export function AdminBookingDetailsSummary({
  booking,
  locale,
}: AdminBookingDetailsSummaryProps) {
  const { t } = useTranslation('adminBookings')

  return (
    <section
      className="admin-booking-details-summary"
      aria-labelledby="booking-summary-heading"
    >
      <h2 id="booking-summary-heading">{t('summaryHeading')}</h2>

      <dl className="admin-booking-details-grid">
        <div>
          <dt>{t('statusField')}</dt>
          <dd>
            <AdminBookingStatusBadge status={booking.status} />
          </dd>
        </div>
        <div>
          <dt>{t('bookingDate')}</dt>
          <dd>{booking.booking_date}</dd>
        </div>
        <div>
          <dt>{t('time')}</dt>
          <dd>
            {formatBookingTime(booking.start_time)} –{' '}
            {formatBookingTime(booking.end_time)}
          </dd>
        </div>
        <div>
          <dt>{t('client')}</dt>
          <dd>
            <p className="admin-booking-details-grid__stack">
              <strong>{booking.client?.name ?? t('unknownClient')}</strong>
              {booking.client?.email ? <span>{booking.client.email}</span> : null}
              {booking.client?.phone ? <span>{booking.client.phone}</span> : null}
            </p>
          </dd>
        </div>
        <div>
          <dt>{t('service')}</dt>
          <dd>
            <p className="admin-booking-details-grid__stack">
              <strong>{booking.service?.title ?? t('unknownService')}</strong>
              {booking.service?.category ? (
                <span>{booking.service.category.name}</span>
              ) : null}
              {booking.service ? (
                <span>
                  {booking.service.price} {booking.service.currency}
                </span>
              ) : null}
            </p>
          </dd>
        </div>
        <div>
          <dt>{t('meetingLink')}</dt>
          <dd>
            {booking.meeting_link ? (
              <a
                href={booking.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-booking-meeting-link"
              >
                {booking.meeting_link}
              </a>
            ) : (
              t('meetingLinkEmpty')
            )}
          </dd>
        </div>
        <div className="admin-booking-details-grid__full">
          <dt>{t('notes')}</dt>
          <dd>
            {booking.notes ? (
              <p className="admin-booking-notes-text">{booking.notes}</p>
            ) : (
              t('notesEmpty')
            )}
          </dd>
        </div>
        <div>
          <dt>{t('created')}</dt>
          <dd>{formatBookingDateTimeStamp(booking.created_at, locale)}</dd>
        </div>
        <div>
          <dt>{t('updated')}</dt>
          <dd>{formatBookingDateTimeStamp(booking.updated_at, locale)}</dd>
        </div>
      </dl>
    </section>
  )
}

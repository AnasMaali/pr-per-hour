import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ClientBooking } from '@/features/bookings/types/bookings.types'
import { BookingStatusBadge } from '@/features/bookings/components/BookingStatusBadge'
import {
  formatBookingDate,
  formatBookingPrice,
  formatBookingTime,
  meetingLinkHostname,
} from '@/features/bookings/utils/bookingFormatting'

interface BookingDetailsSummaryProps {
  booking: ClientBooking
}

export function BookingDetailsSummary({ booking }: BookingDetailsSummaryProps) {
  const { t } = useTranslation('bookings')
  const service = booking.service
  const host = booking.meeting_link
    ? meetingLinkHostname(booking.meeting_link)
    : null

  return (
    <section className="booking-details" aria-labelledby="booking-details-title">
      <div className="booking-details__header">
        <h1 id="booking-details-title">
          {service?.title ?? t('unknownService')}
        </h1>
        <BookingStatusBadge status={booking.status} />
      </div>

      {service?.category ? (
        <p className="booking-details__category">{service.category.name}</p>
      ) : null}

      <dl className="booking-details__meta">
        <div>
          <dt>{t('dateLabel')}</dt>
          <dd>{formatBookingDate(booking.booking_date)}</dd>
        </div>
        <div>
          <dt>{t('startTimeLabel')}</dt>
          <dd>{formatBookingTime(booking.start_time)}</dd>
        </div>
        <div>
          <dt>{t('endTimeLabel')}</dt>
          <dd>{formatBookingTime(booking.end_time)}</dd>
        </div>
        {service ? (
          <div>
            <dt>{t('priceLabel')}</dt>
            <dd>{formatBookingPrice(service.price, service.currency)}</dd>
          </div>
        ) : null}
        <div>
          <dt>{t('createdLabel')}</dt>
          <dd>{booking.created_at}</dd>
        </div>
      </dl>

      <div className="booking-details__block">
        <h2>{t('notesLabel')}</h2>
        <p>{booking.notes?.trim() ? booking.notes : t('notesEmpty')}</p>
      </div>

      <div className="booking-details__block">
        <h2>{t('meetingLinkLabel')}</h2>
        {booking.meeting_link ? (
          <p>
            <a
              href={booking.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {host
                ? t('meetingLinkOpenHost', { host })
                : t('meetingLinkOpen')}
            </a>
          </p>
        ) : (
          <p>{t('meetingLinkUnavailable')}</p>
        )}
      </div>

      <p>
        <Link className="btn btn--secondary" to="/dashboard/bookings">
          {t('backToBookings')}
        </Link>
      </p>
    </section>
  )
}

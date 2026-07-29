import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ClientBooking } from '@/features/bookings/types/bookings.types'
import { BookingStatusBadge } from '@/features/bookings/components/BookingStatusBadge'
import {
  formatBookingDate,
  formatBookingPrice,
  formatBookingTime,
} from '@/features/bookings/utils/bookingFormatting'

interface BookingCardProps {
  booking: ClientBooking
}

export function BookingCard({ booking }: BookingCardProps) {
  const { t } = useTranslation('bookings')
  const service = booking.service

  return (
    <article className="booking-card">
      <div className="booking-card__header">
        <h3>
          <Link to={`/dashboard/bookings/${booking.id}`}>
            {service?.title ?? t('unknownService')}
          </Link>
        </h3>
        <BookingStatusBadge status={booking.status} />
      </div>

      {service?.category ? (
        <p className="booking-card__category">{service.category.name}</p>
      ) : null}

      <dl className="booking-card__meta">
        <div>
          <dt>{t('dateLabel')}</dt>
          <dd>{formatBookingDate(booking.booking_date)}</dd>
        </div>
        <div>
          <dt>{t('timeLabel')}</dt>
          <dd>
            {formatBookingTime(booking.start_time)} –{' '}
            {formatBookingTime(booking.end_time)}
          </dd>
        </div>
        {service ? (
          <div>
            <dt>{t('priceLabel')}</dt>
            <dd>{formatBookingPrice(service.price, service.currency)}</dd>
          </div>
        ) : null}
        <div>
          <dt>{t('meetingLinkLabel')}</dt>
          <dd>
            {booking.meeting_link
              ? t('meetingLinkAvailable')
              : t('meetingLinkUnavailable')}
          </dd>
        </div>
      </dl>

      <Link className="booking-card__link" to={`/dashboard/bookings/${booking.id}`}>
        {t('viewDetails')}
      </Link>
    </article>
  )
}

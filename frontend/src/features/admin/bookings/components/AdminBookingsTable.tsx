import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AdminBookingStatusBadge } from '@/features/admin/bookings/components/AdminBookingStatusBadge'
import type { AdminBooking } from '@/features/admin/bookings/types/adminBookings.types'
import { formatBookingTime } from '@/features/admin/bookings/utils/adminBookingFilters'

interface AdminBookingsTableProps {
  bookings: AdminBooking[]
}

export function AdminBookingsTable({ bookings }: AdminBookingsTableProps) {
  const { t } = useTranslation('adminBookings')

  return (
    <>
      <div className="admin-bookings-table-wrap">
        <table className="admin-bookings-table">
          <thead>
            <tr>
              <th scope="col">{t('client')}</th>
              <th scope="col">{t('service')}</th>
              <th scope="col">{t('bookingDate')}</th>
              <th scope="col">{t('time')}</th>
              <th scope="col">{t('statusField')}</th>
              <th scope="col">{t('meetingLink')}</th>
              <th scope="col">
                <span className="visually-hidden">{t('actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>
                  <div className="admin-bookings-table__client">
                    <strong>
                      {booking.client?.name ?? t('unknownClient')}
                    </strong>
                    {booking.client?.email ? (
                      <span>{booking.client.email}</span>
                    ) : null}
                  </div>
                </td>
                <td>
                  <span className="admin-bookings-table__service">
                    {booking.service?.title ?? t('unknownService')}
                  </span>
                </td>
                <td>{booking.booking_date}</td>
                <td>
                  {formatBookingTime(booking.start_time)} –{' '}
                  {formatBookingTime(booking.end_time)}
                </td>
                <td>
                  <AdminBookingStatusBadge status={booking.status} />
                </td>
                <td>
                  {booking.meeting_link ? t('meetingLinkSet') : t('meetingLinkEmpty')}
                </td>
                <td>
                  <Link
                    className="btn btn--secondary"
                    to={`/admin/bookings/${booking.id}`}
                  >
                    {t('viewDetails')}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="admin-booking-card-list">
        {bookings.map((booking) => (
          <li key={booking.id} className="admin-booking-card">
            <div className="admin-booking-card__header">
              <p className="admin-booking-card__title">
                {booking.client?.name ?? t('unknownClient')}
              </p>
              <AdminBookingStatusBadge status={booking.status} />
            </div>
            {booking.client?.email ? (
              <p className="admin-booking-card__meta">{booking.client.email}</p>
            ) : null}
            <p className="admin-booking-card__meta">
              {t('service')}: {booking.service?.title ?? t('unknownService')}
            </p>
            <p className="admin-booking-card__meta">
              {t('bookingDate')}: {booking.booking_date}
            </p>
            <p className="admin-booking-card__meta">
              {t('time')}: {formatBookingTime(booking.start_time)} –{' '}
              {formatBookingTime(booking.end_time)}
            </p>
            <p className="admin-booking-card__meta">
              {t('meetingLink')}:{' '}
              {booking.meeting_link ? t('meetingLinkSet') : t('meetingLinkEmpty')}
            </p>
            <div className="admin-booking-card__actions">
              <Link
                className="btn btn--secondary"
                to={`/admin/bookings/${booking.id}`}
              >
                {t('viewDetails')}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

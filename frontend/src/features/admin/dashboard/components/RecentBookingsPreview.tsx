import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ApiClientError } from '@/shared/api/errors'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { formatAdminBookingSlot } from '@/features/admin/dashboard/utils/adminFormatting'
import type { AdminBookingPreviewItem } from '@/features/admin/dashboard/types/adminOverview.types'
import type { UseQueryResult } from '@tanstack/react-query'

interface RecentBookingsPreviewProps {
  query: UseQueryResult<{ bookings: AdminBookingPreviewItem[]; total: number }>
}

export function RecentBookingsPreview({ query }: RecentBookingsPreviewProps) {
  const { t } = useTranslation('admin')
  const requestId =
    query.error instanceof ApiClientError
      ? query.error.normalized.requestId
      : null

  return (
    <section
      className="admin-preview-section"
      aria-labelledby="admin-recent-bookings-heading"
    >
      <div className="admin-preview-section__header">
        <h2 id="admin-recent-bookings-heading">{t('recentBookings')}</h2>
        <Link to="/admin/bookings">{t('viewAll')}</Link>
      </div>
      <p className="admin-section-lead">{t('recentBookingsLead')}</p>

      {query.isPending ? (
        <div className="admin-preview-skeleton" aria-busy="true" aria-live="polite">
          <span className="visually-hidden">{t('loading')}</span>
          <div className="admin-preview-skeleton__row" />
          <div className="admin-preview-skeleton__row" />
        </div>
      ) : null}

      {query.isError ? (
        <ErrorState
          title={t('sectionUnavailable')}
          description={t('sectionUnavailableDescription')}
          requestId={requestId}
          onRetry={() => {
            void query.refetch()
          }}
        />
      ) : null}

      {query.isSuccess && query.data.bookings.length === 0 ? (
        <EmptyState
          title={t('noBookingsTitle')}
          description={t('noBookingsDescription')}
        />
      ) : null}

      {query.isSuccess && query.data.bookings.length > 0 ? (
        <ul className="admin-preview-list">
          {query.data.bookings.map((booking) => (
            <li key={booking.id} className="admin-preview-item">
              <div className="admin-preview-item__main">
                <p className="admin-preview-item__title">
                  {booking.service?.title ?? t('unknownService')}
                </p>
                <p className="admin-preview-item__meta">
                  {booking.client
                    ? `${booking.client.name} · ${booking.client.email}`
                    : t('unknownClient')}
                </p>
                <p className="admin-preview-item__meta">
                  {formatAdminBookingSlot(
                    booking.booking_date,
                    booking.start_time,
                    booking.end_time,
                  )}
                </p>
              </div>
              <div className="admin-preview-item__aside">
                <span
                  className={`admin-status-badge admin-status-badge--${booking.status}`}
                >
                  {t(`bookingStatus.${booking.status}`)}
                </span>
                <Link to={`/admin/bookings`}>{t('viewBookings')}</Link>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

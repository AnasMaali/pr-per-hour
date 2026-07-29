import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ApiClientError } from '@/shared/api/errors'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { useAuth } from '@/features/auth/AuthProvider'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { BookingCard } from '@/features/bookings/components/BookingCard'
import { BookingSkeleton } from '@/features/bookings/components/BookingSkeleton'
import { useClientBookingsQuery } from '@/features/bookings/queries/useClientBookingsQuery'
import { DEFAULT_BOOKING_FILTERS } from '@/features/bookings/utils/bookingFilters'
import '@/features/bookings/styles/client-bookings.css'

export function ClientDashboardPage() {
  const { t } = useTranslation('bookings')
  const { user } = useAuth()
  const recentQuery = useClientBookingsQuery({
    ...DEFAULT_BOOKING_FILTERS,
    page: 1,
  })

  useDocumentMeta({
    title: t('dashboardMetaTitle'),
    description: t('dashboardMetaDescription'),
    robots: 'noindex, nofollow',
    syncThemeColor: true,
  })

  const requestId =
    recentQuery.error instanceof ApiClientError
      ? recentQuery.error.normalized.requestId
      : null

  const recent = recentQuery.data?.bookings.slice(0, 3) ?? []

  return (
    <div className="client-dashboard-page">
      <header className="client-bookings-header">
        <div>
          <h1>
            {t('dashboardWelcome', { name: user?.name ?? t('dashboardGuest') })}
          </h1>
          <p>{t('dashboardLead')}</p>
        </div>
      </header>

      <nav className="client-dashboard-links" aria-label={t('dashboardQuickLinks')}>
        <Link className="btn" to="/services">
          {t('browseServices')}
        </Link>
        <Link className="btn btn--secondary" to="/dashboard/bookings/new">
          {t('createBooking')}
        </Link>
        <Link className="btn btn--secondary" to="/dashboard/bookings">
          {t('myBookings')}
        </Link>
        <Link className="btn btn--ghost" to="/dashboard/profile">
          {t('profile')}
        </Link>
      </nav>

      <section aria-labelledby="recent-bookings-heading">
        <div className="client-bookings-toolbar">
          <h2 id="recent-bookings-heading">{t('recentBookings')}</h2>
          <Link to="/dashboard/bookings">{t('viewAllBookings')}</Link>
        </div>

        <p className="client-dashboard-note">{t('recentBookingsNote')}</p>

        {recentQuery.isPending ? <BookingSkeleton count={2} /> : null}

        {recentQuery.isError ? (
          <ErrorState
            title={t('listErrorTitle')}
            description={t('listErrorDescription')}
            requestId={requestId}
            onRetry={() => {
              void recentQuery.refetch()
            }}
          />
        ) : null}

        {recentQuery.isSuccess && recent.length === 0 ? (
          <EmptyState
            title={t('emptyTitle')}
            description={t('emptyDescription')}
          />
        ) : null}

        {recentQuery.isSuccess && recent.length > 0 ? (
          <div className="booking-list">
            {recent.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}

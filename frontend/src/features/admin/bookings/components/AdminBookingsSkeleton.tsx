import { useTranslation } from 'react-i18next'

export function AdminBookingsSkeleton() {
  const { t } = useTranslation('adminBookings')

  return (
    <div className="admin-bookings-skeleton" aria-busy="true" aria-live="polite">
      <span className="visually-hidden">{t('loading')}</span>
      <div className="admin-bookings-skeleton__row" />
      <div className="admin-bookings-skeleton__row" />
      <div className="admin-bookings-skeleton__row" />
    </div>
  )
}

import { useTranslation } from 'react-i18next'
import type { AdminBookingStatus } from '@/features/admin/bookings/types/adminBookings.types'

interface AdminBookingStatusBadgeProps {
  status: AdminBookingStatus
}

export function AdminBookingStatusBadge({
  status,
}: AdminBookingStatusBadgeProps) {
  const { t } = useTranslation('adminBookings')

  return (
    <span className={`admin-booking-status admin-booking-status--${status}`}>
      <span className="visually-hidden">{t('statusLabel')}: </span>
      {t(`status.${status}`)}
    </span>
  )
}

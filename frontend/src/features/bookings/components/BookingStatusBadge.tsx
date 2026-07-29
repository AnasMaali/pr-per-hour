import { useTranslation } from 'react-i18next'
import type { BookingStatus } from '@/features/bookings/types/bookings.types'

interface BookingStatusBadgeProps {
  status: BookingStatus
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const { t } = useTranslation('bookings')

  return (
    <span className={`status-badge status-badge--${status}`}>
      <span className="visually-hidden">{t('statusLabel')}: </span>
      {t(`status.${status}`)}
    </span>
  )
}

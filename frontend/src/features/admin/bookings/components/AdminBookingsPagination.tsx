import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'

interface AdminBookingsPaginationProps {
  currentPage: number
  lastPage: number
  onPrevious: () => void
  onNext: () => void
}

export function AdminBookingsPagination({
  currentPage,
  lastPage,
  onPrevious,
  onNext,
}: AdminBookingsPaginationProps) {
  const { t } = useTranslation('adminBookings')

  if (lastPage <= 1) return null

  return (
    <nav className="admin-bookings-pagination" aria-label={t('pagination')}>
      <Button
        type="button"
        variant="secondary"
        disabled={currentPage <= 1}
        onClick={onPrevious}
      >
        {t('previousPage')}
      </Button>
      <span>
        {t('pageStatus', { current: currentPage, last: lastPage })}
      </span>
      <Button
        type="button"
        variant="secondary"
        disabled={currentPage >= lastPage}
        onClick={onNext}
      >
        {t('nextPage')}
      </Button>
    </nav>
  )
}

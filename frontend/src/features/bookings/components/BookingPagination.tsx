import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'

interface BookingPaginationProps {
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
}

export function BookingPagination({
  currentPage,
  lastPage,
  onPageChange,
}: BookingPaginationProps) {
  const { t } = useTranslation('bookings')

  if (lastPage <= 1) return null

  return (
    <nav className="booking-pagination" aria-label={t('paginationNav')}>
      <Button
        type="button"
        variant="secondary"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        {t('previousPage')}
      </Button>
      <p className="booking-pagination__status" aria-live="polite">
        {t('resultsPage', { page: currentPage, lastPage })}
      </p>
      <Button
        type="button"
        variant="secondary"
        disabled={currentPage >= lastPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        {t('nextPage')}
      </Button>
    </nav>
  )
}

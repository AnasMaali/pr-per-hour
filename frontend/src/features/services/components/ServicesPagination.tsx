import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'

interface ServicesPaginationProps {
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
}

export function ServicesPagination({
  currentPage,
  lastPage,
  onPageChange,
}: ServicesPaginationProps) {
  const { t } = useTranslation('services')

  if (lastPage <= 1) {
    return null
  }

  const canPrev = currentPage > 1
  const canNext = currentPage < lastPage

  return (
    <nav className="services-pagination" aria-label={t('paginationNav')}>
      <Button
        type="button"
        variant="secondary"
        disabled={!canPrev}
        onClick={() => onPageChange(currentPage - 1)}
      >
        {t('previousPage')}
      </Button>
      <p className="services-pagination__status" aria-live="polite">
        {t('resultsPage', { page: currentPage, lastPage })}
      </p>
      <Button
        type="button"
        variant="secondary"
        disabled={!canNext}
        onClick={() => onPageChange(currentPage + 1)}
      >
        {t('nextPage')}
      </Button>
    </nav>
  )
}

import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'

interface ContactMessagesPaginationProps {
  currentPage: number
  lastPage: number
  onPrevious: () => void
  onNext: () => void
}

export function ContactMessagesPagination({
  currentPage,
  lastPage,
  onPrevious,
  onNext,
}: ContactMessagesPaginationProps) {
  const { t } = useTranslation('adminContactMessages')

  if (lastPage <= 1) return null

  return (
    <nav
      className="admin-contact-messages-pagination"
      aria-label={t('pagination')}
    >
      <Button
        type="button"
        variant="secondary"
        disabled={currentPage <= 1}
        onClick={onPrevious}
      >
        {t('previousPage')}
      </Button>
      <span>{t('pageStatus', { current: currentPage, last: lastPage })}</span>
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

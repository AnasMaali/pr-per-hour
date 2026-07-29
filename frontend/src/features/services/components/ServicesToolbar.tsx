import { useTranslation } from 'react-i18next'
import type { ServiceFiltersState } from '@/features/services/types/services.types'
import { hasActiveFilters } from '@/features/services/utils/serviceFilters'

interface ServicesToolbarProps {
  filters: ServiceFiltersState
  total: number
  currentPage: number
  lastPage: number
}

export function ServicesToolbar({
  filters,
  total,
  currentPage,
  lastPage,
}: ServicesToolbarProps) {
  const { t } = useTranslation('services')

  return (
    <div className="services-toolbar">
      <h2 id="services-results-heading" tabIndex={-1}>
        {t('resultsHeading')}
      </h2>
      <div className="services-toolbar__meta">
        <span>{t('resultsCount', { count: total })}</span>
        {lastPage > 0 ? (
          <>
            <span aria-hidden="true"> · </span>
            <span>{t('resultsPage', { page: currentPage, lastPage })}</span>
          </>
        ) : null}
        {hasActiveFilters(filters) ? (
          <>
            <span aria-hidden="true"> · </span>
            <span>{t('activeFilters')}</span>
          </>
        ) : null}
      </div>
    </div>
  )
}

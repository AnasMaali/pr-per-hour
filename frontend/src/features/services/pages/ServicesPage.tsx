import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ApiClientError } from '@/shared/api/errors'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { ServiceCard } from '@/features/services/components/ServiceCard'
import { ServicesFilters } from '@/features/services/components/ServicesFilters'
import { ServicesGridSkeleton } from '@/features/services/components/ServicesGridSkeleton'
import { ServicesPagination } from '@/features/services/components/ServicesPagination'
import { ServicesToolbar } from '@/features/services/components/ServicesToolbar'
import { usePublicCategoriesQuery } from '@/features/services/queries/usePublicCategoriesQuery'
import { usePublicServicesQuery } from '@/features/services/queries/usePublicServicesQuery'
import type {
  ServiceFilterValidationErrors,
  ServiceFiltersState,
} from '@/features/services/types/services.types'
import {
  DEFAULT_FILTERS,
  filtersToSearchParams,
  hasActiveFilters,
  parseFiltersFromSearchParams,
  validateServiceFilters,
} from '@/features/services/utils/serviceFilters'
import { Reveal, StaggerGroup } from '@/shared/motion'
import '@/features/services/styles/services-page.css'

function filtersEqual(a: ServiceFiltersState, b: ServiceFiltersState): boolean {
  return (
    a.search === b.search &&
    a.category === b.category &&
    a.duration === b.duration &&
    a.currency === b.currency &&
    a.min_price === b.min_price &&
    a.max_price === b.max_price &&
    a.sort === b.sort &&
    a.direction === b.direction &&
    a.page === b.page
  )
}

export function ServicesPage() {
  const { t } = useTranslation('services')
  const [searchParams, setSearchParams] = useSearchParams()

  const urlFilters = useMemo(
    () => parseFiltersFromSearchParams(searchParams),
    [searchParams],
  )

  const [draft, setDraft] = useState<ServiceFiltersState>(urlFilters)
  const [validationErrors, setValidationErrors] =
    useState<ServiceFilterValidationErrors>({})

  useEffect(() => {
    setDraft(urlFilters)
    setValidationErrors({})
  }, [urlFilters])

  const clientErrors = validateServiceFilters(urlFilters)
  const filtersValid = Object.keys(clientErrors).length === 0

  const servicesQuery = usePublicServicesQuery(urlFilters, filtersValid)
  const categoriesQuery = usePublicCategoriesQuery()

  useDocumentMeta({
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: 'index, follow',
    syncThemeColor: true,
  })

  function applyFilters(next: ServiceFiltersState, resetPage = true) {
    // Price filters are not exposed in V1 UI (payments disabled).
    const candidate = {
      ...next,
      page: resetPage ? 1 : next.page,
      currency: '',
      min_price: '',
      max_price: '',
      sort: next.sort === 'price' ? 'title' : next.sort,
      search: next.search.trim(),
    }
    const errors = validateServiceFilters(candidate)
    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }
    setSearchParams(filtersToSearchParams(candidate), { replace: false })
  }

  function handleReset() {
    setValidationErrors({})
    setDraft(DEFAULT_FILTERS)
    setSearchParams(new URLSearchParams(), { replace: false })
  }

  function handlePageChange(page: number) {
    const next = { ...urlFilters, page }
    setSearchParams(filtersToSearchParams(next), { replace: false })
    const results = document.getElementById('services-results-heading')
    results?.focus()
  }

  // Clamp page if API reports fewer pages than requested
  useEffect(() => {
    const meta = servicesQuery.data?.meta
    if (!meta || !filtersValid) return
    if (urlFilters.page > meta.last_page && meta.last_page >= 1) {
      const next = { ...urlFilters, page: meta.last_page }
      if (!filtersEqual(next, urlFilters)) {
        setSearchParams(filtersToSearchParams(next), { replace: true })
      }
    }
  }, [servicesQuery.data?.meta, urlFilters, filtersValid, setSearchParams])

  const requestId =
    servicesQuery.error instanceof ApiClientError
      ? servicesQuery.error.normalized.requestId
      : null

  const validationMessage =
    servicesQuery.error instanceof ApiClientError &&
    servicesQuery.error.normalized.isValidationError
      ? servicesQuery.error.normalized.message
      : null

  const meta = servicesQuery.data?.meta
  const services = servicesQuery.data?.services ?? []
  const total = meta?.total ?? 0
  const currentPage = meta?.current_page ?? urlFilters.page
  const lastPage = meta?.last_page ?? 1
  const filtersActive = hasActiveFilters(urlFilters)
  const catalogEmpty =
    servicesQuery.isSuccess && total === 0 && !filtersActive

  return (
    <div className="services-page">
      <header className="services-hero">
        <div className="services-container">
          <Reveal>
            <nav aria-label={t('breadcrumbServices')}>
              <ol className="services-breadcrumb">
                <li>
                  <Link to="/">{t('breadcrumbHome')}</Link>
                </li>
                <li className="services-breadcrumb__sep" aria-hidden="true">
                  /
                </li>
                <li aria-current="page">{t('breadcrumbServices')}</li>
              </ol>
            </nav>
            <h1 className="services-hero__title">{t('listTitle')}</h1>
            <p className="services-hero__lead">{t('listLead')}</p>
          </Reveal>
        </div>
      </header>

      <section className="services-section">
        <div className="services-container">
          <ServicesFilters
            draft={draft}
            onDraftChange={setDraft}
            onSubmit={() => applyFilters(draft, true)}
            onReset={handleReset}
            categories={categoriesQuery.data ?? []}
            categoriesFailed={categoriesQuery.isError}
            validationErrors={{
              ...validationErrors,
              ...(!filtersValid ? clientErrors : {}),
            }}
          />
        </div>
      </section>

      <section
        className="services-section services-section--results"
        aria-labelledby="services-results-heading"
      >
        <div className="services-container">
          <ServicesToolbar
            filters={urlFilters}
            total={total}
            currentPage={currentPage}
            lastPage={lastPage}
          />

          {filtersValid && servicesQuery.isPending ? (
            <ServicesGridSkeleton />
          ) : null}

          {filtersValid && servicesQuery.isError ? (
            <ErrorState
              title={t('errorTitle')}
              description={validationMessage ?? t('errorDescription')}
              requestId={requestId}
              onRetry={() => {
                void servicesQuery.refetch()
              }}
            />
          ) : null}

          {filtersValid &&
          servicesQuery.isSuccess &&
          services.length === 0 ? (
            <div>
              <EmptyState
                title={
                  catalogEmpty ? t('emptyCatalogTitle') : t('emptyTitle')
                }
                description={
                  catalogEmpty
                    ? t('emptyCatalogDescription')
                    : t('emptyDescription')
                }
              />
              {filtersActive ? (
                <div className="services-empty-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleReset}
                  >
                    {t('resetFilters')}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {filtersValid &&
          servicesQuery.isSuccess &&
          services.length > 0 ? (
            <>
              <StaggerGroup className="services-grid">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </StaggerGroup>
              <ServicesPagination
                currentPage={currentPage}
                lastPage={lastPage}
                onPageChange={handlePageChange}
              />
            </>
          ) : null}
        </div>
      </section>

      <section className="services-cta">
        <div className="services-container">
          <div className="services-cta__panel">
            <h2>{t('ctaTitle')}</h2>
            <p>{t('ctaLead')}</p>
            <div className="services-cta__actions">
              <Link className="btn btn--lift" to="/contact">
                {t('ctaContact')}
              </Link>
              <Link className="btn btn--secondary btn--lift" to="/">
                {t('breadcrumbHome')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

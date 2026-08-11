import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { ApiClientError } from '@/shared/api/errors'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { ServiceCard } from '@/features/services/components/ServiceCard'
import { ServicesGridSkeleton } from '@/features/services/components/ServicesGridSkeleton'
import { ServicesPagination } from '@/features/services/components/ServicesPagination'
import { usePublicCategoriesQuery } from '@/features/services/queries/usePublicCategoriesQuery'
import { usePublicServicesQuery } from '@/features/services/queries/usePublicServicesQuery'
import type { ServiceFiltersState } from '@/features/services/types/services.types'
import {
  DEFAULT_PER_PAGE,
  filtersToSearchParams,
  parseFiltersFromSearchParams,
  validateServiceFilters,
} from '@/features/services/utils/serviceFilters'
import { Reveal, StaggerGroup } from '@/shared/motion'
import '@/features/services/styles/services-page.css'

function filtersEqual(
  first: ServiceFiltersState,
  second: ServiceFiltersState,
): boolean {
  return (
    first.search === second.search &&
    first.category === second.category &&
    first.duration === second.duration &&
    first.currency === second.currency &&
    first.min_price === second.min_price &&
    first.max_price === second.max_price &&
    first.sort === second.sort &&
    first.direction === second.direction &&
    first.page === second.page
  )
}

export function ServicesPage() {
  const { t } = useTranslation('services')
  const [searchParams, setSearchParams] = useSearchParams()

  const urlFilters = useMemo(
    () => parseFiltersFromSearchParams(searchParams),
    [searchParams],
  )

  const categoriesQuery = usePublicCategoriesQuery()
  const categories = categoriesQuery.data ?? []
  const categorySelected = Boolean(urlFilters.category)

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (category) => category.slug === urlFilters.category,
      ) ?? null,
    [categories, urlFilters.category],
  )

  const categoryMissing =
    categorySelected &&
    categoriesQuery.isSuccess &&
    selectedCategory === null

  const clientErrors = validateServiceFilters(urlFilters)
  const filtersValid = Object.keys(clientErrors).length === 0

  const categoryReady =
    categorySelected &&
    categoriesQuery.isSuccess &&
    selectedCategory !== null

  const servicesQuery = usePublicServicesQuery(
    urlFilters,
    filtersValid && categoryReady,
  )

  const meta = servicesQuery.data?.meta
  const services = servicesQuery.data?.services ?? []
  const total = meta?.total ?? 0
  const currentPage = meta?.current_page ?? urlFilters.page
  const lastPage = meta?.last_page ?? 1

  const pageTitle = selectedCategory
    ? `${selectedCategory.name} — PR Per Hour`
    : t('metaTitle')

  const pageDescription =
    selectedCategory?.description ?? t('metaDescription')

  useDocumentMeta({
    title: pageTitle,
    description: pageDescription,
    canonicalPath: '/services',
    robots: 'index, follow',
    syncThemeColor: true,
  })

  function handlePageChange(page: number) {
    const next = {
      ...urlFilters,
      page,
    }

    setSearchParams(filtersToSearchParams(next), {
      replace: false,
    })

    const results = document.getElementById(
      'services-results-heading',
    )

    results?.focus()
  }

  useEffect(() => {
    const responseMeta = servicesQuery.data?.meta

    if (
      !responseMeta ||
      !filtersValid ||
      !categoryReady
    ) {
      return
    }

    if (
      urlFilters.page > responseMeta.last_page &&
      responseMeta.last_page >= 1
    ) {
      const next = {
        ...urlFilters,
        page: responseMeta.last_page,
      }

      if (!filtersEqual(next, urlFilters)) {
        setSearchParams(filtersToSearchParams(next), {
          replace: true,
        })
      }
    }
  }, [
    categoryReady,
    filtersValid,
    servicesQuery.data?.meta,
    setSearchParams,
    urlFilters,
  ])

  const servicesRequestId =
    servicesQuery.error instanceof ApiClientError
      ? servicesQuery.error.normalized.requestId
      : null

  const servicesValidationMessage =
    servicesQuery.error instanceof ApiClientError &&
    servicesQuery.error.normalized.isValidationError
      ? servicesQuery.error.normalized.message
      : null

  const heroTitle =
    selectedCategory?.name ?? t('listTitle')

  const heroLead =
    selectedCategory?.description ??
    (categorySelected
      ? t('categoryLeadFallback')
      : t('listLead'))

  return (
    <div className="services-page">
      <header className="services-hero">
        <div className="services-container">
          <Reveal>
            <nav aria-label={t('breadcrumbServices')}>
              <ol className="services-breadcrumb">
                <li>
                  <Link to="/">
                    {t('breadcrumbHome')}
                  </Link>
                </li>

                <li
                  className="services-breadcrumb__sep"
                  aria-hidden="true"
                >
                  /
                </li>

                {categorySelected ? (
                  <>
                    <li>
                      <Link to="/services">
                        {t('breadcrumbServices')}
                      </Link>
                    </li>

                    <li
                      className="services-breadcrumb__sep"
                      aria-hidden="true"
                    >
                      /
                    </li>

                    <li aria-current="page">
                      {selectedCategory?.name ??
                        t('breadcrumbServices')}
                    </li>
                  </>
                ) : (
                  <li aria-current="page">
                    {t('breadcrumbServices')}
                  </li>
                )}
              </ol>
            </nav>

            <h1 className="services-hero__title">
              {heroTitle}
            </h1>

            <p className="services-hero__lead">
              {heroLead}
            </p>
          </Reveal>
        </div>
      </header>

      {!categorySelected ? (
        <section
          className="services-section services-section--categories"
          aria-labelledby="service-categories-heading"
        >
          <div className="services-container">
            <div className="service-categories__header">
              <p className="service-categories__eyebrow">
                {t('categoriesEyebrow')}
              </p>

              <h2 id="service-categories-heading">
                {t('categoriesTitle')}
              </h2>

              <p>{t('categoriesLead')}</p>
            </div>

            {categoriesQuery.isPending ? (
              <div
                className="service-categories-grid"
                aria-busy="true"
                aria-label={t('categoriesLoading')}
              >
                {Array.from({ length: 3 }).map(
                  (_, index) => (
                    <article
                      key={index}
                      className="service-category-card service-category-card--skeleton"
                      aria-hidden="true"
                    >
                      <span className="skeleton-line skeleton-line--short" />
                      <span className="skeleton-line" />
                      <span className="skeleton-line" />
                    </article>
                  ),
                )}
              </div>
            ) : null}

            {categoriesQuery.isError ? (
              <ErrorState
                title={t('categoriesErrorTitle')}
                description={t(
                  'categoriesErrorDescription',
                )}
                onRetry={() => {
                  void categoriesQuery.refetch()
                }}
              />
            ) : null}

            {categoriesQuery.isSuccess &&
            categories.length === 0 ? (
              <EmptyState
                title={t('categoriesEmptyTitle')}
                description={t(
                  'categoriesEmptyDescription',
                )}
              />
            ) : null}

            {categoriesQuery.isSuccess &&
            categories.length > 0 ? (
              <StaggerGroup className="service-categories-grid">
                {categories.map((category, index) => (
                  <article
                    key={category.id}
                    className="service-category-card"
                  >
                    <div className="service-category-card__number">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    <div className="service-category-card__content">
                      <h2>
                        <Link
                          to={`/services?category=${encodeURIComponent(
                            category.slug,
                          )}`}
                        >
                          {category.name}
                        </Link>
                      </h2>

                      <p>
                        {category.description ??
                          t(
                            'categoryDescriptionFallback',
                          )}
                      </p>
                    </div>

                    <Link
                      className="service-category-card__link"
                      to={`/services?category=${encodeURIComponent(
                        category.slug,
                      )}`}
                      aria-label={t(
                        'exploreCategoryNamed',
                        {
                          category: category.name,
                        },
                      )}
                    >
                      <span>
                        {t('exploreCategory')}
                      </span>

                      <ArrowRight
                        className="service-category-card__icon"
                        aria-hidden="true"
                        size={19}
                      />
                    </Link>
                  </article>
                ))}
              </StaggerGroup>
            ) : null}
          </div>
        </section>
      ) : (
        <section
          className="services-section services-section--category-results"
          aria-labelledby="services-results-heading"
        >
          <div className="services-container">
            <h2
              id="services-results-heading"
              className="visually-hidden"
              tabIndex={-1}
            >
              {t('categoryServicesLabel')}
            </h2>

            <div className="services-category-toolbar">
              <Link
                className="services-category-back"
                to="/services"
              >
                <span aria-hidden="true">←</span>
                <span>{t('backToCategories')}</span>
              </Link>

              {categoryReady ? (
                <div className="services-category-toolbar__summary">
                  <span>
                    {t('categoryServicesLabel')}
                  </span>

                  <strong>
                    {t('resultsCount', {
                      count: total,
                    })}
                  </strong>
                </div>
              ) : null}
            </div>

            {categoriesQuery.isPending ? (
              <ServicesGridSkeleton />
            ) : null}

            {categoriesQuery.isError ? (
              <ErrorState
                title={t('categoriesErrorTitle')}
                description={t(
                  'categoriesErrorDescription',
                )}
                onRetry={() => {
                  void categoriesQuery.refetch()
                }}
              />
            ) : null}

            {categoryMissing ? (
              <EmptyState
                title={t('categoryNotFoundTitle')}
                description={t(
                  'categoryNotFoundDescription',
                )}
              />
            ) : null}

            {categoryReady ? (
              <>
                {filtersValid &&
                servicesQuery.isPending ? (
                  <ServicesGridSkeleton />
                ) : null}

                {filtersValid &&
                servicesQuery.isError ? (
                  <ErrorState
                    title={t('errorTitle')}
                    description={
                      servicesValidationMessage ??
                      t('errorDescription')
                    }
                    requestId={servicesRequestId}
                    onRetry={() => {
                      void servicesQuery.refetch()
                    }}
                  />
                ) : null}

                {filtersValid &&
                servicesQuery.isSuccess &&
                services.length === 0 ? (
                  <EmptyState
                    title={t('categoryEmptyTitle')}
                    description={t(
                      'categoryEmptyDescription',
                    )}
                  />
                ) : null}

                {filtersValid &&
                servicesQuery.isSuccess &&
                services.length > 0 ? (
                  <>
                    <StaggerGroup className="services-grid">
                      {services.map(
                        (service, index) => (
                          <ServiceCard
                            key={service.id}
                            service={service}
                            index={
                              (currentPage - 1) *
                                DEFAULT_PER_PAGE +
                              index +
                              1
                            }
                            showCategory={false}
                          />
                        ),
                      )}
                    </StaggerGroup>

                    <ServicesPagination
                      currentPage={currentPage}
                      lastPage={lastPage}
                      onPageChange={handlePageChange}
                    />
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </section>
      )}

      <section className="services-cta">
        <div className="services-container">
          <div className="services-cta__panel">
            <h2>{t('ctaTitle')}</h2>

            <p>{t('ctaLead')}</p>

            <div className="services-cta__actions">
              <Link
                className="btn btn--lift"
                to="/contact"
              >
                {t('ctaContact')}
              </Link>

              <Link
                className="btn btn--secondary btn--lift"
                to="/"
              >
                {t('breadcrumbHome')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
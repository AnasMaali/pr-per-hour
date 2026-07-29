import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ApiClientError } from '@/shared/api/errors'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { BookingCard } from '@/features/bookings/components/BookingCard'
import { BookingFilters } from '@/features/bookings/components/BookingFilters'
import { BookingPagination } from '@/features/bookings/components/BookingPagination'
import { BookingSkeleton } from '@/features/bookings/components/BookingSkeleton'
import { useBookingServicesOptionsQuery } from '@/features/bookings/queries/useBookingServicesOptionsQuery'
import { useClientBookingsQuery } from '@/features/bookings/queries/useClientBookingsQuery'
import type {
  BookingFieldErrors,
  BookingFiltersState,
} from '@/features/bookings/types/bookings.types'
import {
  DEFAULT_BOOKING_FILTERS,
  bookingFiltersToSearchParams,
  hasActiveBookingFilters,
  parseBookingFiltersFromSearchParams,
  validateBookingFilters,
} from '@/features/bookings/utils/bookingFilters'
import '@/features/bookings/styles/client-bookings.css'

function filtersEqual(a: BookingFiltersState, b: BookingFiltersState): boolean {
  return (
    a.status === b.status &&
    a.service_id === b.service_id &&
    a.booking_date === b.booking_date &&
    a.date_from === b.date_from &&
    a.date_to === b.date_to &&
    a.sort === b.sort &&
    a.direction === b.direction &&
    a.page === b.page
  )
}

export function ClientBookingsPage() {
  const { t } = useTranslation('bookings')
  const [searchParams, setSearchParams] = useSearchParams()
  const urlFilters = useMemo(
    () => parseBookingFiltersFromSearchParams(searchParams),
    [searchParams],
  )
  const [draft, setDraft] = useState(urlFilters)
  const [validationErrors, setValidationErrors] = useState<BookingFieldErrors>(
    {},
  )

  useEffect(() => {
    setDraft(urlFilters)
    setValidationErrors({})
  }, [urlFilters])

  const clientErrors = validateBookingFilters(urlFilters)
  const filtersValid = Object.keys(clientErrors).length === 0
  const query = useClientBookingsQuery(urlFilters, filtersValid)
  const servicesQuery = useBookingServicesOptionsQuery()

  useDocumentMeta({
    title: t('listMetaTitle'),
    description: t('listMetaDescription'),
    robots: 'noindex, nofollow',
    syncThemeColor: true,
  })

  function applyFilters(next: BookingFiltersState) {
    const candidate = { ...next, page: 1 }
    const errors = validateBookingFilters(candidate)
    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) return
    setSearchParams(bookingFiltersToSearchParams(candidate), { replace: false })
  }

  function handleReset() {
    setValidationErrors({})
    setDraft(DEFAULT_BOOKING_FILTERS)
    setSearchParams(new URLSearchParams(), { replace: false })
  }

  function handlePageChange(page: number) {
    setSearchParams(
      bookingFiltersToSearchParams({ ...urlFilters, page }),
      { replace: false },
    )
    document.getElementById('bookings-results-heading')?.focus()
  }

  useEffect(() => {
    const meta = query.data?.meta
    if (!meta || !filtersValid) return
    if (urlFilters.page > meta.last_page && meta.last_page >= 1) {
      const next = { ...urlFilters, page: meta.last_page }
      if (!filtersEqual(next, urlFilters)) {
        setSearchParams(bookingFiltersToSearchParams(next), { replace: true })
      }
    }
  }, [query.data?.meta, urlFilters, filtersValid, setSearchParams])

  const requestId =
    query.error instanceof ApiClientError
      ? query.error.normalized.requestId
      : null

  const bookings = query.data?.bookings ?? []
  const meta = query.data?.meta
  const total = meta?.total ?? 0
  const currentPage = meta?.current_page ?? urlFilters.page
  const lastPage = meta?.last_page ?? 1
  const filtersActive = hasActiveBookingFilters(urlFilters)

  return (
    <div className="client-bookings-page">
      <header className="client-bookings-header">
        <div>
          <h1>{t('listTitle')}</h1>
          <p>{t('listLead')}</p>
        </div>
        <Link className="btn" to="/dashboard/bookings/new">
          {t('createBooking')}
        </Link>
      </header>

      <BookingFilters
        draft={draft}
        onDraftChange={setDraft}
        onSubmit={() => applyFilters(draft)}
        onReset={handleReset}
        services={servicesQuery.data ?? []}
        validationErrors={{
          ...validationErrors,
          ...(!filtersValid ? clientErrors : {}),
        }}
      />

      <section aria-labelledby="bookings-results-heading">
        <div className="client-bookings-toolbar">
          <h2 id="bookings-results-heading" tabIndex={-1}>
            {t('resultsHeading')}
          </h2>
          <p>
            {t('resultsCount', { count: total })}
            {lastPage > 0
              ? ` · ${t('resultsPage', { page: currentPage, lastPage })}`
              : null}
          </p>
        </div>

        {filtersValid && query.isPending ? <BookingSkeleton /> : null}

        {filtersValid && query.isError ? (
          <ErrorState
            title={t('listErrorTitle')}
            description={t('listErrorDescription')}
            requestId={requestId}
            onRetry={() => {
              void query.refetch()
            }}
          />
        ) : null}

        {filtersValid && query.isSuccess && bookings.length === 0 ? (
          <div>
            <EmptyState
              title={
                filtersActive ? t('filteredEmptyTitle') : t('emptyTitle')
              }
              description={
                filtersActive
                  ? t('filteredEmptyDescription')
                  : t('emptyDescription')
              }
            />
            <div className="client-bookings-empty-actions">
              {filtersActive ? (
                <Button type="button" variant="secondary" onClick={handleReset}>
                  {t('resetFilters')}
                </Button>
              ) : null}
              <Link className="btn" to="/dashboard/bookings/new">
                {t('createBooking')}
              </Link>
            </div>
          </div>
        ) : null}

        {filtersValid && query.isSuccess && bookings.length > 0 ? (
          <>
            <div className="booking-list">
              {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
            <BookingPagination
              currentPage={currentPage}
              lastPage={lastPage}
              onPageChange={handlePageChange}
            />
          </>
        ) : null}
      </section>
    </div>
  )
}

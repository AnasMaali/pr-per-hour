import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ApiClientError } from '@/shared/api/errors'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { AdminBookingsFilters } from '@/features/admin/bookings/components/AdminBookingsFilters'
import { AdminBookingsPagination } from '@/features/admin/bookings/components/AdminBookingsPagination'
import { AdminBookingsSkeleton } from '@/features/admin/bookings/components/AdminBookingsSkeleton'
import { AdminBookingsTable } from '@/features/admin/bookings/components/AdminBookingsTable'
import { useAdminBookingServiceOptionsQuery } from '@/features/admin/bookings/queries/useAdminBookingServiceOptionsQuery'
import { useAdminBookingsQuery } from '@/features/admin/bookings/queries/useAdminBookingsQuery'
import type { AdminBookingFiltersState } from '@/features/admin/bookings/types/adminBookings.types'
import {
  adminBookingFiltersToSearchParams,
  DEFAULT_ADMIN_BOOKING_FILTERS,
  hasActiveAdminBookingFilters,
  parseAdminBookingFilters,
} from '@/features/admin/bookings/utils/adminBookingFilters'
import { validateDateRange } from '@/features/admin/bookings/utils/adminBookingValidation'
import '@/features/admin/bookings/styles/admin-bookings.css'

export function AdminBookingsPage() {
  const { t } = useTranslation('adminBookings')
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(
    () => parseAdminBookingFilters(searchParams),
    [searchParams],
  )
  const [draft, setDraft] = useState<AdminBookingFiltersState>(filters)
  const [filterError, setFilterError] = useState<string | null>(null)

  useEffect(() => {
    setDraft(filters)
  }, [filters])

  const listQuery = useAdminBookingsQuery(filters)
  const servicesQuery = useAdminBookingServiceOptionsQuery()

  useDocumentMeta({
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: 'noindex, nofollow',
    syncThemeColor: true,
  })

  const listRequestId =
    listQuery.error instanceof ApiClientError
      ? listQuery.error.normalized.requestId
      : null

  function applyFilters(next: AdminBookingFiltersState) {
    const rangeError = validateDateRange(next.date_from, next.date_to)
    if (rangeError) {
      setFilterError(t(rangeError))
      return
    }
    setFilterError(null)
    setSearchParams(adminBookingFiltersToSearchParams(next), { replace: true })
  }

  const bookings = listQuery.data?.bookings ?? []
  const meta = listQuery.data?.meta
  const filtered = hasActiveAdminBookingFilters(filters)

  return (
    <div className="admin-bookings-page">
      <header className="admin-bookings-header">
        <div>
          <h1>{t('pageTitle')}</h1>
          <p>{t('lead')}</p>
        </div>
      </header>

      <aside
        className="admin-bookings-notice"
        aria-labelledby="bookings-scope-heading"
      >
        <h2 id="bookings-scope-heading">{t('scopeTitle')}</h2>
        <p>{t('scopeBody')}</p>
      </aside>

      <AdminBookingsFilters
        draft={draft}
        services={servicesQuery.data ?? []}
        servicesLoading={servicesQuery.isPending}
        servicesError={servicesQuery.isError}
        filterError={filterError}
        onChange={setDraft}
        onApply={() => applyFilters({ ...draft, page: 1 })}
        onReset={() => {
          setDraft(DEFAULT_ADMIN_BOOKING_FILTERS)
          setFilterError(null)
          applyFilters(DEFAULT_ADMIN_BOOKING_FILTERS)
        }}
        onRetryServices={() => {
          void servicesQuery.refetch()
        }}
      />

      {meta ? (
        <p className="admin-bookings-count">
          {t('countSummary', { total: meta.total })}
        </p>
      ) : null}

      {listQuery.isPending ? <AdminBookingsSkeleton /> : null}

      {listQuery.isError ? (
        <ErrorState
          title={t('listErrorTitle')}
          description={t('listErrorDescription')}
          requestId={listRequestId}
          onRetry={() => {
            void listQuery.refetch()
          }}
        />
      ) : null}

      {listQuery.isSuccess && bookings.length === 0 ? (
        <div className="admin-bookings-empty">
          <EmptyState
            title={filtered ? t('filteredEmptyTitle') : t('emptyTitle')}
            description={
              filtered ? t('filteredEmptyDescription') : t('emptyDescription')
            }
          />
          {filtered ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setDraft(DEFAULT_ADMIN_BOOKING_FILTERS)
                applyFilters(DEFAULT_ADMIN_BOOKING_FILTERS)
              }}
            >
              {t('resetFilters')}
            </Button>
          ) : null}
        </div>
      ) : null}

      {listQuery.isSuccess && bookings.length > 0 ? (
        <AdminBookingsTable bookings={bookings} />
      ) : null}

      {meta ? (
        <AdminBookingsPagination
          currentPage={meta.current_page}
          lastPage={meta.last_page}
          onPrevious={() =>
            applyFilters({ ...filters, page: meta.current_page - 1 })
          }
          onNext={() =>
            applyFilters({ ...filters, page: meta.current_page + 1 })
          }
        />
      ) : null}
    </div>
  )
}

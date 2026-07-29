import { useEffect, useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ApiClientError } from '@/shared/api/errors'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { ContactMessagesFilters } from '@/features/admin/contact-messages/components/ContactMessagesFilters'
import { ContactMessagesPagination } from '@/features/admin/contact-messages/components/ContactMessagesPagination'
import { ContactMessagesSkeleton } from '@/features/admin/contact-messages/components/ContactMessagesSkeleton'
import { ContactMessagesTable } from '@/features/admin/contact-messages/components/ContactMessagesTable'
import { useAdminContactMessagesQuery } from '@/features/admin/contact-messages/queries/useAdminContactMessagesQuery'
import type { AdminContactMessageFiltersState } from '@/features/admin/contact-messages/types/adminContactMessages.types'
import {
  contactMessageFiltersToSearchParams,
  DEFAULT_ADMIN_CONTACT_MESSAGE_FILTERS,
  hasActiveAdminContactMessageFilters,
  parseAdminContactMessageFilters,
} from '@/features/admin/contact-messages/utils/contactMessageFilters'
import {
  normalizeEmailFilter,
  validateCreatedDateRange,
} from '@/features/admin/contact-messages/utils/contactMessageValidation'
import '@/features/admin/contact-messages/styles/admin-contact-messages.css'

export function AdminContactMessagesPage() {
  const { t, i18n } = useTranslation('adminContactMessages')
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(
    () => parseAdminContactMessageFilters(searchParams),
    [searchParams],
  )
  const [draft, setDraft] = useState<AdminContactMessageFiltersState>(filters)
  const [filterError, setFilterError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    setDraft(filters)
  }, [filters])

  useEffect(() => {
    const state = location.state as { contactMessageDeleted?: boolean } | null
    if (state?.contactMessageDeleted) {
      setSuccessMessage(t('successDeleted'))
      window.history.replaceState({}, document.title)
    }
  }, [location.state, t])

  const listQuery = useAdminContactMessagesQuery(filters)

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

  function applyFilters(next: AdminContactMessageFiltersState) {
    const rangeError = validateCreatedDateRange(
      next.created_from,
      next.created_to,
    )
    if (rangeError) {
      setFilterError(t(rangeError))
      return
    }
    setFilterError(null)
    const normalized: AdminContactMessageFiltersState = {
      ...next,
      email: normalizeEmailFilter(next.email),
      organization: next.organization.trim(),
      search: next.search.trim(),
    }
    setSearchParams(contactMessageFiltersToSearchParams(normalized), {
      replace: true,
    })
  }

  const messages = listQuery.data?.messages ?? []
  const meta = listQuery.data?.meta
  const filtered = hasActiveAdminContactMessageFilters(filters)

  return (
    <div className="admin-contact-messages-page">
      <header className="admin-contact-messages-header">
        <div>
          <h1>{t('pageTitle')}</h1>
          <p>{t('lead')}</p>
        </div>
      </header>

      <aside
        className="admin-contact-messages-notice"
        aria-labelledby="contact-messages-scope-heading"
      >
        <h2 id="contact-messages-scope-heading">{t('scopeTitle')}</h2>
        <p>{t('scopeBody')}</p>
      </aside>

      {successMessage ? (
        <div
          className="admin-contact-messages-success"
          role="status"
          aria-live="polite"
        >
          <p>{successMessage}</p>
        </div>
      ) : null}

      <ContactMessagesFilters
        draft={draft}
        filterError={filterError}
        onChange={setDraft}
        onApply={() => applyFilters({ ...draft, page: 1 })}
        onReset={() => {
          setDraft(DEFAULT_ADMIN_CONTACT_MESSAGE_FILTERS)
          setFilterError(null)
          applyFilters(DEFAULT_ADMIN_CONTACT_MESSAGE_FILTERS)
        }}
      />

      {meta ? (
        <p className="admin-contact-messages-count">
          {t('countSummary', { total: meta.total })}
        </p>
      ) : null}

      {listQuery.isPending ? <ContactMessagesSkeleton /> : null}

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

      {listQuery.isSuccess && messages.length === 0 ? (
        <div className="admin-contact-messages-empty">
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
                setDraft(DEFAULT_ADMIN_CONTACT_MESSAGE_FILTERS)
                applyFilters(DEFAULT_ADMIN_CONTACT_MESSAGE_FILTERS)
              }}
            >
              {t('resetFilters')}
            </Button>
          ) : null}
        </div>
      ) : null}

      {listQuery.isSuccess && messages.length > 0 ? (
        <ContactMessagesTable messages={messages} locale={i18n.language} />
      ) : null}

      {meta ? (
        <ContactMessagesPagination
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

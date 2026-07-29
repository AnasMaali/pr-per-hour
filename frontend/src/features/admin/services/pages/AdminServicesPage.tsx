import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ApiClientError } from '@/shared/api/errors'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { AdminServicesSkeleton } from '@/features/admin/services/components/AdminServicesSkeleton'
import { AdminServicesTable } from '@/features/admin/services/components/AdminServicesTable'
import { ServiceDeleteDialog } from '@/features/admin/services/components/ServiceDeleteDialog'
import { ServiceFormDialog } from '@/features/admin/services/components/ServiceFormDialog'
import { ServicesFilters } from '@/features/admin/services/components/ServicesFilters'
import { useAdminServiceCategoryOptionsQuery } from '@/features/admin/services/queries/useAdminServiceCategoryOptionsQuery'
import { useAdminServicesQuery } from '@/features/admin/services/queries/useAdminServicesQuery'
import { useCreateServiceMutation } from '@/features/admin/services/queries/useCreateServiceMutation'
import { useDeleteServiceMutation } from '@/features/admin/services/queries/useDeleteServiceMutation'
import { useRestoreServiceMutation } from '@/features/admin/services/queries/useRestoreServiceMutation'
import {
  useUpdateServiceMutation,
  useUpdateServiceStatusMutation,
} from '@/features/admin/services/queries/useUpdateServiceMutation'
import type {
  AdminService,
  CreateServicePayload,
  ServiceFieldErrors,
  ServiceFiltersState,
  UpdateServicePayload,
} from '@/features/admin/services/types/adminServices.types'
import {
  DEFAULT_SERVICE_FILTERS,
  parseServiceFiltersFromSearchParams,
  serviceFiltersToSearchParams,
} from '@/features/admin/services/utils/serviceFormatting'
import { mapServiceApiError } from '@/features/admin/services/utils/mapServiceApiError'
import '@/features/admin/services/styles/admin-services.css'

export function AdminServicesPage() {
  const { t } = useTranslation('adminServices')
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(
    () => parseServiceFiltersFromSearchParams(searchParams),
    [searchParams],
  )
  const [draft, setDraft] = useState<ServiceFiltersState>(filters)

  useEffect(() => {
    setDraft(filters)
  }, [filters])

  const listQuery = useAdminServicesQuery(filters)
  const categoriesQuery = useAdminServiceCategoryOptionsQuery()
  const createMutation = useCreateServiceMutation()
  const updateMutation = useUpdateServiceMutation()
  const statusMutation = useUpdateServiceStatusMutation()
  const deleteMutation = useDeleteServiceMutation()
  const restoreMutation = useRestoreServiceMutation()

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editing, setEditing] = useState<AdminService | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminService | null>(null)
  const [apiFieldErrors, setApiFieldErrors] = useState<ServiceFieldErrors>({})
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteRequestId, setDeleteRequestId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [undoDelete, setUndoDelete] = useState<{
    id: number
    title: string
  } | null>(null)

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

  const formPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    statusMutation.isPending

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.category_id) ||
    Boolean(filters.is_active) ||
    Boolean(filters.currency) ||
    filters.sort !== DEFAULT_SERVICE_FILTERS.sort ||
    filters.direction !== DEFAULT_SERVICE_FILTERS.direction

  function applyFilters(next: ServiceFiltersState) {
    setSearchParams(serviceFiltersToSearchParams(next), { replace: true })
  }

  function openCreate() {
    setFormMode('create')
    setEditing(null)
    setApiFieldErrors({})
    setFormMessage(null)
    setRequestId(null)
    setSuccessMessage(null)
    setFormOpen(true)
  }

  function openEdit(service: AdminService) {
    setFormMode('edit')
    setEditing(service)
    setApiFieldErrors({})
    setFormMessage(null)
    setRequestId(null)
    setSuccessMessage(null)
    setFormOpen(true)
  }

  async function handleCreate(payload: CreateServicePayload) {
    setApiFieldErrors({})
    setFormMessage(null)
    setRequestId(null)
    try {
      await createMutation.mutateAsync(payload)
      setFormOpen(false)
      setSuccessMessage(t('successCreated'))
      setUndoDelete(null)
    } catch (error) {
      const mapped = mapServiceApiError(error)
      setApiFieldErrors(mapped.fieldErrors)
      setRequestId(mapped.requestId)
      setFormMessage(
        mapped.formMessageKey ? t(mapped.formMessageKey) : mapped.formMessage,
      )
    }
  }

  async function handleUpdate(args: {
    id: number
    content: UpdateServicePayload | null
    statusChanged: boolean
    is_active: boolean
  }) {
    setApiFieldErrors({})
    setFormMessage(null)
    setRequestId(null)
    try {
      if (args.content) {
        await updateMutation.mutateAsync({
          id: args.id,
          payload: args.content,
        })
      }
      if (args.statusChanged) {
        await statusMutation.mutateAsync({
          id: args.id,
          payload: { is_active: args.is_active },
        })
      }
      setFormOpen(false)
      setEditing(null)
      setSuccessMessage(t('successUpdated'))
      setUndoDelete(null)
    } catch (error) {
      const mapped = mapServiceApiError(error)
      setApiFieldErrors(mapped.fieldErrors)
      setRequestId(mapped.requestId)
      setFormMessage(
        mapped.formMessageKey ? t(mapped.formMessageKey) : mapped.formMessage,
      )
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteError(null)
    setDeleteRequestId(null)
    const snapshot = { id: deleteTarget.id, title: deleteTarget.title }
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
      setUndoDelete(snapshot)
      setSuccessMessage(t('successDeleted', { title: snapshot.title }))
    } catch (error) {
      const mapped = mapServiceApiError(error)
      setDeleteRequestId(mapped.requestId)
      setDeleteError(
        mapped.formMessageKey ? t(mapped.formMessageKey) : mapped.formMessage,
      )
    }
  }

  async function handleUndoRestore() {
    if (!undoDelete) return
    try {
      await restoreMutation.mutateAsync(undoDelete.id)
      setSuccessMessage(t('successRestored', { title: undoDelete.title }))
      setUndoDelete(null)
    } catch (error) {
      const mapped = mapServiceApiError(error)
      setSuccessMessage(null)
      setFormMessage(
        mapped.formMessageKey ? t(mapped.formMessageKey) : mapped.formMessage,
      )
      setRequestId(mapped.requestId)
    }
  }

  const services = listQuery.data?.services ?? []
  const meta = listQuery.data?.meta
  const categories = categoriesQuery.data ?? []

  return (
    <div className="admin-services-page">
      <header className="admin-services-header">
        <div>
          <h1>{t('pageTitle')}</h1>
          <p>{t('lead')}</p>
        </div>
        <Button type="button" onClick={openCreate}>
          {t('createService')}
        </Button>
      </header>

      <aside
        className="admin-services-notice"
        aria-labelledby="services-limit-heading"
      >
        <h2 id="services-limit-heading">{t('limitationTitle')}</h2>
        <p>{t('limitationBody')}</p>
      </aside>

      {successMessage ? (
        <div
          className="admin-services-success"
          role="status"
          aria-live="polite"
        >
          <p>{successMessage}</p>
          {undoDelete ? (
            <Button
              type="button"
              variant="secondary"
              disabled={restoreMutation.isPending}
              onClick={() => {
                void handleUndoRestore()
              }}
            >
              {restoreMutation.isPending ? t('restoring') : t('restore')}
            </Button>
          ) : null}
        </div>
      ) : null}

      {formMessage && !formOpen ? (
        <div className="service-form-error" role="alert">
          <p>{formMessage}</p>
          {requestId ? (
            <p className="service-form-error__meta">
              {t('requestId')}: <code>{requestId}</code>
            </p>
          ) : null}
        </div>
      ) : null}

      <ServicesFilters
        draft={draft}
        categories={categories}
        categoriesLoading={categoriesQuery.isPending}
        categoriesError={categoriesQuery.isError}
        onChange={setDraft}
        onApply={() => applyFilters({ ...draft, page: 1 })}
        onReset={() => {
          setDraft(DEFAULT_SERVICE_FILTERS)
          applyFilters(DEFAULT_SERVICE_FILTERS)
        }}
        onRetryCategories={() => {
          void categoriesQuery.refetch()
        }}
      />

      {meta ? (
        <p className="admin-services-count">
          {t('countSummary', { total: meta.total })}
        </p>
      ) : null}

      {listQuery.isPending ? <AdminServicesSkeleton /> : null}

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

      {listQuery.isSuccess && services.length === 0 ? (
        <div className="admin-services-empty">
          <EmptyState
            title={
              hasActiveFilters ? t('filteredEmptyTitle') : t('emptyTitle')
            }
            description={
              hasActiveFilters
                ? t('filteredEmptyDescription')
                : t('emptyDescription')
            }
          />
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setDraft(DEFAULT_SERVICE_FILTERS)
                applyFilters(DEFAULT_SERVICE_FILTERS)
              }}
            >
              {t('resetFilters')}
            </Button>
          ) : (
            <Button type="button" onClick={openCreate}>
              {t('createService')}
            </Button>
          )}
        </div>
      ) : null}

      {listQuery.isSuccess && services.length > 0 ? (
        <AdminServicesTable
          services={services}
          onEdit={openEdit}
          onDelete={(service) => {
            setDeleteError(null)
            setDeleteRequestId(null)
            setDeleteTarget(service)
          }}
        />
      ) : null}

      {meta && meta.last_page > 1 ? (
        <nav
          className="admin-services-pagination"
          aria-label={t('pagination')}
        >
          <Button
            type="button"
            variant="secondary"
            disabled={meta.current_page <= 1}
            onClick={() =>
              applyFilters({ ...filters, page: meta.current_page - 1 })
            }
          >
            {t('previousPage')}
          </Button>
          <span>
            {t('pageStatus', {
              current: meta.current_page,
              last: meta.last_page,
            })}
          </span>
          <Button
            type="button"
            variant="secondary"
            disabled={meta.current_page >= meta.last_page}
            onClick={() =>
              applyFilters({ ...filters, page: meta.current_page + 1 })
            }
          >
            {t('nextPage')}
          </Button>
        </nav>
      ) : null}

      <ServiceFormDialog
        open={formOpen}
        mode={formMode}
        service={editing}
        categories={categories}
        categoriesLoading={categoriesQuery.isPending}
        categoriesError={categoriesQuery.isError}
        pending={formPending}
        apiFieldErrors={apiFieldErrors}
        formMessage={formMessage}
        requestId={requestId}
        onClose={() => {
          if (!formPending) setFormOpen(false)
        }}
        onRetryCategories={() => {
          void categoriesQuery.refetch()
        }}
        onCreate={(payload) => {
          void handleCreate(payload)
        }}
        onUpdate={(args) => {
          void handleUpdate(args)
        }}
      />

      <ServiceDeleteDialog
        open={Boolean(deleteTarget)}
        service={deleteTarget}
        pending={deleteMutation.isPending}
        errorMessage={deleteError}
        requestId={deleteRequestId}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteTarget(null)
        }}
        onConfirm={() => {
          void handleDelete()
        }}
      />
    </div>
  )
}

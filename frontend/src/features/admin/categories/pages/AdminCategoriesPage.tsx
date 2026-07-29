import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ApiClientError } from '@/shared/api/errors'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { CategoriesSkeleton } from '@/features/admin/categories/components/CategoriesSkeleton'
import { CategoriesTable } from '@/features/admin/categories/components/CategoriesTable'
import { CategoryDeleteDialog } from '@/features/admin/categories/components/CategoryDeleteDialog'
import { CategoryFormDialog } from '@/features/admin/categories/components/CategoryFormDialog'
import { useAdminCategoriesQuery } from '@/features/admin/categories/queries/useAdminCategoriesQuery'
import { useCreateCategoryMutation } from '@/features/admin/categories/queries/useCreateCategoryMutation'
import { useDeleteCategoryMutation } from '@/features/admin/categories/queries/useDeleteCategoryMutation'
import { useRestoreCategoryMutation } from '@/features/admin/categories/queries/useRestoreCategoryMutation'
import {
  useUpdateCategoryMutation,
  useUpdateCategoryStatusMutation,
} from '@/features/admin/categories/queries/useUpdateCategoryMutation'
import type {
  AdminCategory,
  CategoryFieldErrors,
  CategoryFiltersState,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/features/admin/categories/types/adminCategories.types'
import {
  categoryFiltersToSearchParams,
  DEFAULT_CATEGORY_FILTERS,
  parseCategoryFiltersFromSearchParams,
} from '@/features/admin/categories/utils/categoryFormatting'
import { mapCategoryApiError } from '@/features/admin/categories/utils/mapCategoryApiError'
import '@/features/admin/categories/styles/admin-categories.css'

export function AdminCategoriesPage() {
  const { t } = useTranslation('adminCategories')
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(
    () => parseCategoryFiltersFromSearchParams(searchParams),
    [searchParams],
  )
  const [draft, setDraft] = useState<CategoryFiltersState>(filters)

  useEffect(() => {
    setDraft(filters)
  }, [filters])

  const listQuery = useAdminCategoriesQuery(filters)
  const createMutation = useCreateCategoryMutation()
  const updateMutation = useUpdateCategoryMutation()
  const statusMutation = useUpdateCategoryStatusMutation()
  const deleteMutation = useDeleteCategoryMutation()
  const restoreMutation = useRestoreCategoryMutation()

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editing, setEditing] = useState<AdminCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null)
  const [apiFieldErrors, setApiFieldErrors] = useState<CategoryFieldErrors>({})
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteRequestId, setDeleteRequestId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [undoDelete, setUndoDelete] = useState<{
    id: number
    name: string
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

  function applyFilters(next: CategoryFiltersState) {
    setSearchParams(categoryFiltersToSearchParams(next), { replace: true })
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

  function openEdit(category: AdminCategory) {
    setFormMode('edit')
    setEditing(category)
    setApiFieldErrors({})
    setFormMessage(null)
    setRequestId(null)
    setSuccessMessage(null)
    setFormOpen(true)
  }

  async function handleCreate(payload: CreateCategoryPayload) {
    setApiFieldErrors({})
    setFormMessage(null)
    setRequestId(null)
    try {
      await createMutation.mutateAsync(payload)
      setFormOpen(false)
      setSuccessMessage(t('successCreated'))
      setUndoDelete(null)
    } catch (error) {
      const mapped = mapCategoryApiError(error)
      setApiFieldErrors(mapped.fieldErrors)
      setRequestId(mapped.requestId)
      setFormMessage(
        mapped.formMessageKey ? t(mapped.formMessageKey) : mapped.formMessage,
      )
    }
  }

  async function handleUpdate(args: {
    id: number
    content: UpdateCategoryPayload | null
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
      const mapped = mapCategoryApiError(error)
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
    const snapshot = { id: deleteTarget.id, name: deleteTarget.name }
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
      setUndoDelete(snapshot)
      setSuccessMessage(t('successDeleted', { name: snapshot.name }))
    } catch (error) {
      const mapped = mapCategoryApiError(error)
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
      setSuccessMessage(t('successRestored', { name: undoDelete.name }))
      setUndoDelete(null)
    } catch (error) {
      const mapped = mapCategoryApiError(error)
      setSuccessMessage(null)
      setFormMessage(
        mapped.formMessageKey ? t(mapped.formMessageKey) : mapped.formMessage,
      )
      setRequestId(mapped.requestId)
    }
  }

  const categories = listQuery.data?.categories ?? []
  const meta = listQuery.data?.meta

  return (
    <div className="admin-categories-page">
      <header className="admin-categories-header">
        <div>
          <h1>{t('title')}</h1>
          <p>{t('lead')}</p>
        </div>
        <Button type="button" onClick={openCreate}>
          {t('createCategory')}
        </Button>
      </header>

      <aside className="admin-categories-notice" aria-labelledby="categories-limit-heading">
        <h2 id="categories-limit-heading">{t('limitationTitle')}</h2>
        <p>{t('limitationBody')}</p>
      </aside>

      {successMessage ? (
        <div className="admin-categories-success" role="status" aria-live="polite">
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
              {restoreMutation.isPending ? t('restoring') : t('undoRestore')}
            </Button>
          ) : null}
        </div>
      ) : null}

      {formMessage && !formOpen ? (
        <div className="category-form-error" role="alert">
          <p>{formMessage}</p>
          {requestId ? (
            <p className="category-form-error__meta">
              {t('requestId')}: <code>{requestId}</code>
            </p>
          ) : null}
        </div>
      ) : null}

      <form
        className="admin-categories-filters"
        onSubmit={(event) => {
          event.preventDefault()
          applyFilters({ ...draft, page: 1 })
        }}
      >
        <Input
          id="category-search"
          name="search"
          label={t('search')}
          value={draft.search}
          onChange={(event) =>
            setDraft((current) => ({ ...current, search: event.target.value }))
          }
        />
        <Select
          id="category-active"
          name="is_active"
          label={t('filterActive')}
          value={draft.is_active}
          options={[
            { value: '', label: t('filterActiveAll') },
            { value: 'true', label: t('active') },
            { value: 'false', label: t('inactive') },
          ]}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              is_active: event.target.value as CategoryFiltersState['is_active'],
            }))
          }
        />
        <div className="admin-categories-filters__actions">
          <Button type="submit">{t('applyFilters')}</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setDraft(DEFAULT_CATEGORY_FILTERS)
              applyFilters(DEFAULT_CATEGORY_FILTERS)
            }}
          >
            {t('resetFilters')}
          </Button>
        </div>
      </form>

      {meta ? (
        <p className="admin-categories-count">
          {t('countSummary', { total: meta.total })}
        </p>
      ) : null}

      {listQuery.isPending ? <CategoriesSkeleton /> : null}

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

      {listQuery.isSuccess && categories.length === 0 ? (
        <div className="admin-categories-empty">
          <EmptyState
            title={t('emptyTitle')}
            description={t('emptyDescription')}
          />
          <Button type="button" onClick={openCreate}>
            {t('createCategory')}
          </Button>
        </div>
      ) : null}

      {listQuery.isSuccess && categories.length > 0 ? (
        <CategoriesTable
          categories={categories}
          onEdit={openEdit}
          onDelete={(category) => {
            setDeleteError(null)
            setDeleteRequestId(null)
            setDeleteTarget(category)
          }}
        />
      ) : null}

      {meta && meta.last_page > 1 ? (
        <nav className="admin-categories-pagination" aria-label={t('pagination')}>
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

      <CategoryFormDialog
        open={formOpen}
        mode={formMode}
        category={editing}
        pending={formPending}
        apiFieldErrors={apiFieldErrors}
        formMessage={formMessage}
        requestId={requestId}
        onClose={() => {
          if (!formPending) setFormOpen(false)
        }}
        onCreate={(payload) => {
          void handleCreate(payload)
        }}
        onUpdate={(args) => {
          void handleUpdate(args)
        }}
      />

      <CategoryDeleteDialog
        open={Boolean(deleteTarget)}
        category={deleteTarget}
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

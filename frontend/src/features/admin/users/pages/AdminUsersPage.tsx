import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import { ApiClientError } from '@/shared/api/errors'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import {
  useAdminUsersQuery,
  useUpdateAdminUserStatusMutation,
} from '@/features/admin/users/queries/useAdminUsersQuery'
import type {
  AdminUsersFiltersState,
  AdminUserStatus,
} from '@/features/admin/users/types/adminUsers.types'
import '@/features/admin/users/styles/admin-users.css'

const DEFAULT_FILTERS: AdminUsersFiltersState = {
  search: '',
  role: '',
  status: '',
  page: 1,
}

export function AdminUsersPage() {
  const { t, i18n } = useTranslation('adminUsers')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [draft, setDraft] = useState(DEFAULT_FILTERS)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const listQuery = useAdminUsersQuery(filters)
  const statusMutation = useUpdateAdminUserStatusMutation()

  useDocumentMeta({
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: 'noindex, nofollow',
    syncThemeColor: true,
  })

  const requestId = useMemo(() => {
    const error = listQuery.error
    return error instanceof ApiClientError ? error.normalized.requestId : null
  }, [listQuery.error])

  const users = listQuery.data?.users ?? []
  const meta = listQuery.data?.meta

  async function toggleStatus(id: number, current: AdminUserStatus) {
    setStatusMessage(null)
    const next: AdminUserStatus = current === 'active' ? 'inactive' : 'active'
    try {
      await statusMutation.mutateAsync({ id, status: next })
      setStatusMessage(next === 'active' ? t('activated') : t('deactivated'))
    } catch {
      setStatusMessage(t('statusUpdateError'))
    }
  }

  return (
    <div className="admin-users-page">
      <header className="admin-users-header">
        <div>
          <h1>{t('title')}</h1>
          <p>{t('lead')}</p>
        </div>
      </header>

      {statusMessage ? (
        <div className="admin-users-message" role="status" aria-live="polite">
          {statusMessage}
        </div>
      ) : null}

      <form
        className="admin-users-filters"
        onSubmit={(event) => {
          event.preventDefault()
          setFilters({ ...draft, page: 1 })
        }}
      >
        <Input
          id="admin-user-search"
          name="search"
          label={t('search')}
          value={draft.search}
          onChange={(event) =>
            setDraft((current) => ({ ...current, search: event.target.value }))
          }
        />
        <Select
          id="admin-user-role"
          name="role"
          label={t('role')}
          value={draft.role}
          options={[
            { value: '', label: t('allRoles') },
            { value: 'client', label: t('roleClient') },
            { value: 'admin', label: t('roleAdmin') },
          ]}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              role: event.target.value as AdminUsersFiltersState['role'],
            }))
          }
        />
        <Select
          id="admin-user-status"
          name="status"
          label={t('status')}
          value={draft.status}
          options={[
            { value: '', label: t('allStatuses') },
            { value: 'active', label: t('active') },
            { value: 'inactive', label: t('inactive') },
          ]}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              status: event.target.value as AdminUsersFiltersState['status'],
            }))
          }
        />
        <div className="admin-users-filters__actions">
          <Button type="submit">{t('applyFilters')}</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setDraft(DEFAULT_FILTERS)
              setFilters(DEFAULT_FILTERS)
            }}
          >
            {t('resetFilters')}
          </Button>
        </div>
      </form>

      {meta ? <p>{t('countSummary', { total: meta.total })}</p> : null}

      {listQuery.isPending ? <p>{t('loading')}</p> : null}

      {listQuery.isError ? (
        <ErrorState
          title={t('errorTitle')}
          description={t('errorDescription')}
          requestId={requestId}
          onRetry={() => void listQuery.refetch()}
        />
      ) : null}

      {listQuery.isSuccess && users.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
      ) : null}

      {listQuery.isSuccess && users.length > 0 ? (
        <div className="admin-users-table-wrap">
          <table className="admin-users-table">
            <caption className="visually-hidden">{t('tableCaption')}</caption>
            <thead>
              <tr>
                <th scope="col">{t('name')}</th>
                <th scope="col">{t('email')}</th>
                <th scope="col">{t('phone')}</th>
                <th scope="col">{t('role')}</th>
                <th scope="col">{t('status')}</th>
                <th scope="col">{t('registered')}</th>
                <th scope="col"><span className="visually-hidden">{t('actions')}</span></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.name}</strong></td>
                  <td><a href={`mailto:${user.email}`}>{user.email}</a></td>
                  <td>{user.phone ?? t('notProvided')}</td>
                  <td>{user.role === 'admin' ? t('roleAdmin') : t('roleClient')}</td>
                  <td>
                    <span className={`admin-user-status admin-user-status--${user.status}`}>
                      {user.status === 'active' ? t('active') : t('inactive')}
                    </span>
                  </td>
                  <td>{new Intl.DateTimeFormat(i18n.language).format(new Date(user.created_at))}</td>
                  <td>
                    {user.role === 'client' ? (
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={statusMutation.isPending}
                        onClick={() => void toggleStatus(user.id, user.status)}
                      >
                        {user.status === 'active' ? t('deactivate') : t('activate')}
                      </Button>
                    ) : (
                      <span>{t('protectedAdmin')}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {meta && meta.last_page > 1 ? (
        <nav className="admin-users-pagination" aria-label={t('pagination')}>
          <Button
            type="button"
            variant="secondary"
            disabled={meta.current_page <= 1}
            onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
          >
            {t('previousPage')}
          </Button>
          <span>{t('pageStatus', { current: meta.current_page, last: meta.last_page })}</span>
          <Button
            type="button"
            variant="secondary"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
          >
            {t('nextPage')}
          </Button>
        </nav>
      ) : null}
    </div>
  )
}

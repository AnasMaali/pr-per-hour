import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import type {
  AdminContactMessageFiltersState,
  AdminContactMessageSortDirection,
  AdminContactMessageSortField,
  AdminContactMessageStatus,
} from '@/features/admin/contact-messages/types/adminContactMessages.types'

interface ContactMessagesFiltersProps {
  draft: AdminContactMessageFiltersState
  filterError: string | null
  onChange: (next: AdminContactMessageFiltersState) => void
  onApply: () => void
  onReset: () => void
}

export function ContactMessagesFilters({
  draft,
  filterError,
  onChange,
  onApply,
  onReset,
}: ContactMessagesFiltersProps) {
  const { t } = useTranslation('adminContactMessages')

  return (
    <form
      className="admin-contact-messages-filters"
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
    >
      <Input
        id="admin-contact-search"
        name="search"
        label={t('search')}
        value={draft.search}
        hint={t('searchHint')}
        onChange={(event) =>
          onChange({ ...draft, search: event.target.value })
        }
      />

      <Select
        id="admin-contact-status"
        name="status"
        label={t('statusField')}
        value={draft.status}
        options={[
          { value: '', label: t('filterStatusAll') },
          { value: 'new', label: t('status.new') },
          { value: 'read', label: t('status.read') },
          { value: 'replied', label: t('status.replied') },
          { value: 'closed', label: t('status.closed') },
        ]}
        onChange={(event) =>
          onChange({
            ...draft,
            status: event.target.value as '' | AdminContactMessageStatus,
          })
        }
      />

      <Input
        id="admin-contact-email"
        name="email"
        type="email"
        label={t('filterEmail')}
        value={draft.email}
        hint={t('filterEmailHint')}
        onChange={(event) =>
          onChange({ ...draft, email: event.target.value })
        }
      />

      <Input
        id="admin-contact-organization"
        name="organization"
        label={t('filterOrganization')}
        value={draft.organization}
        hint={t('filterOrganizationHint')}
        onChange={(event) =>
          onChange({ ...draft, organization: event.target.value })
        }
      />

      <Input
        id="admin-contact-created-from"
        name="created_from"
        type="date"
        label={t('createdFrom')}
        value={draft.created_from}
        onChange={(event) =>
          onChange({ ...draft, created_from: event.target.value })
        }
      />

      <Input
        id="admin-contact-created-to"
        name="created_to"
        type="date"
        label={t('createdTo')}
        value={draft.created_to}
        onChange={(event) =>
          onChange({ ...draft, created_to: event.target.value })
        }
      />

      <Select
        id="admin-contact-sort"
        name="sort"
        label={t('sort')}
        value={draft.sort}
        options={[
          { value: 'created_at', label: t('sortCreated') },
          { value: 'updated_at', label: t('sortUpdated') },
          { value: 'full_name', label: t('sortName') },
          { value: 'email', label: t('sortEmail') },
          { value: 'status', label: t('sortStatus') },
          { value: 'id', label: t('sortId') },
        ]}
        onChange={(event) =>
          onChange({
            ...draft,
            sort: event.target.value as AdminContactMessageSortField,
          })
        }
      />

      <Select
        id="admin-contact-direction"
        name="direction"
        label={t('direction')}
        value={draft.direction}
        options={[
          { value: 'desc', label: t('directionDesc') },
          { value: 'asc', label: t('directionAsc') },
        ]}
        onChange={(event) =>
          onChange({
            ...draft,
            direction: event.target.value as AdminContactMessageSortDirection,
          })
        }
      />

      {filterError ? (
        <div className="admin-contact-messages-filters__error" role="alert">
          <p>{filterError}</p>
        </div>
      ) : null}

      <div className="admin-contact-messages-filters__actions">
        <Button type="submit">{t('applyFilters')}</Button>
        <Button type="button" variant="secondary" onClick={onReset}>
          {t('resetFilters')}
        </Button>
      </div>
    </form>
  )
}

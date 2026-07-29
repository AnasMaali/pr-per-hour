import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import type { AdminCategory } from '@/features/admin/categories/types/adminCategories.types'
import type {
  AdminServiceSortDirection,
  AdminServiceSortField,
  ServiceFiltersState,
} from '@/features/admin/services/types/adminServices.types'

interface ServicesFiltersProps {
  draft: ServiceFiltersState
  categories: AdminCategory[]
  categoriesLoading: boolean
  categoriesError: boolean
  onChange: (next: ServiceFiltersState) => void
  onApply: () => void
  onReset: () => void
  onRetryCategories: () => void
}

export function ServicesFilters({
  draft,
  categories,
  categoriesLoading,
  categoriesError,
  onChange,
  onApply,
  onReset,
  onRetryCategories,
}: ServicesFiltersProps) {
  const { t } = useTranslation('adminServices')

  const categoryOptions = [
    { value: '', label: t('filterCategoryAll') },
    ...categories.map((category) => ({
      value: String(category.id),
      label: category.is_active
        ? category.name
        : `${category.name} (${t('inactive')})`,
    })),
  ]

  return (
    <form
      className="admin-services-filters"
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
    >
      <Input
        id="service-search"
        name="search"
        label={t('search')}
        value={draft.search}
        onChange={(event) =>
          onChange({ ...draft, search: event.target.value })
        }
      />

      <Select
        id="service-category-filter"
        name="category_id"
        label={t('filterCategory')}
        value={draft.category_id}
        disabled={categoriesLoading || categoriesError}
        options={categoryOptions}
        onChange={(event) =>
          onChange({ ...draft, category_id: event.target.value })
        }
      />

      <Select
        id="service-active-filter"
        name="is_active"
        label={t('filterActive')}
        value={draft.is_active}
        options={[
          { value: '', label: t('filterActiveAll') },
          { value: 'true', label: t('active') },
          { value: 'false', label: t('inactive') },
        ]}
        onChange={(event) =>
          onChange({
            ...draft,
            is_active: event.target.value as ServiceFiltersState['is_active'],
          })
        }
      />

      <Input
        id="service-currency-filter"
        name="currency"
        label={t('filterCurrency')}
        value={draft.currency}
        hint={t('filterCurrencyHint')}
        onChange={(event) =>
          onChange({
            ...draft,
            currency: event.target.value.toUpperCase(),
          })
        }
      />

      <Select
        id="service-sort"
        name="sort"
        label={t('sort')}
        value={draft.sort}
        options={[
          { value: 'created_at', label: t('sortCreated') },
          { value: 'updated_at', label: t('sortUpdated') },
          { value: 'title', label: t('sortTitle') },
          { value: 'price', label: t('sortPrice') },
          { value: 'duration_minutes', label: t('sortDuration') },
          { value: 'id', label: t('sortId') },
        ]}
        onChange={(event) =>
          onChange({
            ...draft,
            sort: event.target.value as AdminServiceSortField,
          })
        }
      />

      <Select
        id="service-direction"
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
            direction: event.target.value as AdminServiceSortDirection,
          })
        }
      />

      {categoriesError ? (
        <div className="admin-services-filters__error" role="alert">
          <p>{t('categoriesFilterError')}</p>
          <Button type="button" variant="secondary" onClick={onRetryCategories}>
            {t('retry')}
          </Button>
        </div>
      ) : null}

      <div className="admin-services-filters__actions">
        <Button type="submit">{t('applyFilters')}</Button>
        <Button type="button" variant="secondary" onClick={onReset}>
          {t('resetFilters')}
        </Button>
      </div>
    </form>
  )
}

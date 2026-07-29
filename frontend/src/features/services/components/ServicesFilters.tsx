import { useId, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import type {
  PublicServiceCategory,
  ServiceFilterValidationErrors,
  ServiceFiltersState,
  ServiceSortDirection,
  ServiceSortField,
} from '@/features/services/types/services.types'
import { hasActiveFilters } from '@/features/services/utils/serviceFilters'

interface ServicesFiltersProps {
  draft: ServiceFiltersState
  onDraftChange: (next: ServiceFiltersState) => void
  onSubmit: () => void
  onReset: () => void
  categories: PublicServiceCategory[]
  categoriesFailed: boolean
  validationErrors: ServiceFilterValidationErrors
}

/**
 * Public catalog filters. Price/currency controls are hidden (payments off);
 * API params remain supported if present in the URL.
 */
export function ServicesFilters({
  draft,
  onDraftChange,
  onSubmit,
  onReset,
  categories,
  categoriesFailed,
  validationErrors,
}: ServicesFiltersProps) {
  const { t } = useTranslation('services')
  const formId = useId()

  function update<K extends keyof ServiceFiltersState>(
    key: K,
    value: ServiceFiltersState[K],
  ) {
    onDraftChange({ ...draft, [key]: value })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  const sortOptions: { value: ServiceSortField; label: string }[] = [
    { value: 'id', label: t('sortId') },
    { value: 'title', label: t('sortTitle') },
    { value: 'duration_minutes', label: t('sortDuration') },
    { value: 'created_at', label: t('sortCreated') },
  ]

  const directionOptions: { value: ServiceSortDirection; label: string }[] = [
    { value: 'asc', label: t('directionAsc') },
    { value: 'desc', label: t('directionDesc') },
  ]

  const categoryOptions = [
    { value: '', label: t('categoryAll') },
    ...categories.map((category) => ({
      value: category.slug,
      label: category.name,
    })),
  ]

  const chips: string[] = []
  if (draft.search) chips.push(`${t('searchLabel')}: ${draft.search}`)
  if (draft.category) {
    const match = categories.find((c) => c.slug === draft.category)
    chips.push(`${t('categoryLabel')}: ${match?.name ?? draft.category}`)
  }
  if (draft.duration) chips.push(`${t('durationLabel')}: ${draft.duration}`)

  return (
    <form
      className="services-filters"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={`${formId}-heading`}
    >
      <h2 id={`${formId}-heading`} className="services-filters__heading">
        {t('filtersHeading')}
      </h2>

      {categoriesFailed ? (
        <p className="services-filters__warning" role="status">
          {t('categoryUnavailable')}
        </p>
      ) : null}

      <div className="services-filters__grid">
        <Input
          id={`${formId}-search`}
          name="search"
          label={t('searchLabel')}
          placeholder={t('searchPlaceholder')}
          value={draft.search}
          onChange={(event) => update('search', event.target.value)}
          autoComplete="off"
        />
        <Select
          id={`${formId}-category`}
          name="category"
          label={t('categoryLabel')}
          options={categoryOptions}
          value={draft.category}
          onChange={(event) => update('category', event.target.value)}
          disabled={categoriesFailed && categories.length === 0}
        />
        <Input
          id={`${formId}-duration`}
          name="duration"
          label={t('durationLabel')}
          inputMode="numeric"
          value={draft.duration}
          onChange={(event) => update('duration', event.target.value)}
          error={
            validationErrors.duration
              ? t(validationErrors.duration)
              : undefined
          }
        />
        <Select
          id={`${formId}-sort`}
          name="sort"
          label={t('sortLabel')}
          options={sortOptions}
          value={draft.sort === 'price' ? 'title' : draft.sort}
          onChange={(event) =>
            update('sort', event.target.value as ServiceSortField)
          }
        />
        <Select
          id={`${formId}-direction`}
          name="direction"
          label={t('directionLabel')}
          options={directionOptions}
          value={draft.direction}
          onChange={(event) =>
            update('direction', event.target.value as ServiceSortDirection)
          }
        />
      </div>

      <div className="services-filters__actions">
        <Button type="submit">{t('applyFilters')}</Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onReset}
          disabled={!hasActiveFilters(draft) && draft.page === 1}
        >
          {t('resetFilters')}
        </Button>
      </div>

      {chips.length > 0 ? (
        <div className="services-active-filters" aria-live="polite">
          <span className="services-active-filters__label">
            {t('activeFilters')}:
          </span>
          {chips.map((chip) => (
            <span key={chip} className="services-active-filters__chip">
              {chip}
            </span>
          ))}
        </div>
      ) : null}
    </form>
  )
}

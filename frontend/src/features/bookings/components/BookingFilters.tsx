import { useId, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import type {
  BookingFieldErrors,
  BookingFiltersState,
  BookingSortDirection,
  BookingSortField,
} from '@/features/bookings/types/bookings.types'
import type { PublicService } from '@/features/services/types/services.types'
import { hasActiveBookingFilters } from '@/features/bookings/utils/bookingFilters'

interface BookingFiltersProps {
  draft: BookingFiltersState
  onDraftChange: (next: BookingFiltersState) => void
  onSubmit: () => void
  onReset: () => void
  services: PublicService[]
  validationErrors: BookingFieldErrors
}

export function BookingFilters({
  draft,
  onDraftChange,
  onSubmit,
  onReset,
  services,
  validationErrors,
}: BookingFiltersProps) {
  const { t } = useTranslation('bookings')
  const formId = useId()

  function update<K extends keyof BookingFiltersState>(
    key: K,
    value: BookingFiltersState[K],
  ) {
    onDraftChange({ ...draft, [key]: value })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  const statusOptions = [
    { value: '', label: t('statusAll') },
    { value: 'pending', label: t('status.pending') },
    { value: 'confirmed', label: t('status.confirmed') },
    { value: 'completed', label: t('status.completed') },
    { value: 'cancelled', label: t('status.cancelled') },
  ]

  const serviceOptions = [
    { value: '', label: t('serviceAll') },
    ...services.map((service) => ({
      value: String(service.id),
      label: service.title,
    })),
  ]

  const sortOptions: { value: BookingSortField; label: string }[] = [
    { value: 'booking_date', label: t('sortBookingDate') },
    { value: 'start_time', label: t('sortStartTime') },
    { value: 'created_at', label: t('sortCreated') },
    { value: 'updated_at', label: t('sortUpdated') },
  ]

  const directionOptions: { value: BookingSortDirection; label: string }[] = [
    { value: 'desc', label: t('directionDesc') },
    { value: 'asc', label: t('directionAsc') },
  ]

  function resolveError(key: string | undefined): string | undefined {
    if (!key) return undefined
    if (key.startsWith('validation')) return t(key)
    return key
  }

  return (
    <form
      className="booking-filters"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={`${formId}-heading`}
    >
      <h2 id={`${formId}-heading`} className="booking-filters__heading">
        {t('filtersHeading')}
      </h2>

      <div className="booking-filters__grid">
        <Select
          id={`${formId}-status`}
          name="status"
          label={t('statusLabel')}
          options={statusOptions}
          value={draft.status}
          onChange={(event) => update('status', event.target.value)}
          error={resolveError(validationErrors.status)}
        />
        <Select
          id={`${formId}-service`}
          name="service_id"
          label={t('serviceLabel')}
          options={serviceOptions}
          value={draft.service_id}
          onChange={(event) => update('service_id', event.target.value)}
          error={resolveError(validationErrors.service_id_filter)}
        />
        <Input
          id={`${formId}-booking-date`}
          name="booking_date"
          type="date"
          label={t('exactDateLabel')}
          value={draft.booking_date}
          onChange={(event) => update('booking_date', event.target.value)}
          error={resolveError(validationErrors.booking_date)}
        />
        <Input
          id={`${formId}-date-from`}
          name="date_from"
          type="date"
          label={t('dateFromLabel')}
          value={draft.date_from}
          onChange={(event) => update('date_from', event.target.value)}
          error={resolveError(validationErrors.date_from)}
        />
        <Input
          id={`${formId}-date-to`}
          name="date_to"
          type="date"
          label={t('dateToLabel')}
          value={draft.date_to}
          onChange={(event) => update('date_to', event.target.value)}
          error={resolveError(validationErrors.date_to)}
        />
        <Select
          id={`${formId}-sort`}
          name="sort"
          label={t('sortLabel')}
          options={sortOptions}
          value={draft.sort}
          onChange={(event) =>
            update('sort', event.target.value as BookingSortField)
          }
        />
        <Select
          id={`${formId}-direction`}
          name="direction"
          label={t('directionLabel')}
          options={directionOptions}
          value={draft.direction}
          onChange={(event) =>
            update('direction', event.target.value as BookingSortDirection)
          }
        />
      </div>

      {validationErrors.date_range ? (
        <p className="booking-filters__error" role="alert">
          {t(validationErrors.date_range)}
        </p>
      ) : null}

      <div className="booking-filters__actions">
        <Button type="submit">{t('applyFilters')}</Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onReset}
          disabled={!hasActiveBookingFilters(draft) && draft.page === 1}
        >
          {t('resetFilters')}
        </Button>
      </div>
    </form>
  )
}

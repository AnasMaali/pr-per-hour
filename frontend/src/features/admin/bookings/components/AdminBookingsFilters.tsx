import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import type { AdminService } from '@/features/admin/services/types/adminServices.types'
import type {
  AdminBookingFiltersState,
  AdminBookingSortDirection,
  AdminBookingSortField,
  AdminBookingStatus,
} from '@/features/admin/bookings/types/adminBookings.types'

interface AdminBookingsFiltersProps {
  draft: AdminBookingFiltersState
  services: AdminService[]
  servicesLoading: boolean
  servicesError: boolean
  filterError: string | null
  onChange: (next: AdminBookingFiltersState) => void
  onApply: () => void
  onReset: () => void
  onRetryServices: () => void
}

export function AdminBookingsFilters({
  draft,
  services,
  servicesLoading,
  servicesError,
  filterError,
  onChange,
  onApply,
  onReset,
  onRetryServices,
}: AdminBookingsFiltersProps) {
  const { t } = useTranslation('adminBookings')

  const serviceOptions = [
    { value: '', label: t('filterServiceAll') },
    ...services.map((service) => ({
      value: String(service.id),
      label: service.is_active
        ? service.title
        : `${service.title} (${t('inactiveService')})`,
    })),
  ]

  // Keep a selected service_id representable if it is outside the first-100 options page.
  if (
    draft.service_id &&
    !serviceOptions.some((option) => option.value === draft.service_id)
  ) {
    serviceOptions.push({
      value: draft.service_id,
      label: t('filterServiceSelectedId', { id: draft.service_id }),
    })
  }

  return (
    <form
      className="admin-bookings-filters"
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
    >
      <Input
        id="admin-booking-search"
        name="search"
        label={t('search')}
        value={draft.search}
        hint={t('searchHint')}
        onChange={(event) =>
          onChange({ ...draft, search: event.target.value })
        }
      />

      <Select
        id="admin-booking-status"
        name="status"
        label={t('statusField')}
        value={draft.status}
        options={[
          { value: '', label: t('filterStatusAll') },
          { value: 'pending', label: t('status.pending') },
          { value: 'confirmed', label: t('status.confirmed') },
          { value: 'completed', label: t('status.completed') },
          { value: 'cancelled', label: t('status.cancelled') },
        ]}
        onChange={(event) =>
          onChange({
            ...draft,
            status: event.target.value as '' | AdminBookingStatus,
          })
        }
      />

      <Select
        id="admin-booking-service"
        name="service_id"
        label={t('filterService')}
        value={draft.service_id}
        disabled={servicesLoading || servicesError}
        options={serviceOptions}
        onChange={(event) =>
          onChange({ ...draft, service_id: event.target.value })
        }
      />

      <Input
        id="admin-booking-user"
        name="user_id"
        label={t('filterClientId')}
        inputMode="numeric"
        value={draft.user_id}
        hint={t('filterClientIdHint')}
        onChange={(event) =>
          onChange({ ...draft, user_id: event.target.value })
        }
      />

      <Input
        id="admin-booking-date"
        name="booking_date"
        type="date"
        label={t('bookingDate')}
        value={draft.booking_date}
        onChange={(event) =>
          onChange({ ...draft, booking_date: event.target.value })
        }
      />

      <Input
        id="admin-booking-date-from"
        name="date_from"
        type="date"
        label={t('dateFrom')}
        value={draft.date_from}
        onChange={(event) =>
          onChange({ ...draft, date_from: event.target.value })
        }
      />

      <Input
        id="admin-booking-date-to"
        name="date_to"
        type="date"
        label={t('dateTo')}
        value={draft.date_to}
        onChange={(event) =>
          onChange({ ...draft, date_to: event.target.value })
        }
      />

      <Select
        id="admin-booking-sort"
        name="sort"
        label={t('sort')}
        value={draft.sort}
        options={[
          { value: 'booking_date', label: t('sortBookingDate') },
          { value: 'start_time', label: t('sortStartTime') },
          { value: 'end_time', label: t('sortEndTime') },
          { value: 'status', label: t('sortStatus') },
          { value: 'created_at', label: t('sortCreated') },
          { value: 'updated_at', label: t('sortUpdated') },
          { value: 'id', label: t('sortId') },
        ]}
        onChange={(event) =>
          onChange({
            ...draft,
            sort: event.target.value as AdminBookingSortField,
          })
        }
      />

      <Select
        id="admin-booking-direction"
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
            direction: event.target.value as AdminBookingSortDirection,
          })
        }
      />

      {filterError ? (
        <div className="admin-bookings-filters__error" role="alert">
          <p>{filterError}</p>
        </div>
      ) : null}

      {servicesError ? (
        <div className="admin-bookings-filters__error" role="alert">
          <p>{t('servicesFilterError')}</p>
          <Button type="button" variant="secondary" onClick={onRetryServices}>
            {t('retry')}
          </Button>
        </div>
      ) : null}

      <div className="admin-bookings-filters__actions">
        <Button type="submit">{t('applyFilters')}</Button>
        <Button type="button" variant="secondary" onClick={onReset}>
          {t('resetFilters')}
        </Button>
      </div>
    </form>
  )
}

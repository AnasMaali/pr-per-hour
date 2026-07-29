import type {
  BookingFieldErrors,
  BookingFiltersState,
  BookingSortDirection,
  BookingSortField,
  BookingStatus,
  ClientBookingsQueryParams,
} from '@/features/bookings/types/bookings.types'

export const DEFAULT_BOOKINGS_PER_PAGE = 10

export const DEFAULT_BOOKING_FILTERS: BookingFiltersState = {
  status: '',
  service_id: '',
  booking_date: '',
  date_from: '',
  date_to: '',
  sort: 'booking_date',
  direction: 'desc',
  page: 1,
}

const SORT_FIELDS: BookingSortField[] = [
  'booking_date',
  'start_time',
  'created_at',
  'updated_at',
]

const DIRECTIONS: BookingSortDirection[] = ['asc', 'desc']

const STATUSES: BookingStatus[] = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
]

function isSortField(value: string): value is BookingSortField {
  return (SORT_FIELDS as string[]).includes(value)
}

function isDirection(value: string): value is BookingSortDirection {
  return (DIRECTIONS as string[]).includes(value)
}

function isStatus(value: string): value is BookingStatus {
  return (STATUSES as string[]).includes(value)
}

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return parsed
}

function readOptional(params: URLSearchParams, key: string): string {
  return params.get(key)?.trim() ?? ''
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function isValidDateString(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false
  const parts = value.split('-').map(Number)
  const y = parts[0]
  const m = parts[1]
  const d = parts[2]
  if (y === undefined || m === undefined || d === undefined) return false
  const date = new Date(y, m - 1, d)
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  )
}

export function parseBookingFiltersFromSearchParams(
  params: URLSearchParams,
): BookingFiltersState {
  const sortRaw = params.get('sort') ?? DEFAULT_BOOKING_FILTERS.sort
  const directionRaw =
    params.get('direction') ?? DEFAULT_BOOKING_FILTERS.direction
  const statusRaw = readOptional(params, 'status')

  return {
    status: isStatus(statusRaw) ? statusRaw : '',
    service_id: readOptional(params, 'service_id'),
    booking_date: readOptional(params, 'booking_date'),
    date_from: readOptional(params, 'date_from'),
    date_to: readOptional(params, 'date_to'),
    sort: isSortField(sortRaw) ? sortRaw : DEFAULT_BOOKING_FILTERS.sort,
    direction: isDirection(directionRaw)
      ? directionRaw
      : DEFAULT_BOOKING_FILTERS.direction,
    page: parsePositiveInt(params.get('page'), 1),
  }
}

export function bookingFiltersToSearchParams(
  filters: BookingFiltersState,
): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.service_id) params.set('service_id', filters.service_id)
  if (filters.booking_date) params.set('booking_date', filters.booking_date)
  if (filters.date_from) params.set('date_from', filters.date_from)
  if (filters.date_to) params.set('date_to', filters.date_to)
  if (filters.sort !== DEFAULT_BOOKING_FILTERS.sort) {
    params.set('sort', filters.sort)
  }
  if (filters.direction !== DEFAULT_BOOKING_FILTERS.direction) {
    params.set('direction', filters.direction)
  }
  if (filters.page > 1) params.set('page', String(filters.page))
  return params
}

export function hasActiveBookingFilters(filters: BookingFiltersState): boolean {
  return Boolean(
    filters.status ||
      filters.service_id ||
      filters.booking_date ||
      filters.date_from ||
      filters.date_to ||
      filters.sort !== DEFAULT_BOOKING_FILTERS.sort ||
      filters.direction !== DEFAULT_BOOKING_FILTERS.direction,
  )
}

export function validateBookingFilters(
  filters: BookingFiltersState,
): BookingFieldErrors {
  const errors: BookingFieldErrors = {}

  if (filters.status && !isStatus(filters.status)) {
    errors.status = 'validationInvalidStatus'
  }

  if (filters.service_id) {
    const id = Number.parseInt(filters.service_id, 10)
    if (!Number.isFinite(id) || id < 1) {
      errors.service_id_filter = 'validationInvalidServiceId'
    }
  }

  if (filters.booking_date && !isValidDateString(filters.booking_date)) {
    errors.booking_date = 'validationInvalidDate'
  }
  if (filters.date_from && !isValidDateString(filters.date_from)) {
    errors.date_from = 'validationInvalidDate'
  }
  if (filters.date_to && !isValidDateString(filters.date_to)) {
    errors.date_to = 'validationInvalidDate'
  }

  if (
    filters.date_from &&
    filters.date_to &&
    isValidDateString(filters.date_from) &&
    isValidDateString(filters.date_to) &&
    filters.date_from > filters.date_to
  ) {
    errors.date_range = 'validationDateRange'
  }

  return errors
}

export function bookingFiltersToApiParams(
  filters: BookingFiltersState,
): ClientBookingsQueryParams {
  const params: ClientBookingsQueryParams = {
    sort: filters.sort,
    direction: filters.direction,
    per_page: DEFAULT_BOOKINGS_PER_PAGE,
    page: filters.page,
  }

  if (filters.status && isStatus(filters.status)) {
    params.status = filters.status
  }

  if (filters.service_id) {
    const id = Number.parseInt(filters.service_id, 10)
    if (Number.isFinite(id) && id >= 1) params.service_id = id
  }

  if (filters.booking_date && isValidDateString(filters.booking_date)) {
    params.booking_date = filters.booking_date
  }
  if (filters.date_from && isValidDateString(filters.date_from)) {
    params.date_from = filters.date_from
  }
  if (filters.date_to && isValidDateString(filters.date_to)) {
    params.date_to = filters.date_to
  }

  return params
}

export function bookingApiParamsToQueryKey(
  params: ClientBookingsQueryParams,
): Record<string, unknown> {
  return { ...params }
}

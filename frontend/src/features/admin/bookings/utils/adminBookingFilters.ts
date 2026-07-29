import type {
  AdminBookingFiltersState,
  AdminBookingSortDirection,
  AdminBookingSortField,
  AdminBookingStatus,
  AdminBookingsQueryParams,
} from '@/features/admin/bookings/types/adminBookings.types'

export const DEFAULT_ADMIN_BOOKINGS_PER_PAGE = 15
export const NOTES_MAX_LENGTH = 5000
export const MEETING_LINK_MAX_LENGTH = 500

const SORT_FIELDS: AdminBookingSortField[] = [
  'id',
  'booking_date',
  'start_time',
  'end_time',
  'status',
  'created_at',
  'updated_at',
]

const STATUSES: AdminBookingStatus[] = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
]

export const DEFAULT_ADMIN_BOOKING_FILTERS: AdminBookingFiltersState = {
  search: '',
  status: '',
  service_id: '',
  user_id: '',
  booking_date: '',
  date_from: '',
  date_to: '',
  sort: 'booking_date',
  direction: 'desc',
  page: 1,
}

function isSortField(value: string): value is AdminBookingSortField {
  return SORT_FIELDS.includes(value as AdminBookingSortField)
}

function isDirection(value: string): value is AdminBookingSortDirection {
  return value === 'asc' || value === 'desc'
}

function isStatus(value: string): value is AdminBookingStatus {
  return STATUSES.includes(value as AdminBookingStatus)
}

export function parseAdminBookingFilters(
  params: URLSearchParams,
): AdminBookingFiltersState {
  const statusRaw = params.get('status') ?? ''
  const pageRaw = Number.parseInt(params.get('page') ?? '1', 10)
  const sortRaw = params.get('sort') ?? 'booking_date'
  const directionRaw = params.get('direction') ?? 'desc'
  const serviceRaw = params.get('service_id') ?? ''
  const userRaw = params.get('user_id') ?? ''
  const serviceId = /^\d+$/.test(serviceRaw) ? Number.parseInt(serviceRaw, 10) : NaN
  const userId = /^\d+$/.test(userRaw) ? Number.parseInt(userRaw, 10) : NaN

  return {
    search: params.get('search')?.trim() ?? '',
    status: isStatus(statusRaw) ? statusRaw : '',
    service_id: Number.isFinite(serviceId) && serviceId > 0 ? String(serviceId) : '',
    user_id: Number.isFinite(userId) && userId > 0 ? String(userId) : '',
    booking_date: params.get('booking_date')?.trim() ?? '',
    date_from: params.get('date_from')?.trim() ?? '',
    date_to: params.get('date_to')?.trim() ?? '',
    sort: isSortField(sortRaw) ? sortRaw : 'booking_date',
    direction: isDirection(directionRaw) ? directionRaw : 'desc',
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1,
  }
}

export function adminBookingFiltersToSearchParams(
  filters: AdminBookingFiltersState,
): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (/^\d+$/.test(filters.service_id) && Number.parseInt(filters.service_id, 10) > 0) {
    params.set('service_id', filters.service_id)
  }
  if (/^\d+$/.test(filters.user_id) && Number.parseInt(filters.user_id, 10) > 0) {
    params.set('user_id', filters.user_id)
  }
  if (filters.booking_date) params.set('booking_date', filters.booking_date)
  if (filters.date_from) params.set('date_from', filters.date_from)
  if (filters.date_to) params.set('date_to', filters.date_to)
  if (filters.sort !== DEFAULT_ADMIN_BOOKING_FILTERS.sort) {
    params.set('sort', filters.sort)
  }
  if (filters.direction !== DEFAULT_ADMIN_BOOKING_FILTERS.direction) {
    params.set('direction', filters.direction)
  }
  if (filters.page > 1) params.set('page', String(filters.page))
  return params
}

export function adminBookingFiltersToApiParams(
  filters: AdminBookingFiltersState,
): AdminBookingsQueryParams {
  const params: AdminBookingsQueryParams = {
    sort: filters.sort,
    direction: filters.direction,
    per_page: DEFAULT_ADMIN_BOOKINGS_PER_PAGE,
    page: filters.page,
  }
  if (filters.search) params.search = filters.search
  if (filters.status) params.status = filters.status
  if (/^\d+$/.test(filters.service_id)) {
    const serviceId = Number.parseInt(filters.service_id, 10)
    if (serviceId > 0) params.service_id = serviceId
  }
  if (/^\d+$/.test(filters.user_id)) {
    const userId = Number.parseInt(filters.user_id, 10)
    if (userId > 0) params.user_id = userId
  }
  if (filters.booking_date) params.booking_date = filters.booking_date
  if (filters.date_from) params.date_from = filters.date_from
  if (filters.date_to) params.date_to = filters.date_to
  return params
}

export function formatBookingDateTimeStamp(
  iso: string,
  locale: string,
): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(locale.startsWith('ar') ? 'ar' : 'en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatBookingTime(value: string | null | undefined): string {
  if (!value) return '—'
  const trimmed = value.trim()
  const match = trimmed.match(/^(\d{2}:\d{2})/)
  return match?.[1] ?? trimmed
}

export function allowedStatusTransitions(
  current: AdminBookingStatus,
): AdminBookingStatus[] {
  switch (current) {
    case 'pending':
      return ['confirmed', 'cancelled']
    case 'confirmed':
      return ['completed', 'cancelled']
    case 'completed':
    case 'cancelled':
      return []
    default:
      return []
  }
}

export function hasActiveAdminBookingFilters(
  filters: AdminBookingFiltersState,
): boolean {
  return (
    Boolean(filters.search) ||
    Boolean(filters.status) ||
    Boolean(filters.service_id) ||
    Boolean(filters.user_id) ||
    Boolean(filters.booking_date) ||
    Boolean(filters.date_from) ||
    Boolean(filters.date_to) ||
    filters.sort !== DEFAULT_ADMIN_BOOKING_FILTERS.sort ||
    filters.direction !== DEFAULT_ADMIN_BOOKING_FILTERS.direction
  )
}

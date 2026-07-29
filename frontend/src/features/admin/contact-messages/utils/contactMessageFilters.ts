import type {
  AdminContactMessageFiltersState,
  AdminContactMessageSortDirection,
  AdminContactMessageSortField,
  AdminContactMessageStatus,
  AdminContactMessagesQueryParams,
} from '@/features/admin/contact-messages/types/adminContactMessages.types'

export const DEFAULT_ADMIN_CONTACT_MESSAGES_PER_PAGE = 15

const SORT_FIELDS: AdminContactMessageSortField[] = [
  'id',
  'full_name',
  'email',
  'status',
  'created_at',
  'updated_at',
]

const STATUSES: AdminContactMessageStatus[] = [
  'new',
  'read',
  'replied',
  'closed',
]

export const DEFAULT_ADMIN_CONTACT_MESSAGE_FILTERS: AdminContactMessageFiltersState =
  {
    search: '',
    status: '',
    email: '',
    organization: '',
    created_from: '',
    created_to: '',
    sort: 'created_at',
    direction: 'desc',
    page: 1,
  }

function isSortField(value: string): value is AdminContactMessageSortField {
  return SORT_FIELDS.includes(value as AdminContactMessageSortField)
}

function isDirection(value: string): value is AdminContactMessageSortDirection {
  return value === 'asc' || value === 'desc'
}

function isStatus(value: string): value is AdminContactMessageStatus {
  return STATUSES.includes(value as AdminContactMessageStatus)
}

export function parseAdminContactMessageFilters(
  params: URLSearchParams,
): AdminContactMessageFiltersState {
  const statusRaw = params.get('status') ?? ''
  const pageRaw = Number.parseInt(params.get('page') ?? '1', 10)
  const sortRaw = params.get('sort') ?? 'created_at'
  const directionRaw = params.get('direction') ?? 'desc'

  return {
    search: params.get('search')?.trim() ?? '',
    status: isStatus(statusRaw) ? statusRaw : '',
    email: params.get('email')?.trim() ?? '',
    organization: params.get('organization')?.trim() ?? '',
    created_from: params.get('created_from')?.trim() ?? '',
    created_to: params.get('created_to')?.trim() ?? '',
    sort: isSortField(sortRaw) ? sortRaw : 'created_at',
    direction: isDirection(directionRaw) ? directionRaw : 'desc',
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1,
  }
}

export function contactMessageFiltersToSearchParams(
  filters: AdminContactMessageFiltersState,
): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (filters.email) params.set('email', filters.email)
  if (filters.organization) params.set('organization', filters.organization)
  if (filters.created_from) params.set('created_from', filters.created_from)
  if (filters.created_to) params.set('created_to', filters.created_to)
  if (filters.sort !== DEFAULT_ADMIN_CONTACT_MESSAGE_FILTERS.sort) {
    params.set('sort', filters.sort)
  }
  if (filters.direction !== DEFAULT_ADMIN_CONTACT_MESSAGE_FILTERS.direction) {
    params.set('direction', filters.direction)
  }
  if (filters.page > 1) params.set('page', String(filters.page))
  return params
}

export function contactMessageFiltersToApiParams(
  filters: AdminContactMessageFiltersState,
): AdminContactMessagesQueryParams {
  const params: AdminContactMessagesQueryParams = {
    sort: filters.sort,
    direction: filters.direction,
    per_page: DEFAULT_ADMIN_CONTACT_MESSAGES_PER_PAGE,
    page: filters.page,
  }
  if (filters.search) params.search = filters.search
  if (filters.status) params.status = filters.status
  if (filters.email) params.email = filters.email
  if (filters.organization) params.organization = filters.organization
  if (filters.created_from) params.created_from = filters.created_from
  if (filters.created_to) params.created_to = filters.created_to
  return params
}

export function hasActiveAdminContactMessageFilters(
  filters: AdminContactMessageFiltersState,
): boolean {
  return (
    Boolean(filters.search) ||
    Boolean(filters.status) ||
    Boolean(filters.email) ||
    Boolean(filters.organization) ||
    Boolean(filters.created_from) ||
    Boolean(filters.created_to) ||
    filters.sort !== DEFAULT_ADMIN_CONTACT_MESSAGE_FILTERS.sort ||
    filters.direction !== DEFAULT_ADMIN_CONTACT_MESSAGE_FILTERS.direction
  )
}

export function formatContactMessageTimestamp(
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

export function excerptContactMessage(
  message: string,
  maxLength = 120,
): string {
  const normalized = message.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`
}

import type {
  AdminServiceSortDirection,
  AdminServiceSortField,
  AdminServicesQueryParams,
  ServiceFiltersState,
} from '@/features/admin/services/types/adminServices.types'

export const DEFAULT_SERVICES_PER_PAGE = 15

const SORT_FIELDS: AdminServiceSortField[] = [
  'id',
  'title',
  'price',
  'duration_minutes',
  'created_at',
  'updated_at',
]

export const DEFAULT_SERVICE_FILTERS: ServiceFiltersState = {
  search: '',
  category_id: '',
  is_active: '',
  currency: '',
  sort: 'created_at',
  direction: 'desc',
  page: 1,
}

function isSortField(value: string): value is AdminServiceSortField {
  return SORT_FIELDS.includes(value as AdminServiceSortField)
}

function isDirection(value: string): value is AdminServiceSortDirection {
  return value === 'asc' || value === 'desc'
}

export function parseServiceFiltersFromSearchParams(
  params: URLSearchParams,
): ServiceFiltersState {
  const isActiveRaw = params.get('is_active')
  const pageRaw = Number.parseInt(params.get('page') ?? '1', 10)
  const sortRaw = params.get('sort') ?? 'created_at'
  const directionRaw = params.get('direction') ?? 'desc'
  const categoryRaw = params.get('category_id') ?? ''

  return {
    search: params.get('search')?.trim() ?? '',
    category_id: /^\d+$/.test(categoryRaw) ? categoryRaw : '',
    is_active:
      isActiveRaw === 'true' || isActiveRaw === 'false' ? isActiveRaw : '',
    currency: (params.get('currency') ?? '').trim().toUpperCase(),
    sort: isSortField(sortRaw) ? sortRaw : 'created_at',
    direction: isDirection(directionRaw) ? directionRaw : 'desc',
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1,
  }
}

export function serviceFiltersToSearchParams(
  filters: ServiceFiltersState,
): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.category_id) params.set('category_id', filters.category_id)
  if (filters.is_active) params.set('is_active', filters.is_active)
  if (filters.currency) params.set('currency', filters.currency)
  if (filters.sort !== DEFAULT_SERVICE_FILTERS.sort) {
    params.set('sort', filters.sort)
  }
  if (filters.direction !== DEFAULT_SERVICE_FILTERS.direction) {
    params.set('direction', filters.direction)
  }
  if (filters.page > 1) params.set('page', String(filters.page))
  return params
}

export function serviceFiltersToApiParams(
  filters: ServiceFiltersState,
): AdminServicesQueryParams {
  const params: AdminServicesQueryParams = {
    sort: filters.sort,
    direction: filters.direction,
    per_page: DEFAULT_SERVICES_PER_PAGE,
    page: filters.page,
  }
  if (filters.search) params.search = filters.search
  if (filters.category_id) {
    params.category_id = Number.parseInt(filters.category_id, 10)
  }
  if (filters.is_active === 'true') params.is_active = true
  if (filters.is_active === 'false') params.is_active = false
  if (filters.currency) params.currency = filters.currency
  return params
}

export function formatServiceDate(iso: string, locale: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(locale.startsWith('ar') ? 'ar' : 'en', {
    dateStyle: 'medium',
  }).format(date)
}

export function formatServicePrice(price: string, currency: string): string {
  return `${price} ${currency}`.trim()
}

export function formatServiceDuration(
  minutes: number | null,
  emptyLabel: string,
): string {
  if (minutes === null || minutes === undefined) return emptyLabel
  return String(minutes)
}

export function excerptDescription(
  description: string | null,
  max = 120,
): string {
  if (!description) return ''
  const trimmed = description.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max).trimEnd()}…`
}

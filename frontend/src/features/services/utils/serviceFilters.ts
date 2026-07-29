import type {
  PublicServicesQueryParams,
  ServiceFilterValidationErrors,
  ServiceFiltersState,
  ServiceSortDirection,
  ServiceSortField,
} from '@/features/services/types/services.types'

export const DEFAULT_PER_PAGE = 12

export const DEFAULT_FILTERS: ServiceFiltersState = {
  search: '',
  category: '',
  duration: '',
  currency: '',
  min_price: '',
  max_price: '',
  sort: 'id',
  direction: 'asc',
  page: 1,
}

const SORT_FIELDS: ServiceSortField[] = [
  'id',
  'title',
  'price',
  'duration_minutes',
  'created_at',
]

const DIRECTIONS: ServiceSortDirection[] = ['asc', 'desc']

function isSortField(value: string): value is ServiceSortField {
  return (SORT_FIELDS as string[]).includes(value)
}

function isDirection(value: string): value is ServiceSortDirection {
  return (DIRECTIONS as string[]).includes(value)
}

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return parsed
}

function readOptionalString(params: URLSearchParams, key: string): string {
  return params.get(key)?.trim() ?? ''
}

export function parseFiltersFromSearchParams(
  params: URLSearchParams,
): ServiceFiltersState {
  const sortRaw = params.get('sort') ?? DEFAULT_FILTERS.sort
  const directionRaw = params.get('direction') ?? DEFAULT_FILTERS.direction

  return {
    search: readOptionalString(params, 'search'),
    category: readOptionalString(params, 'category'),
    duration: readOptionalString(params, 'duration'),
    currency: readOptionalString(params, 'currency').toUpperCase(),
    min_price: readOptionalString(params, 'min_price'),
    max_price: readOptionalString(params, 'max_price'),
    sort: isSortField(sortRaw) ? sortRaw : DEFAULT_FILTERS.sort,
    direction: isDirection(directionRaw) ? directionRaw : DEFAULT_FILTERS.direction,
    page: parsePositiveInt(params.get('page'), 1),
  }
}

export function filtersToSearchParams(
  filters: ServiceFiltersState,
): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.category) params.set('category', filters.category)
  if (filters.duration) params.set('duration', filters.duration)
  if (filters.currency) params.set('currency', filters.currency.toUpperCase())
  if (filters.min_price) params.set('min_price', filters.min_price)
  if (filters.max_price) params.set('max_price', filters.max_price)
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set('sort', filters.sort)
  if (filters.direction !== DEFAULT_FILTERS.direction) {
    params.set('direction', filters.direction)
  }
  if (filters.page > 1) params.set('page', String(filters.page))

  return params
}

export function hasActiveFilters(filters: ServiceFiltersState): boolean {
  return Boolean(
    filters.search ||
      filters.category ||
      filters.duration ||
      filters.currency ||
      filters.min_price ||
      filters.max_price ||
      filters.sort !== DEFAULT_FILTERS.sort ||
      filters.direction !== DEFAULT_FILTERS.direction,
  )
}

function isNonNegativeNumber(value: string): boolean {
  if (value.trim() === '') return true
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim()) && !/^\d+$/.test(value.trim())) {
    return false
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0
}

function isNonNegativeInteger(value: string): boolean {
  if (value.trim() === '') return true
  if (!/^\d+$/.test(value.trim())) return false
  return Number.parseInt(value, 10) >= 0
}

export function validateServiceFilters(
  filters: ServiceFiltersState,
): ServiceFilterValidationErrors {
  const errors: ServiceFilterValidationErrors = {}

  if (filters.duration && !isNonNegativeInteger(filters.duration)) {
    errors.duration = 'invalidDuration'
  }

  if (filters.min_price && !isNonNegativeNumber(filters.min_price)) {
    errors.min_price = 'invalidMinPrice'
  }

  if (filters.max_price && !isNonNegativeNumber(filters.max_price)) {
    errors.max_price = 'invalidMaxPrice'
  }

  if (
    filters.min_price &&
    filters.max_price &&
    isNonNegativeNumber(filters.min_price) &&
    isNonNegativeNumber(filters.max_price) &&
    Number(filters.min_price) > Number(filters.max_price)
  ) {
    errors.price_range = 'invalidPriceRange'
  }

  return errors
}

export function filtersToApiParams(
  filters: ServiceFiltersState,
): PublicServicesQueryParams {
  const params: PublicServicesQueryParams = {
    sort: filters.sort,
    direction: filters.direction,
    per_page: DEFAULT_PER_PAGE,
    page: filters.page,
  }

  if (filters.search) params.search = filters.search
  if (filters.category) params.category = filters.category
  if (filters.currency) params.currency = filters.currency.toUpperCase()
  if (filters.min_price) params.min_price = filters.min_price
  if (filters.max_price) params.max_price = filters.max_price

  if (filters.duration && isNonNegativeInteger(filters.duration)) {
    params.duration_minutes = Number.parseInt(filters.duration, 10)
  }

  return params
}

export function apiParamsToQueryKey(
  params: PublicServicesQueryParams,
): Record<string, unknown> {
  return { ...params }
}

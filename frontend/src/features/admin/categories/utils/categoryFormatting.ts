import type {
  AdminCategoriesQueryParams,
  CategoryFiltersState,
} from '@/features/admin/categories/types/adminCategories.types'

export const DEFAULT_CATEGORIES_PER_PAGE = 15

export const DEFAULT_CATEGORY_FILTERS: CategoryFiltersState = {
  search: '',
  is_active: '',
  page: 1,
}

export function parseCategoryFiltersFromSearchParams(
  params: URLSearchParams,
): CategoryFiltersState {
  const isActiveRaw = params.get('is_active')
  const pageRaw = Number.parseInt(params.get('page') ?? '1', 10)

  return {
    search: params.get('search')?.trim() ?? '',
    is_active:
      isActiveRaw === 'true' || isActiveRaw === 'false' ? isActiveRaw : '',
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1,
  }
}

export function categoryFiltersToSearchParams(
  filters: CategoryFiltersState,
): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.is_active) params.set('is_active', filters.is_active)
  if (filters.page > 1) params.set('page', String(filters.page))
  return params
}

export function categoryFiltersToApiParams(
  filters: CategoryFiltersState,
): AdminCategoriesQueryParams {
  const params: AdminCategoriesQueryParams = {
    sort: 'created_at',
    direction: 'desc',
    per_page: DEFAULT_CATEGORIES_PER_PAGE,
    page: filters.page,
  }
  if (filters.search) params.search = filters.search
  if (filters.is_active === 'true') params.is_active = true
  if (filters.is_active === 'false') params.is_active = false
  return params
}

export function formatCategoryDate(iso: string, locale: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(locale.startsWith('ar') ? 'ar' : 'en', {
    dateStyle: 'medium',
  }).format(date)
}

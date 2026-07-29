export interface PublicServiceCategory {
  id: number
  name: string
  slug: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PublicServiceCategorySummary {
  id: number
  name: string
  slug: string
}

export interface PublicService {
  id: number
  title: string
  slug: string
  description: string | null
  duration_minutes: number | null
  price: string
  currency: string
  is_active: boolean
  category: PublicServiceCategorySummary | null
  created_at: string
  updated_at: string
}

export type ServiceSortField =
  | 'id'
  | 'title'
  | 'price'
  | 'duration_minutes'
  | 'created_at'

export type ServiceSortDirection = 'asc' | 'desc'

/** Frontend URL / form filter state */
export interface ServiceFiltersState {
  search: string
  category: string
  duration: string
  currency: string
  min_price: string
  max_price: string
  sort: ServiceSortField
  direction: ServiceSortDirection
  page: number
}

/** Backend query params for GET /services */
export interface PublicServicesQueryParams {
  search?: string
  category?: string
  duration_minutes?: number
  currency?: string
  min_price?: string
  max_price?: string
  sort: ServiceSortField
  direction: ServiceSortDirection
  per_page: number
  page: number
}

export interface ServiceFilterValidationErrors {
  duration?: string
  min_price?: string
  max_price?: string
  price_range?: string
}

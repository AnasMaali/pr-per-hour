export interface AdminServiceCategorySummary {
  id: number
  name: string
  slug: string
}

export interface AdminService {
  id: number
  title: string
  slug: string
  description: string | null
  duration_minutes: number | null
  price: string
  currency: string
  is_active: boolean
  category: AdminServiceCategorySummary | null
  created_at: string
  updated_at: string
}

export type AdminServiceSortField =
  | 'id'
  | 'title'
  | 'price'
  | 'duration_minutes'
  | 'created_at'
  | 'updated_at'

export type AdminServiceSortDirection = 'asc' | 'desc'

export interface AdminServicesQueryParams {
  search?: string
  category_id?: number
  is_active?: boolean
  currency?: string
  sort: AdminServiceSortField
  direction: AdminServiceSortDirection
  per_page: number
  page: number
}

export interface CreateServicePayload {
  category_id: number
  title: string
  slug: string
  description?: string | null
  duration_minutes?: number | null
  price?: string
  currency?: string
  is_active?: boolean
}

export interface UpdateServicePayload {
  category_id?: number
  title?: string
  slug?: string
  description?: string | null
  duration_minutes?: number | null
  price?: string
  currency?: string
}

export interface UpdateServiceStatusPayload {
  is_active: boolean
}

export interface ServiceFormValues {
  category_id: string
  title: string
  slug: string
  description: string
  duration_minutes: string
  price: string
  currency: string
  is_active: boolean
}

export type ServiceFieldErrors = Partial<
  Record<
    | 'category_id'
    | 'title'
    | 'slug'
    | 'description'
    | 'duration_minutes'
    | 'price'
    | 'currency'
    | 'is_active'
    | 'form',
    string
  >
>

export interface ServiceFiltersState {
  search: string
  category_id: string
  is_active: '' | 'true' | 'false'
  currency: string
  sort: AdminServiceSortField
  direction: AdminServiceSortDirection
  page: number
}

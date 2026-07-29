export interface AdminCategory {
  id: number
  name: string
  slug: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AdminCategoriesQueryParams {
  search?: string
  is_active?: boolean
  sort: 'id' | 'name' | 'created_at' | 'updated_at'
  direction: 'asc' | 'desc'
  per_page: number
  page: number
}

export interface CreateCategoryPayload {
  name: string
  slug: string
  description?: string | null
  is_active?: boolean
}

export interface UpdateCategoryPayload {
  name?: string
  slug?: string
  description?: string | null
}

export interface UpdateCategoryStatusPayload {
  is_active: boolean
}

export interface CategoryFormValues {
  name: string
  slug: string
  description: string
  is_active: boolean
}

export type CategoryFieldErrors = Partial<
  Record<'name' | 'slug' | 'description' | 'is_active' | 'form', string>
>

export interface CategoryFiltersState {
  search: string
  is_active: '' | 'true' | 'false'
  page: number
}

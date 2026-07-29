export type AdminUserRole = 'admin' | 'client'
export type AdminUserStatus = 'active' | 'inactive'

export interface AdminUser {
  id: number
  name: string
  email: string
  phone: string | null
  role: AdminUserRole
  status: AdminUserStatus
  created_at: string
  updated_at: string
}

export interface AdminUsersQueryParams {
  search?: string
  role?: AdminUserRole
  status?: AdminUserStatus
  sort: 'id' | 'name' | 'email' | 'created_at' | 'updated_at'
  direction: 'asc' | 'desc'
  per_page: number
  page: number
}

export interface AdminUsersFiltersState {
  search: string
  role: '' | AdminUserRole
  status: '' | AdminUserStatus
  page: number
}

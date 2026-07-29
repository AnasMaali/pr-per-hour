export type AdminContactMessageStatus =
  | 'new'
  | 'read'
  | 'replied'
  | 'closed'

export interface AdminContactMessage {
  id: number
  full_name: string
  email: string
  phone: string | null
  organization: string | null
  message: string
  status: AdminContactMessageStatus
  created_at: string
  updated_at: string
}

export type AdminContactMessageSortField =
  | 'id'
  | 'full_name'
  | 'email'
  | 'status'
  | 'created_at'
  | 'updated_at'

export type AdminContactMessageSortDirection = 'asc' | 'desc'

export interface AdminContactMessagesQueryParams {
  search?: string
  status?: AdminContactMessageStatus
  email?: string
  organization?: string
  created_from?: string
  created_to?: string
  sort: AdminContactMessageSortField
  direction: AdminContactMessageSortDirection
  per_page: number
  page: number
}

export interface UpdateContactMessageStatusPayload {
  status: AdminContactMessageStatus
}

export interface AdminContactMessageFiltersState {
  search: string
  status: '' | AdminContactMessageStatus
  email: string
  organization: string
  created_from: string
  created_to: string
  sort: AdminContactMessageSortField
  direction: AdminContactMessageSortDirection
  page: number
}

export type AdminContactMessageFieldErrors = Partial<
  Record<'status' | 'form' | 'created_from' | 'created_to' | 'email', string>
>

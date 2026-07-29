export type AdminBookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

export type AdminContactMessageStatus =
  | 'new'
  | 'read'
  | 'replied'
  | 'closed'

export interface AdminBookingClientSummary {
  id: number
  name: string
  email: string
  phone: string | null
}

export interface AdminBookingCategorySummary {
  id: number
  name: string
  slug: string
}

export interface AdminBookingServiceSummary {
  id: number
  title: string
  slug: string
  duration_minutes: number | null
  price: string
  currency: string
  category: AdminBookingCategorySummary | null
}

export interface AdminBookingPreviewItem {
  id: number
  booking_date: string
  start_time: string
  end_time: string
  status: AdminBookingStatus
  notes: string | null
  meeting_link: string | null
  service: AdminBookingServiceSummary | null
  client: AdminBookingClientSummary | null
  created_at: string
  updated_at: string
}

export interface AdminContactMessagePreviewItem {
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

export interface AdminListQueryParams {
  page?: number
  per_page?: number
  sort?: string
  direction?: 'asc' | 'desc'
  status?: string
}

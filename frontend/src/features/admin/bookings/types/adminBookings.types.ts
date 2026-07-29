export type AdminBookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

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

export interface AdminBooking {
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

export type AdminBookingSortField =
  | 'id'
  | 'booking_date'
  | 'start_time'
  | 'end_time'
  | 'status'
  | 'created_at'
  | 'updated_at'

export type AdminBookingSortDirection = 'asc' | 'desc'

export interface AdminBookingsQueryParams {
  search?: string
  status?: AdminBookingStatus
  user_id?: number
  service_id?: number
  booking_date?: string
  date_from?: string
  date_to?: string
  sort: AdminBookingSortField
  direction: AdminBookingSortDirection
  per_page: number
  page: number
}

export interface UpdateBookingStatusPayload {
  status: AdminBookingStatus
}

export interface UpdateMeetingLinkPayload {
  meeting_link: string | null
}

export interface UpdateBookingNotesPayload {
  notes: string | null
}

export interface AdminBookingFiltersState {
  search: string
  status: '' | AdminBookingStatus
  service_id: string
  user_id: string
  booking_date: string
  date_from: string
  date_to: string
  sort: AdminBookingSortField
  direction: AdminBookingSortDirection
  page: number
}

export type AdminBookingFieldErrors = Partial<
  Record<'status' | 'meeting_link' | 'notes' | 'form' | 'date_from' | 'date_to', string>
>

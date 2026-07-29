export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

export interface BookingCategorySummary {
  id: number
  name: string
  slug: string
}

export interface BookingServiceSummary {
  id: number
  title: string
  slug: string
  duration_minutes: number | null
  price: string
  currency: string
  category: BookingCategorySummary | null
}

export interface ClientBooking {
  id: number
  booking_date: string
  start_time: string
  end_time: string
  status: BookingStatus
  notes: string | null
  meeting_link: string | null
  service: BookingServiceSummary | null
  created_at: string
  updated_at: string
}

export interface CreateBookingPayload {
  service_id: number
  booking_date: string
  start_time: string
  end_time: string
  notes?: string | null
}

export type BookingSortField =
  | 'booking_date'
  | 'start_time'
  | 'created_at'
  | 'updated_at'

export type BookingSortDirection = 'asc' | 'desc'

/** Frontend URL / form filter state for client booking list */
export interface BookingFiltersState {
  status: string
  service_id: string
  booking_date: string
  date_from: string
  date_to: string
  sort: BookingSortField
  direction: BookingSortDirection
  page: number
}

/** Backend query params for GET /bookings */
export interface ClientBookingsQueryParams {
  status?: BookingStatus
  service_id?: number
  booking_date?: string
  date_from?: string
  date_to?: string
  sort: BookingSortField
  direction: BookingSortDirection
  per_page: number
  page: number
}

export interface BookingFormValues {
  service_id: string
  booking_date: string
  start_time: string
  end_time: string
  notes: string
}

export type BookingFieldErrors = Partial<
  Record<
    | 'service_id'
    | 'booking_date'
    | 'start_time'
    | 'end_time'
    | 'notes'
    | 'form'
    | 'status'
    | 'service_id_filter'
    | 'date_from'
    | 'date_to'
    | 'date_range',
    string
  >
>

import { apiGet, apiPatch } from '@/shared/api/client'
import type { ApiPaginationMeta, ApiSuccessResponse } from '@/shared/api/types'
import type {
  AdminBooking,
  AdminBookingsQueryParams,
  UpdateBookingNotesPayload,
  UpdateBookingStatusPayload,
  UpdateMeetingLinkPayload,
} from '@/features/admin/bookings/types/adminBookings.types'

export async function fetchAdminBookingsList(
  params: AdminBookingsQueryParams,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminBooking[], ApiPaginationMeta>> {
  const response = await apiGet<AdminBooking[]>('/admin/bookings', {
    signal,
    params,
  })
  return response as ApiSuccessResponse<AdminBooking[], ApiPaginationMeta>
}

export async function fetchAdminBooking(
  id: number,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminBooking>> {
  return apiGet<AdminBooking>(`/admin/bookings/${id}`, { signal })
}

export async function updateAdminBookingStatus(
  id: number,
  payload: UpdateBookingStatusPayload,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminBooking>> {
  return apiPatch<AdminBooking, UpdateBookingStatusPayload>(
    `/admin/bookings/${id}/status`,
    payload,
    { signal },
  )
}

export async function updateAdminBookingMeetingLink(
  id: number,
  payload: UpdateMeetingLinkPayload,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminBooking>> {
  return apiPatch<AdminBooking, UpdateMeetingLinkPayload>(
    `/admin/bookings/${id}/meeting-link`,
    payload,
    { signal },
  )
}

export async function updateAdminBookingNotes(
  id: number,
  payload: UpdateBookingNotesPayload,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminBooking>> {
  return apiPatch<AdminBooking, UpdateBookingNotesPayload>(
    `/admin/bookings/${id}/notes`,
    payload,
    { signal },
  )
}

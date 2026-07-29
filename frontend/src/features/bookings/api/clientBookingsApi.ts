import { apiGet, apiPatch, apiPost } from '@/shared/api/client'
import type { ApiPaginationMeta, ApiSuccessResponse } from '@/shared/api/types'
import type {
  ClientBooking,
  ClientBookingsQueryParams,
  CreateBookingPayload,
} from '@/features/bookings/types/bookings.types'

export async function createClientBooking(
  payload: CreateBookingPayload,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<ClientBooking>> {
  return apiPost<ClientBooking, CreateBookingPayload>('/bookings', payload, {
    signal,
  })
}

export async function fetchClientBookings(
  params: ClientBookingsQueryParams,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<ClientBooking[], ApiPaginationMeta>> {
  const response = await apiGet<ClientBooking[]>('/bookings', {
    signal,
    params,
  })
  return response as ApiSuccessResponse<ClientBooking[], ApiPaginationMeta>
}

export async function fetchClientBooking(
  id: number | string,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<ClientBooking>> {
  return apiGet<ClientBooking>(`/bookings/${encodeURIComponent(String(id))}`, {
    signal,
  })
}

export async function cancelClientBooking(
  id: number | string,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<ClientBooking>> {
  return apiPatch<ClientBooking>(
    `/bookings/${encodeURIComponent(String(id))}/cancel`,
    {},
    { signal },
  )
}

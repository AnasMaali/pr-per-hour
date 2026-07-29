import { apiGet } from '@/shared/api/client'
import type { ApiPaginationMeta, ApiSuccessResponse } from '@/shared/api/types'
import type {
  AdminBookingPreviewItem,
  AdminContactMessagePreviewItem,
  AdminListQueryParams,
} from '@/features/admin/dashboard/types/adminOverview.types'

export async function fetchAdminBookings(
  params: AdminListQueryParams,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminBookingPreviewItem[], ApiPaginationMeta>> {
  const response = await apiGet<AdminBookingPreviewItem[]>('/admin/bookings', {
    signal,
    params,
  })
  return response as ApiSuccessResponse<
    AdminBookingPreviewItem[],
    ApiPaginationMeta
  >
}

export async function fetchAdminContactMessages(
  params: AdminListQueryParams,
  signal?: AbortSignal,
): Promise<
  ApiSuccessResponse<AdminContactMessagePreviewItem[], ApiPaginationMeta>
> {
  const response = await apiGet<AdminContactMessagePreviewItem[]>(
    '/admin/contact-messages',
    { signal, params },
  )
  return response as ApiSuccessResponse<
    AdminContactMessagePreviewItem[],
    ApiPaginationMeta
  >
}

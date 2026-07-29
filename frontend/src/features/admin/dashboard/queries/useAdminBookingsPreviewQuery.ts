import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { fetchAdminBookings } from '@/features/admin/dashboard/api/adminOverviewApi'

const PREVIEW_PARAMS = {
  page: 1,
  per_page: 5,
  sort: 'created_at',
  direction: 'desc' as const,
}

/** Recent admin bookings + accurate total from pagination meta. */
export function useAdminBookingsPreviewQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.admin.bookings({ purpose: 'preview', ...PREVIEW_PARAMS }),
    queryFn: async ({ signal }) => {
      const response = await fetchAdminBookings(PREVIEW_PARAMS, signal)
      return {
        bookings: response.data,
        total: response.meta?.total ?? 0,
      }
    },
    staleTime: 60_000,
    retry: 1,
    enabled,
  })
}

/** Accurate pending booking count via meta.total (per_page=1). */
export function useAdminPendingBookingsCountQuery(enabled = true) {
  const params = {
    page: 1,
    per_page: 1,
    status: 'pending',
  }
  return useQuery({
    queryKey: queryKeys.admin.bookings({ purpose: 'count-pending', ...params }),
    queryFn: async ({ signal }) => {
      const response = await fetchAdminBookings(params, signal)
      return response.meta?.total ?? 0
    },
    staleTime: 60_000,
    retry: 1,
    enabled,
  })
}

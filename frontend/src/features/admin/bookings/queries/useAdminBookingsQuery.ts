import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { fetchAdminBookingsList } from '@/features/admin/bookings/api/adminBookingsApi'
import type { AdminBookingFiltersState } from '@/features/admin/bookings/types/adminBookings.types'
import { adminBookingFiltersToApiParams } from '@/features/admin/bookings/utils/adminBookingFilters'

export function useAdminBookingsQuery(filters: AdminBookingFiltersState) {
  const params = adminBookingFiltersToApiParams(filters)

  return useQuery({
    queryKey: queryKeys.admin.bookings({ ...params }),
    queryFn: async ({ signal }) => {
      const response = await fetchAdminBookingsList(params, signal)
      return {
        bookings: response.data,
        meta: response.meta ?? {
          current_page: 1,
          per_page: params.per_page,
          total: response.data.length,
          last_page: 1,
        },
      }
    },
    staleTime: 30_000,
    retry: 1,
  })
}

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { fetchAdminBooking } from '@/features/admin/bookings/api/adminBookingsApi'

export function useAdminBookingQuery(id: number | null) {
  return useQuery({
    queryKey: queryKeys.admin.bookings({ purpose: 'detail', id }),
    queryFn: async ({ signal }) => {
      if (id === null) throw new Error('Missing booking id')
      const response = await fetchAdminBooking(id, signal)
      return response.data
    },
    enabled: id !== null && Number.isFinite(id) && id > 0,
    staleTime: 30_000,
    retry: 1,
  })
}

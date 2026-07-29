import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { fetchClientBooking } from '@/features/bookings/api/clientBookingsApi'

export function useClientBookingQuery(id: string | undefined) {
  const safeId = id?.trim() ?? ''
  const numeric = Number.parseInt(safeId, 10)
  const enabled = Number.isFinite(numeric) && numeric >= 1

  return useQuery({
    queryKey: queryKeys.bookings.detail(safeId),
    queryFn: async ({ signal }) => {
      const response = await fetchClientBooking(safeId, signal)
      return response.data
    },
    enabled,
    retry: false,
  })
}

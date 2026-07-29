import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { fetchClientBookings } from '@/features/bookings/api/clientBookingsApi'
import {
  bookingApiParamsToQueryKey,
  bookingFiltersToApiParams,
} from '@/features/bookings/utils/bookingFilters'
import type { BookingFiltersState } from '@/features/bookings/types/bookings.types'

export function useClientBookingsQuery(
  filters: BookingFiltersState,
  enabled = true,
) {
  const apiParams = bookingFiltersToApiParams(filters)

  return useQuery({
    queryKey: queryKeys.bookings.list(bookingApiParamsToQueryKey(apiParams)),
    queryFn: async ({ signal }) => {
      const response = await fetchClientBookings(apiParams, signal)
      return {
        bookings: response.data,
        meta: response.meta,
        message: response.message,
      }
    },
    enabled,
  })
}

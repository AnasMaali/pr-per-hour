import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { fetchPublicServices } from '@/features/services/api/publicServicesApi'

/** Active public services for booking service select (cached). */
export function useBookingServicesOptionsQuery() {
  return useQuery({
    queryKey: queryKeys.services.list({
      scope: 'booking-options',
      per_page: 100,
      page: 1,
      sort: 'title',
      direction: 'asc',
    }),
    queryFn: async ({ signal }) => {
      const response = await fetchPublicServices(
        {
          per_page: 100,
          page: 1,
          sort: 'title',
          direction: 'asc',
        },
        signal,
      )
      return response.data
    },
    staleTime: 5 * 60_000,
  })
}

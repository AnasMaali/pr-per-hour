import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { fetchAdminServices } from '@/features/admin/services/api/adminServicesApi'

/**
 * Service options for booking filters (first 100 by title).
 * Documented compromise if catalog exceeds one page.
 */
export function useAdminBookingServiceOptionsQuery(enabled = true) {
  const params = {
    sort: 'title' as const,
    direction: 'asc' as const,
    per_page: 100,
    page: 1,
  }

  return useQuery({
    queryKey: queryKeys.admin.services({
      purpose: 'booking-filter-options',
      ...params,
    }),
    queryFn: async ({ signal }) => {
      const response = await fetchAdminServices(params, signal)
      return response.data
    },
    enabled,
    staleTime: 60_000,
    retry: 1,
  })
}

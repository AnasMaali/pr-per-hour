import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { fetchPublicServiceCategories } from '@/features/services/api/publicCategoriesApi'
import { fetchPublicServices } from '@/features/services/api/publicServicesApi'

/** Active/public category count from non-paginated public list length. */
export function useActiveCategoriesCountQuery() {
  return useQuery({
    queryKey: queryKeys.categories.list({ scope: 'public', purpose: 'admin-count' }),
    queryFn: async ({ signal }) => {
      const response = await fetchPublicServiceCategories(signal)
      return response.data.length
    },
    staleTime: 5 * 60_000,
    retry: 1,
  })
}

/** Active/public service count from public services pagination meta.total. */
export function useActiveServicesCountQuery() {
  const params = {
    page: 1,
    per_page: 1,
    sort: 'title' as const,
    direction: 'asc' as const,
  }
  return useQuery({
    queryKey: queryKeys.services.list({ purpose: 'admin-count', ...params }),
    queryFn: async ({ signal }) => {
      const response = await fetchPublicServices(params, signal)
      return response.meta?.total ?? 0
    },
    staleTime: 5 * 60_000,
    retry: 1,
  })
}

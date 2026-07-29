import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { fetchPublicServiceCategories } from '@/features/services/api/publicCategoriesApi'

export function usePublicCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories.list({ scope: 'public' }),
    queryFn: async ({ signal }) => {
      const response = await fetchPublicServiceCategories(signal)
      return response.data
    },
    staleTime: 5 * 60_000,
  })
}

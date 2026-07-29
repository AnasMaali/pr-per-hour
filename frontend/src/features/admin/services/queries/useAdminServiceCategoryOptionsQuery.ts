import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { fetchAdminCategories } from '@/features/admin/categories/api/adminCategoriesApi'

/** Categories for service form/filter selects (active + inactive, non-deleted). */
export function useAdminServiceCategoryOptionsQuery(enabled = true) {
  const params = {
    sort: 'name' as const,
    direction: 'asc' as const,
    per_page: 100,
    page: 1,
  }

  return useQuery({
    queryKey: queryKeys.admin.categories({
      purpose: 'service-options',
      ...params,
    }),
    queryFn: async ({ signal }) => {
      const response = await fetchAdminCategories(params, signal)
      return response.data
    },
    enabled,
    staleTime: 60_000,
    retry: 1,
  })
}

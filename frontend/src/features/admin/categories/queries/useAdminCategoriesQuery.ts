import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { fetchAdminCategories } from '@/features/admin/categories/api/adminCategoriesApi'
import type { CategoryFiltersState } from '@/features/admin/categories/types/adminCategories.types'
import { categoryFiltersToApiParams } from '@/features/admin/categories/utils/categoryFormatting'

export function useAdminCategoriesQuery(filters: CategoryFiltersState) {
  const params = categoryFiltersToApiParams(filters)

  return useQuery({
    queryKey: queryKeys.admin.categories({ ...params }),
    queryFn: async ({ signal }) => {
      const response = await fetchAdminCategories(params, signal)
      return {
        categories: response.data,
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

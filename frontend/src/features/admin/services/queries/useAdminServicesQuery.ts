import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { fetchAdminServices } from '@/features/admin/services/api/adminServicesApi'
import type { ServiceFiltersState } from '@/features/admin/services/types/adminServices.types'
import { serviceFiltersToApiParams } from '@/features/admin/services/utils/serviceFormatting'

export function useAdminServicesQuery(filters: ServiceFiltersState) {
  const params = serviceFiltersToApiParams(filters)

  return useQuery({
    queryKey: queryKeys.admin.services({ ...params }),
    queryFn: async ({ signal }) => {
      const response = await fetchAdminServices(params, signal)
      return {
        services: response.data,
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

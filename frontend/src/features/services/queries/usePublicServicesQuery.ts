import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { fetchPublicServices } from '@/features/services/api/publicServicesApi'
import {
  apiParamsToQueryKey,
  filtersToApiParams,
} from '@/features/services/utils/serviceFilters'
import type { ServiceFiltersState } from '@/features/services/types/services.types'

export function usePublicServicesQuery(
  filters: ServiceFiltersState,
  enabled = true,
) {
  const apiParams = filtersToApiParams(filters)

  return useQuery({
    queryKey: queryKeys.services.list(apiParamsToQueryKey(apiParams)),
    queryFn: async ({ signal }) => {
      const response = await fetchPublicServices(apiParams, signal)
      return {
        services: response.data,
        meta: response.meta,
        message: response.message,
      }
    },
    enabled,
  })
}

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { fetchPublicServiceBySlug } from '@/features/services/api/publicServicesApi'

export function usePublicServiceQuery(slug: string | undefined) {
  const safeSlug = slug?.trim() ?? ''

  return useQuery({
    queryKey: queryKeys.services.detail(safeSlug),
    queryFn: async ({ signal }) => {
      const response = await fetchPublicServiceBySlug(safeSlug, signal)
      return response.data
    },
    enabled: safeSlug.length > 0,
    retry: false,
  })
}

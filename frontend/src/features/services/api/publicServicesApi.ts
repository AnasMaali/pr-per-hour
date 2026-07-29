import { apiGet } from '@/shared/api/client'
import type { ApiPaginationMeta, ApiSuccessResponse } from '@/shared/api/types'
import type {
  PublicService,
  PublicServicesQueryParams,
} from '@/features/services/types/services.types'

export async function fetchPublicServices(
  params: PublicServicesQueryParams,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<PublicService[], ApiPaginationMeta>> {
  const response = await apiGet<PublicService[]>('/services', {
    signal,
    params,
  })
  return response as ApiSuccessResponse<PublicService[], ApiPaginationMeta>
}

export async function fetchPublicServiceBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<PublicService>> {
  return apiGet<PublicService>(`/services/${encodeURIComponent(slug)}`, {
    signal,
  })
}

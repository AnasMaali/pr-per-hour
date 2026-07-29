import { apiGet } from '@/shared/api/client'
import type { ApiSuccessResponse } from '@/shared/api/types'
import type { PublicServiceCategory } from '@/features/services/types/services.types'

export async function fetchPublicServiceCategories(
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<PublicServiceCategory[]>> {
  return apiGet<PublicServiceCategory[]>('/service-categories', { signal })
}

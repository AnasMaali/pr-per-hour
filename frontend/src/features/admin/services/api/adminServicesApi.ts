import { apiDelete, apiGet, apiPatch, apiPost } from '@/shared/api/client'
import type { ApiPaginationMeta, ApiSuccessResponse } from '@/shared/api/types'
import type {
  AdminService,
  AdminServicesQueryParams,
  CreateServicePayload,
  UpdateServicePayload,
  UpdateServiceStatusPayload,
} from '@/features/admin/services/types/adminServices.types'

export async function fetchAdminServices(
  params: AdminServicesQueryParams,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminService[], ApiPaginationMeta>> {
  const response = await apiGet<AdminService[]>('/admin/services', {
    signal,
    params,
  })
  return response as ApiSuccessResponse<AdminService[], ApiPaginationMeta>
}

export async function createAdminService(
  payload: CreateServicePayload,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminService>> {
  return apiPost<AdminService, CreateServicePayload>(
    '/admin/services',
    payload,
    { signal },
  )
}

export async function updateAdminService(
  id: number,
  payload: UpdateServicePayload,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminService>> {
  return apiPatch<AdminService, UpdateServicePayload>(
    `/admin/services/${id}`,
    payload,
    { signal },
  )
}

export async function updateAdminServiceStatus(
  id: number,
  payload: UpdateServiceStatusPayload,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminService>> {
  return apiPatch<AdminService, UpdateServiceStatusPayload>(
    `/admin/services/${id}/status`,
    payload,
    { signal },
  )
}

export async function deleteAdminService(
  id: number,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<null> | void> {
  return apiDelete(`/admin/services/${id}`, { signal })
}

/** Restore soft-deleted service by numeric id (POST). */
export async function restoreAdminService(
  id: number,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminService>> {
  return apiPost<AdminService>(`/admin/services/${id}/restore`, undefined, {
    signal,
  })
}

import { apiDelete, apiGet, apiPatch, apiPost } from '@/shared/api/client'
import type { ApiPaginationMeta, ApiSuccessResponse } from '@/shared/api/types'
import type {
  AdminCategoriesQueryParams,
  AdminCategory,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  UpdateCategoryStatusPayload,
} from '@/features/admin/categories/types/adminCategories.types'

export async function fetchAdminCategories(
  params: AdminCategoriesQueryParams,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminCategory[], ApiPaginationMeta>> {
  const response = await apiGet<AdminCategory[]>('/admin/service-categories', {
    signal,
    params,
  })
  return response as ApiSuccessResponse<AdminCategory[], ApiPaginationMeta>
}

export async function createAdminCategory(
  payload: CreateCategoryPayload,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminCategory>> {
  return apiPost<AdminCategory, CreateCategoryPayload>(
    '/admin/service-categories',
    payload,
    { signal },
  )
}

export async function updateAdminCategory(
  id: number,
  payload: UpdateCategoryPayload,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminCategory>> {
  return apiPatch<AdminCategory, UpdateCategoryPayload>(
    `/admin/service-categories/${id}`,
    payload,
    { signal },
  )
}

export async function updateAdminCategoryStatus(
  id: number,
  payload: UpdateCategoryStatusPayload,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminCategory>> {
  return apiPatch<AdminCategory, UpdateCategoryStatusPayload>(
    `/admin/service-categories/${id}/status`,
    payload,
    { signal },
  )
}

export async function deleteAdminCategory(
  id: number,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<null> | void> {
  return apiDelete(`/admin/service-categories/${id}`, { signal })
}

/** Restore soft-deleted category by numeric id (POST). */
export async function restoreAdminCategory(
  id: number,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminCategory>> {
  return apiPost<AdminCategory>(
    `/admin/service-categories/${id}/restore`,
    undefined,
    { signal },
  )
}

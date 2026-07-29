import { apiGet, apiPatch } from '@/shared/api/client'
import type { ApiPaginationMeta, ApiSuccessResponse } from '@/shared/api/types'
import type {
  AdminUser,
  AdminUsersQueryParams,
  AdminUserStatus,
} from '@/features/admin/users/types/adminUsers.types'

export async function fetchAdminUsers(
  params: AdminUsersQueryParams,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminUser[], ApiPaginationMeta>> {
  const response = await apiGet<AdminUser[]>('/admin/users', { signal, params })
  return response as ApiSuccessResponse<AdminUser[], ApiPaginationMeta>
}

export async function updateAdminUserStatus(
  id: number,
  status: AdminUserStatus,
): Promise<ApiSuccessResponse<AdminUser>> {
  return apiPatch<AdminUser, { status: AdminUserStatus }>(
    `/admin/users/${id}/status`,
    { status },
  )
}

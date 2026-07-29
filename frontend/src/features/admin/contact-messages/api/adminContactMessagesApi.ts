import { apiDelete, apiGet, apiPatch } from '@/shared/api/client'
import type { ApiPaginationMeta, ApiSuccessResponse } from '@/shared/api/types'
import type {
  AdminContactMessage,
  AdminContactMessagesQueryParams,
  UpdateContactMessageStatusPayload,
} from '@/features/admin/contact-messages/types/adminContactMessages.types'

export async function fetchAdminContactMessagesList(
  params: AdminContactMessagesQueryParams,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminContactMessage[], ApiPaginationMeta>> {
  const response = await apiGet<AdminContactMessage[]>(
    '/admin/contact-messages',
    { signal, params },
  )
  return response as ApiSuccessResponse<
    AdminContactMessage[],
    ApiPaginationMeta
  >
}

export async function fetchAdminContactMessage(
  id: number,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminContactMessage>> {
  return apiGet<AdminContactMessage>(`/admin/contact-messages/${id}`, {
    signal,
  })
}

export async function updateAdminContactMessageStatus(
  id: number,
  payload: UpdateContactMessageStatusPayload,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminContactMessage>> {
  return apiPatch<AdminContactMessage, UpdateContactMessageStatusPayload>(
    `/admin/contact-messages/${id}/status`,
    payload,
    { signal },
  )
}

export async function deleteAdminContactMessage(
  id: number,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AdminContactMessage> | void> {
  return apiDelete<AdminContactMessage>(`/admin/contact-messages/${id}`, {
    signal,
  })
}

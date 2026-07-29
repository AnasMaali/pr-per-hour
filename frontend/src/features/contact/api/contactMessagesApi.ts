import { apiPost } from '@/shared/api/client'
import type { ApiSuccessResponse } from '@/shared/api/types'
import type {
  ContactMessageReceipt,
  SubmitContactMessagePayload,
} from '@/features/contact/types/contact.types'

export async function submitContactMessage(
  payload: SubmitContactMessagePayload,
): Promise<ApiSuccessResponse<ContactMessageReceipt>> {
  return apiPost<ContactMessageReceipt, SubmitContactMessagePayload>(
    '/contact-messages',
    payload,
  )
}

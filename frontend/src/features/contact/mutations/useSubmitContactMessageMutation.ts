import { useMutation } from '@tanstack/react-query'
import { submitContactMessage } from '@/features/contact/api/contactMessagesApi'
import type { SubmitContactMessagePayload } from '@/features/contact/types/contact.types'

export function useSubmitContactMessageMutation() {
  return useMutation({
    mutationFn: (payload: SubmitContactMessagePayload) =>
      submitContactMessage(payload).then((response) => response.data),
    retry: false,
  })
}

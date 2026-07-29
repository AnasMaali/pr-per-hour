import { useMutation } from '@tanstack/react-query'
import { updateAdminContactMessageStatus } from '@/features/admin/contact-messages/api/adminContactMessagesApi'
import { useInvalidateAdminContactMessageCaches } from '@/features/admin/contact-messages/queries/invalidateAdminContactMessageCaches'
import type { UpdateContactMessageStatusPayload } from '@/features/admin/contact-messages/types/adminContactMessages.types'

export function useUpdateContactMessageStatusMutation() {
  const invalidate = useInvalidateAdminContactMessageCaches()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: UpdateContactMessageStatusPayload
    }) =>
      updateAdminContactMessageStatus(id, payload).then(
        (response) => response.data,
      ),
    retry: false,
    onSuccess: (message) => {
      invalidate(message)
    },
  })
}

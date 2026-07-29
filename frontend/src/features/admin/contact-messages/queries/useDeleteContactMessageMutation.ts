import { useMutation } from '@tanstack/react-query'
import { deleteAdminContactMessage } from '@/features/admin/contact-messages/api/adminContactMessagesApi'
import { useInvalidateAdminContactMessageCaches } from '@/features/admin/contact-messages/queries/invalidateAdminContactMessageCaches'

export function useDeleteContactMessageMutation() {
  const invalidate = useInvalidateAdminContactMessageCaches()

  return useMutation({
    mutationFn: (id: number) => deleteAdminContactMessage(id),
    retry: false,
    onSuccess: (_data, id) => {
      invalidate(null, { removedId: id })
    },
  })
}

import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import type { AdminContactMessage } from '@/features/admin/contact-messages/types/adminContactMessages.types'

/**
 * Invalidate admin contact-message lists/previews/counts.
 * Soft-deleted messages disappear from list/detail.
 */
export function useInvalidateAdminContactMessageCaches() {
  const queryClient = useQueryClient()

  return (message?: AdminContactMessage | null, options?: { removedId?: number }) => {
    void queryClient.invalidateQueries({
      queryKey: [...queryKeys.admin.all, 'contact-messages'],
    })

    if (message) {
      queryClient.setQueryData(
        queryKeys.admin.contactMessages({
          purpose: 'detail',
          id: message.id,
        }),
        message,
      )
    }

    if (options?.removedId) {
      queryClient.removeQueries({
        queryKey: queryKeys.admin.contactMessages({
          purpose: 'detail',
          id: options.removedId,
        }),
      })
    }
  }
}

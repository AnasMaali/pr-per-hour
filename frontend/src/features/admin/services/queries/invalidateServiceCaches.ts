import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'

/**
 * Invalidate admin service lists + public services catalog/details
 * (covers overview active-service count and homepage previews).
 */
export function useInvalidateServiceCaches() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({
      queryKey: [...queryKeys.admin.all, 'services'],
    })
    void queryClient.invalidateQueries({ queryKey: queryKeys.services.all })
  }
}

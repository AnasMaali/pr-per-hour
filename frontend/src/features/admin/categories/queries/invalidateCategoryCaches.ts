import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'

/** Invalidate admin category lists + public catalog + overview active-count. */
export function useInvalidateCategoryCaches() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({
      queryKey: [...queryKeys.admin.all, 'categories'],
    })
    void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
  }
}

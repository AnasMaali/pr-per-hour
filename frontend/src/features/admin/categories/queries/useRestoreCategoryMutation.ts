import { useMutation } from '@tanstack/react-query'
import { restoreAdminCategory } from '@/features/admin/categories/api/adminCategoriesApi'
import { useInvalidateCategoryCaches } from '@/features/admin/categories/queries/invalidateCategoryCaches'

export function useRestoreCategoryMutation() {
  const invalidate = useInvalidateCategoryCaches()

  return useMutation({
    mutationFn: (id: number) =>
      restoreAdminCategory(id).then((response) => response.data),
    retry: false,
    onSuccess: () => {
      invalidate()
    },
  })
}

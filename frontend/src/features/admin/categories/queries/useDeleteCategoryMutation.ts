import { useMutation } from '@tanstack/react-query'
import { deleteAdminCategory } from '@/features/admin/categories/api/adminCategoriesApi'
import { useInvalidateCategoryCaches } from '@/features/admin/categories/queries/invalidateCategoryCaches'

export function useDeleteCategoryMutation() {
  const invalidate = useInvalidateCategoryCaches()

  return useMutation({
    mutationFn: (id: number) => deleteAdminCategory(id),
    retry: false,
    onSuccess: () => {
      invalidate()
    },
  })
}

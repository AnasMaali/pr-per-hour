import { useMutation } from '@tanstack/react-query'
import { createAdminCategory } from '@/features/admin/categories/api/adminCategoriesApi'
import { useInvalidateCategoryCaches } from '@/features/admin/categories/queries/invalidateCategoryCaches'
import type { CreateCategoryPayload } from '@/features/admin/categories/types/adminCategories.types'

export function useCreateCategoryMutation() {
  const invalidate = useInvalidateCategoryCaches()

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) =>
      createAdminCategory(payload).then((response) => response.data),
    retry: false,
    onSuccess: () => {
      invalidate()
    },
  })
}

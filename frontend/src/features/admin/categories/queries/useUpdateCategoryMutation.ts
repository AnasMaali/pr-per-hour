import { useMutation } from '@tanstack/react-query'
import {
  updateAdminCategory,
  updateAdminCategoryStatus,
} from '@/features/admin/categories/api/adminCategoriesApi'
import { useInvalidateCategoryCaches } from '@/features/admin/categories/queries/invalidateCategoryCaches'
import type {
  UpdateCategoryPayload,
  UpdateCategoryStatusPayload,
} from '@/features/admin/categories/types/adminCategories.types'

export function useUpdateCategoryMutation() {
  const invalidate = useInvalidateCategoryCaches()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: UpdateCategoryPayload
    }) => updateAdminCategory(id, payload).then((response) => response.data),
    retry: false,
    onSuccess: () => {
      invalidate()
    },
  })
}

export function useUpdateCategoryStatusMutation() {
  const invalidate = useInvalidateCategoryCaches()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: UpdateCategoryStatusPayload
    }) =>
      updateAdminCategoryStatus(id, payload).then((response) => response.data),
    retry: false,
    onSuccess: () => {
      invalidate()
    },
  })
}

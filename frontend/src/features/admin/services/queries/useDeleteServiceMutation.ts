import { useMutation } from '@tanstack/react-query'
import { deleteAdminService } from '@/features/admin/services/api/adminServicesApi'
import { useInvalidateServiceCaches } from '@/features/admin/services/queries/invalidateServiceCaches'

export function useDeleteServiceMutation() {
  const invalidate = useInvalidateServiceCaches()

  return useMutation({
    mutationFn: (id: number) => deleteAdminService(id),
    retry: false,
    onSuccess: () => {
      invalidate()
    },
  })
}

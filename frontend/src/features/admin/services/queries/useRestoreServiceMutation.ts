import { useMutation } from '@tanstack/react-query'
import { restoreAdminService } from '@/features/admin/services/api/adminServicesApi'
import { useInvalidateServiceCaches } from '@/features/admin/services/queries/invalidateServiceCaches'

export function useRestoreServiceMutation() {
  const invalidate = useInvalidateServiceCaches()

  return useMutation({
    mutationFn: (id: number) =>
      restoreAdminService(id).then((response) => response.data),
    retry: false,
    onSuccess: () => {
      invalidate()
    },
  })
}

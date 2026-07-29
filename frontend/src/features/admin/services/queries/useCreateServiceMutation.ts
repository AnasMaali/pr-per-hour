import { useMutation } from '@tanstack/react-query'
import { createAdminService } from '@/features/admin/services/api/adminServicesApi'
import { useInvalidateServiceCaches } from '@/features/admin/services/queries/invalidateServiceCaches'
import type { CreateServicePayload } from '@/features/admin/services/types/adminServices.types'

export function useCreateServiceMutation() {
  const invalidate = useInvalidateServiceCaches()

  return useMutation({
    mutationFn: (payload: CreateServicePayload) =>
      createAdminService(payload).then((response) => response.data),
    retry: false,
    onSuccess: () => {
      invalidate()
    },
  })
}

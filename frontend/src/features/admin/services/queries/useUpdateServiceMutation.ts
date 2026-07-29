import { useMutation } from '@tanstack/react-query'
import {
  updateAdminService,
  updateAdminServiceStatus,
} from '@/features/admin/services/api/adminServicesApi'
import { useInvalidateServiceCaches } from '@/features/admin/services/queries/invalidateServiceCaches'
import type {
  UpdateServicePayload,
  UpdateServiceStatusPayload,
} from '@/features/admin/services/types/adminServices.types'

export function useUpdateServiceMutation() {
  const invalidate = useInvalidateServiceCaches()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: UpdateServicePayload
    }) => updateAdminService(id, payload).then((response) => response.data),
    retry: false,
    onSuccess: () => {
      invalidate()
    },
  })
}

export function useUpdateServiceStatusMutation() {
  const invalidate = useInvalidateServiceCaches()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: UpdateServiceStatusPayload
    }) =>
      updateAdminServiceStatus(id, payload).then((response) => response.data),
    retry: false,
    onSuccess: () => {
      invalidate()
    },
  })
}

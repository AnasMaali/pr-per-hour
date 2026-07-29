import { useMutation } from '@tanstack/react-query'
import { updateAdminBookingStatus } from '@/features/admin/bookings/api/adminBookingsApi'
import { useInvalidateAdminBookingCaches } from '@/features/admin/bookings/queries/invalidateAdminBookingCaches'
import type { UpdateBookingStatusPayload } from '@/features/admin/bookings/types/adminBookings.types'

export function useUpdateBookingStatusMutation() {
  const invalidate = useInvalidateAdminBookingCaches()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: UpdateBookingStatusPayload
    }) =>
      updateAdminBookingStatus(id, payload).then((response) => response.data),
    retry: false,
    onSuccess: (booking) => {
      invalidate(booking)
    },
  })
}

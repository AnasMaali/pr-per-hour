import { useMutation } from '@tanstack/react-query'
import { updateAdminBookingMeetingLink } from '@/features/admin/bookings/api/adminBookingsApi'
import { useInvalidateAdminBookingCaches } from '@/features/admin/bookings/queries/invalidateAdminBookingCaches'
import type { UpdateMeetingLinkPayload } from '@/features/admin/bookings/types/adminBookings.types'

export function useUpdateMeetingLinkMutation() {
  const invalidate = useInvalidateAdminBookingCaches()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: UpdateMeetingLinkPayload
    }) =>
      updateAdminBookingMeetingLink(id, payload).then(
        (response) => response.data,
      ),
    retry: false,
    onSuccess: (booking) => {
      invalidate(booking)
    },
  })
}

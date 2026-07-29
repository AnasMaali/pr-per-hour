import { useMutation } from '@tanstack/react-query'
import { updateAdminBookingNotes } from '@/features/admin/bookings/api/adminBookingsApi'
import { useInvalidateAdminBookingCaches } from '@/features/admin/bookings/queries/invalidateAdminBookingCaches'
import type { UpdateBookingNotesPayload } from '@/features/admin/bookings/types/adminBookings.types'

export function useUpdateBookingNotesMutation() {
  const invalidate = useInvalidateAdminBookingCaches()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: UpdateBookingNotesPayload
    }) =>
      updateAdminBookingNotes(id, payload).then((response) => response.data),
    retry: false,
    onSuccess: (booking) => {
      invalidate(booking)
    },
  })
}

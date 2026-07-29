import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import type { AdminBooking } from '@/features/admin/bookings/types/adminBookings.types'

/**
 * Invalidate admin booking lists/previews + client booking caches
 * (owner may see status/notes/meeting_link changes).
 */
export function useInvalidateAdminBookingCaches() {
  const queryClient = useQueryClient()

  return (booking?: AdminBooking) => {
    void queryClient.invalidateQueries({
      queryKey: [...queryKeys.admin.all, 'bookings'],
    })
    void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all })

    if (booking) {
      queryClient.setQueryData(
        queryKeys.admin.bookings({ purpose: 'detail', id: booking.id }),
        booking,
      )
    }
  }
}

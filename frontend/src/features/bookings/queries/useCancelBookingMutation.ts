import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { cancelClientBooking } from '@/features/bookings/api/clientBookingsApi'

export function useCancelBookingMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number | string) => cancelClientBooking(id),
    retry: false,
    onSuccess: (response) => {
      queryClient.setQueryData(
        queryKeys.bookings.detail(response.data.id),
        response.data,
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all })
    },
  })
}

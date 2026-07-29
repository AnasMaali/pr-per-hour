import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/queryKeys'
import { createClientBooking } from '@/features/bookings/api/clientBookingsApi'
import type { CreateBookingPayload } from '@/features/bookings/types/bookings.types'

export function useCreateBookingMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => createClientBooking(payload),
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

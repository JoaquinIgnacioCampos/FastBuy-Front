import { useMutation } from '@tanstack/react-query'
import { createOrder } from '../services/api'

export function useCreateOrder() {
  return useMutation({
    mutationFn: ({ items, bar, total, eventId }) => createOrder(items, bar, total, eventId),
  })
}

import { useMutation } from '@tanstack/react-query'
import { createOrder } from '../services'

export function useCreateOrder() {
  return useMutation({
    mutationFn: ({ items, bar, total }) => createOrder(items, bar, total),
  })
}

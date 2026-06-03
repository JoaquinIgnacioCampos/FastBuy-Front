import { useMutation } from '@tanstack/react-query'
import { createPaymentPreference } from '../services/api'

export function useCreatePaymentPreference() {
  return useMutation({
    mutationFn: (orderId) => createPaymentPreference(orderId),
  })
}

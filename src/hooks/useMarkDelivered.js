import { useMutation, useQueryClient } from '@tanstack/react-query'
import { markDelivered } from '../services/api'

export function useMarkDelivered(barId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => markDelivered(id),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['orders', barId] })
      qc.invalidateQueries({ queryKey: ['delivered-orders', barId] })
      qc.invalidateQueries({ queryKey: ['order-status'] })
    },
  })
}

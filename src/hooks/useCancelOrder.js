import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelOrder } from '../services/api'

export function useCancelOrder(barId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => cancelOrder(id),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['orders', barId] })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { markDelivered } from '../services'

export function useMarkDelivered(barId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => markDelivered(id),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['orders', barId] })
      // Same-tab customer view (if any) is watching this order via
      // ['order-status', orderId, barId]. Invalidate the whole prefix so the
      // QR screen flips to 'confirmed' immediately instead of waiting for the
      // next 3s poll tick.
      qc.invalidateQueries({ queryKey: ['order-status'] })
    },
  })
}

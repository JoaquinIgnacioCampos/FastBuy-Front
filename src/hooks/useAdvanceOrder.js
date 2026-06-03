import { useMutation, useQueryClient } from '@tanstack/react-query'
import { advanceOrder } from '../services'

const NEXT_STATUS = { queue: 'preparing', preparing: 'ready' }

export function useAdvanceOrder(barId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => advanceOrder(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['orders', barId] })
      const prev = qc.getQueryData(['orders', barId])
      qc.setQueryData(['orders', barId], (old) =>
        (old ?? []).map(o =>
          o.id === id && NEXT_STATUS[o.status]
            ? { ...o, status: NEXT_STATUS[o.status] }
            : o
        )
      )
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['orders', barId], ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['orders', barId] })
      // Customer-side QR / queue polling lives under ['order-status']; refresh
      // it too so the customer sees queue → preparing → ready without waiting
      // for the next 3s poll tick.
      qc.invalidateQueries({ queryKey: ['order-status'] })
    },
  })
}

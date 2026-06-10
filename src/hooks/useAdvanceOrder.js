import { useMutation, useQueryClient } from '@tanstack/react-query'
import { advanceOrder } from '../services/api'

const NEXT_STATUS = { queue: 'preparing', preparing: 'ready' }

export function useAdvanceOrder(barId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, bartenderId }) => advanceOrder(id, bartenderId),
    onMutate: async ({ id, bartenderId }) => {
      await qc.cancelQueries({ queryKey: ['orders', barId] })
      const prev = qc.getQueryData(['orders', barId])
      qc.setQueryData(['orders', barId], (old) =>
        (old ?? []).map(o => {
          if (o.id !== id || !NEXT_STATUS[o.status]) return o
          const next = { ...o, status: NEXT_STATUS[o.status] }
          if (o.status === 'queue' && bartenderId) next.claimedBy = bartenderId
          return next
        })
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['orders', barId], ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['orders', barId] })
      qc.invalidateQueries({ queryKey: ['order-status'] })
    },
  })
}

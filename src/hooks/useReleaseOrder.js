import { useMutation, useQueryClient } from '@tanstack/react-query'
import { releaseOrder } from '../services/api'

export function useReleaseOrder(barId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => releaseOrder(id),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['orders', barId] })
    },
  })
}

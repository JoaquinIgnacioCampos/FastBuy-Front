import { useQuery } from '@tanstack/react-query'
import { getOrderStatus } from '../services/api'

export function useOrderStatus(orderId, barId, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['order-status', orderId, barId],
    queryFn: () => getOrderStatus(orderId, barId),
    enabled: enabled && !!orderId && !!barId,
    refetchInterval: 3_000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  })
}

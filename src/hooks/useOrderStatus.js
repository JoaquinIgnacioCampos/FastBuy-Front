import { useQuery } from '@tanstack/react-query'
import { getOrderStatus } from '../services/api'

export function useOrderStatus(orderId, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['order-status', orderId],
    queryFn: () => getOrderStatus(orderId),
    enabled: enabled && !!orderId,
    refetchInterval: 3_000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  })
}

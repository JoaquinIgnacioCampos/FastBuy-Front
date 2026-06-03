import { useQuery } from '@tanstack/react-query'
import { getDeliveredOrders } from '../services/api'

export function useDeliveredOrders(barId) {
  return useQuery({
    queryKey: ['delivered-orders', barId],
    queryFn: () => getDeliveredOrders(barId),
    enabled: !!barId,
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
  })
}

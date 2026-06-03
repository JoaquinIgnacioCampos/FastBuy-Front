import { useQuery } from '@tanstack/react-query'
import { getOrders } from '../services/api'

export function useOrders(barId) {
  return useQuery({
    queryKey: ['orders', barId],
    queryFn: () => getOrders(barId),
    enabled: !!barId,
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
  })
}

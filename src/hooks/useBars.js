import { useQuery } from '@tanstack/react-query'
import { getBars } from '../services'

export function useBars() {
  return useQuery({
    queryKey: ['bars'],
    queryFn: getBars,
    staleTime: 5 * 60_000,
  })
}

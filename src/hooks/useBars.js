import { useQuery } from '@tanstack/react-query'
import { getBars, getBarsForEvent } from '../services/api'

export function useBars(eventId) {
  return useQuery({
    queryKey: ['bars', eventId ?? 'all'],
    queryFn: () => eventId ? getBarsForEvent(eventId) : getBars(),
    staleTime: 5 * 60_000,
  })
}

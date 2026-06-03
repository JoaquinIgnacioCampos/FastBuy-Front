import { useQuery } from '@tanstack/react-query'
import { getEvents } from '../services/api'

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
    // Events change slowly; revalidate every 60s when the user is on the welcome screen.
    refetchInterval: 60_000,
    staleTime: 30_000,
  })
}

export function classifyEvent(event, now = Date.now()) {
  const start = new Date(event.startsAt).getTime()
  const end   = new Date(event.endsAt).getTime()
  if (now < start) return 'upcoming'
  if (now > end)   return 'finished'
  return 'live'
}

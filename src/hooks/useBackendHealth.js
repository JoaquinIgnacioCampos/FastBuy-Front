import { useQuery } from '@tanstack/react-query'

async function checkHealth() {
  const r = await fetch('/api/events')
  if (!r.ok) throw new Error(r.status)
  return true
}

export function useBackendHealth() {
  const { status, isFetching, failureCount } = useQuery({
    queryKey: ['backend-health'],
    queryFn: checkHealth,
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
    retry: 1,
    staleTime: 0,
  })

  if (status === 'success') return 'up'
  // A background refetch after a prior failure — don't flip straight to 'down'
  if (status === 'error' && isFetching) return 'retrying'
  if (status === 'error') return 'down'
  // 'pending' (first fetch in flight)
  return isFetching ? 'retrying' : 'up'
}

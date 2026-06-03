import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMenu } from '../services/api'

export function useMenu(eventId) {
  return useQuery({
    queryKey: ['menu', eventId ?? 'all'],
    queryFn: () => getMenu(eventId),
    staleTime: 60_000,
  })
}

/**
 * Returns a Map<productId, product> derived from the full product catalog
 * (all products across all bars). Used by bartender and order screens that
 * need to resolve item `pid` to display fields without an event context.
 */
export function useProductMap() {
  const { data } = useMenu()
  return useMemo(() => {
    const map = new Map()
    for (const p of data ?? []) map.set(p.id, p)
    return map
  }, [data])
}

export function resolveProduct(map, pid) {
  return map.get(pid) ?? { id: pid, name: pid, emoji: '📦', image: '📦', price: 0 }
}

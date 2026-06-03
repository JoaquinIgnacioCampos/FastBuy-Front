import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMenu } from '../services'

export function useMenu(barId) {
  return useQuery({
    queryKey: ['menu', barId ?? 'all'],
    queryFn: () => getMenu(barId),
    staleTime: 60_000,
  })
}

/**
 * Returns a Map<productId, product> derived from the customer-facing menu (union
 * across all bars). Used by screens that need to resolve order item `pid` to
 * display fields (name/emoji/image) — QR, Bartender, Order, Queue, Payment.
 */
export function useProductMap() {
  const { data } = useMenu()
  return useMemo(() => {
    const map = new Map()
    for (const p of data ?? []) map.set(p.id, p)
    return map
  }, [data])
}

/** Convenience: resolves a product by id from the cached menu, with a fallback. */
export function resolveProduct(map, pid) {
  return map.get(pid) ?? { id: pid, name: pid, emoji: '📦', image: '📦', price: 0 }
}

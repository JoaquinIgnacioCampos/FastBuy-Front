const BASE = import.meta.env.VITE_API_URL

export async function getOrders(barId) {
  const r = await fetch(`${BASE}/orders?bar=${barId}`)
  return r.json()
}

export async function advanceOrder(id) {
  await fetch(`${BASE}/orders/${id}/advance`, { method: 'POST' })
}

export async function markDelivered(id) {
  await fetch(`${BASE}/orders/${id}/deliver`, { method: 'POST' })
}

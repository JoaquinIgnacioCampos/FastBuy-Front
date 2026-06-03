const BASE = import.meta.env.VITE_API_URL

async function req(url, opts) {
  const r = await fetch(url, opts)
  if (!r.ok) throw new Error(`${r.status}`)
  return r
}

// ── Orders ───────────────────────────────────────────────────────────────────

export async function getOrders(barId) {
  const r = await req(`${BASE}/orders?bar=${barId}`)
  return r.json()
}

export async function advanceOrder(id) {
  const r = await req(`${BASE}/orders/${id}/advance`, { method: 'POST' })
  return r.json()
}

export async function markDelivered(id) {
  const r = await req(`${BASE}/orders/${id}/deliver`, { method: 'POST' })
  return r.json()
}

export async function createOrder(items, bar, total) {
  const r = await req(`${BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, bar, total }),
  })
  return r.json()
}

// Polls the bar's active orders and returns the one matching orderId, or null if delivered/not found.
export async function getOrderStatus(orderId, barId) {
  const r = await req(`${BASE}/orders?bar=${barId}`)
  const orders = await r.json()
  return orders.find(o => o.id === orderId) ?? null
}

// ── Static catalog ───────────────────────────────────────────────────────────

export async function getBars() {
  const r = await req(`${BASE}/bars`)
  return r.json()
}

export async function getCategories() {
  const r = await req(`${BASE}/categories`)
  return r.json()
}

export async function getMenu(barId) {
  const path = barId ? `${BASE}/bars/${barId}/menu` : `${BASE}/products`
  const r = await req(path)
  return r.json()
}

// ── Events ───────────────────────────────────────────────────────────────────

export async function getEvents() {
  const r = await req(`${BASE}/events`)
  return r.json()
}

// ── Payments ─────────────────────────────────────────────────────────────────

export async function createPaymentPreference(orderId) {
  const r = await req(`${BASE}/payments/preference`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  })
  return r.json()
}

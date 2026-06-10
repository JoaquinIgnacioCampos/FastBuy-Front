const BASE = '/api'

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

export async function getDeliveredOrders(barId) {
  const r = await req(`${BASE}/orders?bar=${barId}&status=delivered`)
  return r.json()
}

export async function advanceOrder(id, bartenderId) {
  const r = await req(`${BASE}/orders/${id}/advance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bartenderId: bartenderId ?? null }),
  })
  return r.json()
}

export async function releaseOrder(id) {
  const r = await req(`${BASE}/orders/${id}/release`, { method: 'POST' })
  return r.json()
}

export async function activateOrder(id) {
  const clean = String(id).startsWith('FB') ? String(id).slice(2) : String(id)
  const r = await req(`${BASE}/orders/${clean}/activate`, { method: 'POST' })
  return r.json()
}

export async function cancelOrder(id) {
  const clean = String(id).startsWith('FB') ? String(id).slice(2) : String(id)
  await req(`${BASE}/orders/${clean}`, { method: 'DELETE' })
}

export async function markDelivered(id) {
  const r = await req(`${BASE}/orders/${id}/deliver`, { method: 'POST' })
  return r.json()
}

export async function createOrder(items, bar, total, eventId) {
  const r = await req(`${BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, bar, total, eventId }),
  })
  return r.json()
}

export async function getOrderStatus(orderId, barId) {
  const r = await req(`${BASE}/orders?bar=${barId}`)
  const orders = await r.json()
  return orders.find(o => o.id === orderId) ?? null
}

// ── Catalog ──────────────────────────────────────────────────────────────────

export async function getBars() {
  const r = await req(`${BASE}/bars`)
  return r.json()
}

export async function getBarsForEvent(eventId) {
  const r = await req(`${BASE}/events/${eventId}/bars`)
  return r.json()
}

export async function getCategories() {
  const r = await req(`${BASE}/categories`)
  return r.json()
}

export async function getMenu(eventId) {
  const path = eventId
    ? `${BASE}/events/${eventId}/menu`
    : `${BASE}/products`
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

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function loginBartender(username, password) {
  const r = await req(`${BASE}/auth/bartender/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  return r.json()
}

// ── Payment accounts ─────────────────────────────────────────────────────────

export async function getPaymentAccount(eventId) {
  const r = await req(`${BASE}/events/${eventId}/payment-account`)
  return r.json()
}

export async function linkPaymentAccount(eventId, accessToken) {
  const r = await req(`${BASE}/events/${eventId}/payment-account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken }),
  })
  return r.json()
}

export async function unlinkPaymentAccount(eventId) {
  await req(`${BASE}/events/${eventId}/payment-account`, { method: 'DELETE' })
}

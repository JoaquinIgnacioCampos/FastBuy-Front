const BASE = '/api'

async function req(url, opts) {
  const r = await fetch(url, opts)
  if (!r.ok) throw new Error(`${r.status}`)
  return r
}

// Bearer token from the stored bartender session, sent on gated write endpoints.
function bartenderAuthHeaders() {
  try {
    const token = JSON.parse(localStorage.getItem('fb_bartender_session'))?.token
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
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
    headers: { 'Content-Type': 'application/json', ...bartenderAuthHeaders() },
    body: JSON.stringify({ bartenderId: bartenderId ?? null }),
  })
  return r.json()
}

export async function releaseOrder(id) {
  const r = await req(`${BASE}/orders/${id}/release`, { method: 'POST', headers: bartenderAuthHeaders() })
  return r.json()
}


export async function markDelivered(id) {
  const r = await req(`${BASE}/orders/${id}/deliver`, { method: 'POST', headers: bartenderAuthHeaders() })
  return r.json()
}

export async function cancelOrder(id) {
  const r = await req(`${BASE}/orders/${id}/cancel`, { method: 'POST', headers: bartenderAuthHeaders() })
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

export async function getOrderStatus(orderId) {
  // Look up the single order in any state (queue/preparing/ready/delivered/cancelled).
  // 404 means it no longer exists at all.
  const r = await fetch(`${BASE}/orders/${orderId}`)
  if (r.status === 404) return null
  if (!r.ok) throw new Error(`${r.status}`)
  return r.json()
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

export async function createPaymentPreference(items, total, eventId) {
  const r = await req(`${BASE}/payments/preference`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, total, eventId }),
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

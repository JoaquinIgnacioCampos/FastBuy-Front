// ── Demo seed data ───────────────────────────────────────────────────────────
// IDs are kept in sync with FastBuy-Back/.../data.sql so screens that resolve a
// product by pid work identically whether the app runs against the demo service
// or the real backend.

const DEMO_BARS = [
  { id: 'north',  label: 'Barra Norte',   location: 'Sector Norte · Entrada Principal' },
  { id: 'center', label: 'Barra Central', location: 'Centro del Predio · cerca del escenario' },
  { id: 'south',  label: 'Barra Sur',     location: 'Sector Sur · Zona VIP' },
]

const DEMO_CATEGORIES = [
  { id: 'drink', label: 'Bebidas', emoji: '🍺' },
  { id: 'snack', label: 'Snacks',  emoji: '🍟' },
  { id: 'food',  label: 'Comida',  emoji: '🌭' },
  { id: 'all',   label: 'Todos',   emoji: '🍽️' },
]

const DEMO_PRODUCTS = [
  { id: 'p1',  name: 'Carlsberg 500ml',       category: 'drink', price: 8000,  stock: 50,  image: '🍺', emoji: '🍺', subtitle: 'Lata · 500 ml' },
  { id: 'p2',  name: 'Heineken 500ml',        category: 'drink', price: 8500,  stock: 45,  image: '🍻', emoji: '🍻', subtitle: 'Lata · 500 ml' },
  { id: 'p3',  name: 'Corona Extra 355ml',    category: 'drink', price: 7000,  stock: 60,  image: '🌴', emoji: '🌴', subtitle: 'Porrón · 355 ml' },
  { id: 'p4',  name: 'Stella Artois 500ml',   category: 'drink', price: 9000,  stock: 40,  image: '🌟', emoji: '🌟', subtitle: 'Pinta · 500 ml' },
  { id: 'p5',  name: 'Agua mineral 500ml',    category: 'drink', price: 2500,  stock: 100, image: '💧', emoji: '💧', subtitle: 'Botella · 500 ml' },
  { id: 'p6',  name: 'Coca-Cola 500ml',       category: 'drink', price: 3000,  stock: 80,  image: '🥤', emoji: '🥤', subtitle: 'Lata · 500 ml' },
  { id: 'p7',  name: 'Sprite 500ml',          category: 'drink', price: 3000,  stock: 75,  image: '🍋', emoji: '🍋', subtitle: 'Lata · 500 ml' },
  { id: 'p8',  name: 'Nachos con salsa',      category: 'snack', price: 5000,  stock: 30,  image: '🌮', emoji: '🌮', subtitle: 'Porción individual' },
  { id: 'p9',  name: 'Papas fritas',          category: 'snack', price: 4500,  stock: 35,  image: '🍟', emoji: '🍟', subtitle: 'Porción individual' },
  { id: 'p10', name: 'Mini pizza',            category: 'food',  price: 7500,  stock: 20,  image: '🍕', emoji: '🍕', subtitle: 'Muzzarella · 4 porciones' },
  { id: 'p11', name: 'Chorizo a la parrilla', category: 'food',  price: 9000,  stock: 15,  image: '🌭', emoji: '🌭', subtitle: 'Pan + chimichurri' },
  { id: 'p12', name: 'Panchos con cheddar',   category: 'food',  price: 6500,  stock: 25,  image: '🧀', emoji: '🧀', subtitle: 'Doble cheddar' },
  { id: 'p13', name: 'Empanadas x3',          category: 'food',  price: 8000,  stock: 30,  image: '🥟', emoji: '🥟', subtitle: 'Surtido · 3 unidades' },
  { id: 'p14', name: 'Champagne Premium',     category: 'drink', price: 18000, stock: 10,  image: '🍾', emoji: '🍾', subtitle: 'Copa · sólo VIP' },
  { id: 'p15', name: 'Whisky Premium',        category: 'drink', price: 15000, stock: 12,  image: '🥃', emoji: '🥃', subtitle: 'Vaso · sólo VIP' },
]

const DEMO_BAR_PRODUCTS = {
  north:  ['p1', 'p2', 'p3', 'p5', 'p6', 'p7', 'p8', 'p9', 'p11', 'p12', 'p13'],
  center: ['p1', 'p2', 'p4', 'p5', 'p6', 'p8', 'p9', 'p10', 'p12', 'p13'],
  south:  ['p2', 'p4', 'p5', 'p6', 'p10', 'p13', 'p14', 'p15'],
}

let nextId = 100

let orders = [
  { id: 'FB1', total: 16500, items: [{ pid: 'p1', q: 2 }, { pid: 'p11', q: 1 }],            status: 'queue',     bar: 'north',  time: '2:14' },
  { id: 'FB2', total: 9000,  items: [{ pid: 'p4', q: 1 }],                                  status: 'preparing', bar: 'north',  time: '2:22' },
  { id: 'FB3', total: 5000,  items: [{ pid: 'p8', q: 1 }],                                  status: 'ready',     bar: 'center', time: '2:30' },
  { id: 'FB4', total: 12500, items: [{ pid: 'p2', q: 1 }, { pid: 'p10', q: 1 }],            status: 'queue',     bar: 'center', time: '2:45' },
  { id: 'FB5', total: 7500,  items: [{ pid: 'p9', q: 1 }, { pid: 'p6', q: 1 }],             status: 'preparing', bar: 'center', time: '2:50' },
  { id: 'FB6', total: 36000, items: [{ pid: 'p14', q: 2 }],                                 status: 'queue',     bar: 'south',  time: '2:18' },
  { id: 'FB7', total: 23500, items: [{ pid: 'p15', q: 1 }, { pid: 'p4', q: 1 }],            status: 'preparing', bar: 'south',  time: '2:35' },
  { id: 'FB8', total: 18000, items: [{ pid: 'p14', q: 1 }],                                 status: 'ready',     bar: 'south',  time: '2:55' },
]

// ── Order operations ─────────────────────────────────────────────────────────

const NEXT_STATUS = { queue: 'preparing', preparing: 'ready' }

export function getOrders(barId) {
  return orders.filter(o => o.bar === barId && o.status !== 'delivered')
}

export function advanceOrder(id) {
  let result
  orders = orders.map(o => {
    if (o.id !== id) return o
    const next = NEXT_STATUS[o.status]
    if (!next) return o
    result = { ...o, status: next }
    return result
  })
  return result
}

export function markDelivered(id) {
  let result
  orders = orders.map(o => {
    if (o.id !== id) return o
    result = { ...o, status: 'delivered' }
    return result
  })
  return result
}

export function createOrder(items, bar, total) {
  const assignedBar = bar || pickLeastLoadedBar(items)
  const id = 'FB' + (nextId++)
  const now = new Date()
  const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
  const order = { id, total, items, status: 'queue', bar: assignedBar, time }
  orders.push(order)
  return order
}

// Two-phase assignment matching backend OrdersService.pickLeastLoadedBar:
// strict (bar serves all items) wins; fallback is the bar with the most matches.
function pickLeastLoadedBar(items) {
  const wanted = new Set(items.map(it => it.pid))
  const loadFor = (barId) => orders
    .filter(o => o.bar === barId && (o.status === 'queue' || o.status === 'preparing'))
    .reduce((s, o) => s + o.items.reduce((ss, it) => ss + it.q, 0), 0)

  let strictBest = null, strictBestLoad = Infinity
  let lenientBest = null, lenientBestMatches = -1, lenientBestLoad = Infinity

  for (const bar of DEMO_BARS) {
    const menu = new Set(DEMO_BAR_PRODUCTS[bar.id] ?? [])
    let matches = 0
    for (const pid of wanted) if (menu.has(pid)) matches++
    const load = loadFor(bar.id)

    if (matches === wanted.size && load < strictBestLoad) {
      strictBestLoad = load
      strictBest = bar.id
    }
    if (matches > lenientBestMatches
        || (matches === lenientBestMatches && load < lenientBestLoad)) {
      lenientBestMatches = matches
      lenientBestLoad = load
      lenientBest = bar.id
    }
  }
  return strictBest ?? lenientBest
}

export function getOrderStatus(orderId) {
  return orders.find(o => o.id === orderId) ?? null
}

// ── Static data endpoints ────────────────────────────────────────────────────

export function getBars() {
  return DEMO_BARS
}

export function getCategories() {
  return DEMO_CATEGORIES
}

export function getMenu(barId) {
  if (!barId) return DEMO_PRODUCTS
  const ids = DEMO_BAR_PRODUCTS[barId]
  if (!ids) return []
  const set = new Set(ids)
  return DEMO_PRODUCTS.filter(p => set.has(p.id))
}

// ── Events (added in Phase 2) ────────────────────────────────────────────────

const hoursFromNow = (h) => new Date(Date.now() + h * 3600_000).toISOString()
const daysFromNow  = (d) => new Date(Date.now() + d * 86_400_000).toISOString()

const DEMO_EVENTS = [
  { id: 'e3',  name: 'Quilmes Rock',                venue: 'Tecnópolis · Buenos Aires', hours: '17:00 - 23:00', startsAt: hoursFromNow(-10), endsAt: hoursFromNow(-2) },
  { id: 'e1',  name: 'Festival Eclipse',            venue: 'Costanera Sur · CABA',      hours: '21:00 - 04:00', startsAt: hoursFromNow(-6),  endsAt: hoursFromNow(12) },
  { id: 'e1b', name: 'Festival Cumbiero',           venue: 'Parque Sarmiento · CABA',   hours: '20:00 - 03:00', startsAt: hoursFromNow(-3),  endsAt: hoursFromNow(9)  },
  { id: 'e1c', name: 'Trasnoche Indie',             venue: 'Club Niceto · Palermo',     hours: '22:00 - 06:00', startsAt: hoursFromNow(-2),  endsAt: hoursFromNow(8)  },
  { id: 'e2',  name: 'Cosquín Rock',                venue: 'Cosquín · Córdoba',         hours: '18:00 - 02:00', startsAt: daysFromNow(1),    endsAt: daysFromNow(2)   },
  { id: 'e5',  name: 'Lollapalooza Argentina 2027', venue: 'Hipódromo de Palermo',      hours: '14:00 - 23:00', startsAt: daysFromNow(300),  endsAt: daysFromNow(303) },
]

export function getEvents() {
  const cutoff = Date.now() - 6 * 3600_000
  return DEMO_EVENTS
    .filter(e => new Date(e.endsAt).getTime() >= cutoff)
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
}

// ── Payments ─────────────────────────────────────────────────────────────────

// Mirror of the backend's simulated-fallback path. Returns an initPoint that
// loops back to the frontend with status=approved so the App.jsx redirect
// handler exercises the same code path against demo and backend modes.
export function createPaymentPreference(orderId) {
  const origin = typeof window !== 'undefined' && window.location
    ? window.location.origin
    : ''
  const initPoint = `${origin}/?status=approved&external_reference=${encodeURIComponent(orderId)}`
  return { initPoint, simulated: true }
}

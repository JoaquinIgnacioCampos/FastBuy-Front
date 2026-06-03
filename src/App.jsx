import { useState, useEffect } from 'react'
import './App.css'

import WelcomeScreen    from './screens/WelcomeScreen'
import MenuScreen       from './screens/MenuScreen'
import OrderScreen      from './screens/OrderScreen'
import PaymentScreen    from './screens/PaymentScreen'
import QueueScreen      from './screens/QueueScreen'
import QRScreen         from './screens/QRScreen'
import BartenderScreen  from './screens/BartenderScreen'
import BarSelectScreen  from './screens/BarSelectScreen'
import { useBars } from './hooks/useBars.js'
import { useProductMap, resolveProduct } from './hooks/useMenu.js'
import { useOrderStatus } from './hooks/useOrderStatus.js'
import { IS_DEMO, createOrder, createPaymentPreference } from './services'

// Persisted across the MP redirect-back hop. localStorage is fine here — the
// payload is tiny, scoped to a single in-flight order, and gets cleared as soon
// as the app resumes after the redirect.
const PENDING_KEY = 'fb_pending_payment'
function savePending(payload) {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(payload)) } catch {}
}
function loadPending() {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
function clearPending() {
  try { localStorage.removeItem(PENDING_KEY) } catch {}
}

// Read the MP redirect-back params synchronously at module init so the initial
// render lands on the right screen instead of flashing the welcome screen and
// then jumping. Returns null if not coming back from a payment.
function readReturnFromPayment() {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const status = params.get('status')
  const externalRef = params.get('external_reference')
  if (!status || !externalRef) return null
  const pending = loadPending()
  return { status, externalRef, pending }
}

function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2" x2="12" y2="4"/>
      <line x1="12" y1="20" x2="12" y2="22"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="2" y1="12" x2="4" y2="12"/>
      <line x1="20" y1="12" x2="22" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

// ── Nav bar ───────────────────────────────────────────────────
function NavBar({ title, onBack, right, theme, onToggleTheme }) {
  return (
    <div className="nav-bar">
      {onBack ? (
        <button className="back-btn" onClick={onBack}>‹</button>
      ) : (
        <div style={{ width: 32 }} />
      )}
      <h1>{title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {right}
        <button className="theme-btn" onClick={onToggleTheme} aria-label="Cambiar tema">
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </div>
  )
}

// ── Screen titles per state ───────────────────────────────────
const TITLES = {
  welcome:          null,
  menu:             'Menú',
  order:            'Tu pedido',
  payment:          'Mercado Pago',
  paying:           'Procesando pago',
  rejected:         'Pago rechazado',
  queue:            'Cola virtual',
  preparing:        'Cola virtual',
  ready:            'Cola virtual',
  offline:          'Sin conexión',
  qr:               'Retirar pedido',
  confirmed:        'Pedido retirado',
  'bartender-bar':     'Seleccionar Barra',
  bartender:           '—',
  'bartender-scanner': 'Escanear QR',
}

// ── Screens that show a back button ──────────────────────────
const BACK_TARGETS = {
  order:    'menu',
  payment:  'order',
  rejected: 'order',
}

export default function App() {
  // Initial state: synchronously resume from a MP redirect-back if applicable.
  // Doing this here (rather than in a useEffect) means the first render lands
  // on the correct screen — no welcome-flash before the redirect handler kicks
  // in.
  const initialReturn = useState(() => readReturnFromPayment())[0]

  const [screen, setScreen] = useState(() => {
    if (initialReturn?.status === 'approved' && initialReturn.pending?.order?.id === initialReturn.externalRef) {
      return 'queue'
    }
    if (initialReturn?.status === 'rejected' || initialReturn?.status === 'failure') {
      return 'rejected'
    }
    return 'welcome'
  })
  const [cart, setCart] = useState(() =>
    initialReturn?.pending?.cart ?? {}
  )
  const [theme, setTheme]         = useState('dark')
  const [assignedBar, setAssignedBar] = useState(() =>
    initialReturn?.pending?.bar ?? null
  )
  const [bartenderBar, setBartenderBar] = useState(null)
  const [activeOrder, setActiveOrder] = useState(() =>
    initialReturn?.status === 'approved' ? (initialReturn.pending?.order ?? null) : null
  )
  const [selectedEvent, setSelectedEvent] = useState(() =>
    initialReturn?.pending?.event ?? null
  )
  const { data: bars = [] } = useBars()
  const productMap = useProductMap()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // After the initial render restores state synchronously from the MP
  // redirect-back, strip the params and clear the pending payload so a manual
  // reload doesn't re-trigger the resume.
  useEffect(() => {
    if (!initialReturn) return
    clearPending()
    window.history.replaceState({}, '', window.location.pathname)
  }, [initialReturn])

  function toggleTheme() { setTheme(t => t === 'dark' ? 'light' : 'dark') }

  async function notifyOrderReady() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    const opts = { body: `Acercate a ${assignedBar?.label ?? 'la barra'} y mostrá tu QR.`, icon: '/favicon.svg', vibrate: [200, 100, 200] }
    try {
      const reg = await navigator.serviceWorker.ready
      reg.showNotification('FastBuy · Tu pedido está listo', opts)
    } catch {
      try { new Notification('FastBuy · Tu pedido está listo', opts) } catch {}
    }
  }

  // Demo only: drive the customer flow forward on a timer (no real backend
  // polling). Each phase advances after a short delay so the user can see the
  // queue → preparing → ready → delivered progression end-to-end.
  useEffect(() => {
    if (!IS_DEMO) return
    if (screen === 'queue')     { const t = setTimeout(() => setScreen('preparing'), 4000); return () => clearTimeout(t) }
    if (screen === 'preparing') { const t = setTimeout(() => setScreen('ready'),     5000); return () => clearTimeout(t) }
    if (screen === 'ready')     { notifyOrderReady() }
    if (screen === 'qr')        { const t = setTimeout(() => setScreen('confirmed'), 6000); return () => clearTimeout(t) }
  }, [screen])

  // Backend: poll active order status while customer is on queue/preparing/qr.
  // Drives queue → preparing → ready (the customer sees the bartender's action)
  // and qr → confirmed (the customer sees their pickup confirmed).
  const pollEnabled =
    !IS_DEMO &&
    !!activeOrder &&
    (screen === 'queue' || screen === 'preparing' || screen === 'qr')
  const { data: liveOrder } = useOrderStatus(
    activeOrder?.id,
    activeOrder?.bar,
    { enabled: pollEnabled }
  )
  useEffect(() => {
    if (!pollEnabled || liveOrder === undefined) return
    // `null` = the order is no longer in the bar's active list (queue/preparing/
    // ready). The only way out of that list is the bartender confirming
    // delivery, so on the QR screen we treat that as the pickup confirmation.
    if (liveOrder === null) {
      if (screen === 'qr') setScreen('confirmed')
      return
    }
    const status = liveOrder.status
    if (status === 'ready' && (screen === 'queue' || screen === 'preparing')) {
      notifyOrderReady()
      setScreen('ready')
    } else if (status === 'preparing' && screen === 'queue') {
      setScreen('preparing')
    }
  }, [liveOrder, screen, pollEnabled])

  // Payment.
  //
  // 1. POST /orders — creates the order in QUEUE (server picks the bar).
  // 2. POST /payments/preference — asks the backend for an MP Checkout Pro
  //    preference URL.
  // 3a. Simulated preference (no MP_ACCESS_TOKEN configured): the backend
  //     returns `simulated: true`. We skip the redirect entirely and slide
  //     into the queue screen in-place — no full page reload, no welcome
  //     flash. Pending state is cleared since there's no return hop.
  // 3b. Real MP preference: stash pending state in localStorage and navigate
  //     the browser to `initPoint`. The redirect-back lands at `/` with
  //     `?status=...&external_reference=...`; the synchronous return-handler
  //     reads them on the next boot and resumes the flow.
  useEffect(() => {
    if (screen !== 'paying') return

    let cancelled = false
    const t = setTimeout(async () => {
      if (cancelled) return
      const items = Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([pid, qty]) => ({ pid, q: qty }))
      const total = items.reduce(
        (s, it) => s + resolveProduct(productMap, it.pid).price * it.q,
        0
      )
      try {
        const order = await createOrder(items, undefined, total)
        if (cancelled) return
        const bar = bars.find(b => b.id === order.bar) ?? { id: order.bar, label: order.bar, location: '' }

        const pref = await createPaymentPreference(order.id)
        if (cancelled) return

        if (pref?.simulated || !pref?.initPoint) {
          // No real MP hop — do it all in-place.
          clearPending()
          setAssignedBar(bar)
          setActiveOrder(order)
          setScreen('queue')
          return
        }

        // Real MP flow: stash state, redirect to MP. We'll resume on return
        // via the URL params + readReturnFromPayment().
        savePending({ order, bar, cart, event: selectedEvent })
        window.location.href = pref.initPoint
      } catch {
        clearPending()
        if (!cancelled) setScreen('rejected')
      }
    }, IS_DEMO ? 1200 : 600)
    return () => { cancelled = true; clearTimeout(t) }
  }, [screen])

  function go(s) { setScreen(s) }

  const title = TITLES[screen]
  const backTarget = BACK_TARGETS[screen]

  function resetOrder() {
    setCart({})
    setAssignedBar(null)
    setActiveOrder(null)
    go('menu')
  }

  const isBartender = screen === 'bartender' || screen === 'bartender-scanner' || screen === 'bartender-bar'
  const navTitle = screen === 'bartender' ? (bartenderBar?.label ?? 'Barra') : title

  return (
    <div className="phone">
      {/* Mode badge — remove once backend integration is confirmed working */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
        background: IS_DEMO ? '#b45309' : '#15803d',
        color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        textAlign: 'center', padding: '2px 0', pointerEvents: 'none',
      }}>
        {IS_DEMO ? 'MODO DEMO  —  los datos son locales a esta pestaña' : 'MODO BACKEND  —  conectado al servidor'}
      </div>

      {navTitle && (
        <NavBar
          title={navTitle}
          onBack={backTarget ? () => go(backTarget) : null}
          theme={theme}
          onToggleTheme={toggleTheme}
          right={
            isBartender ? (
              <button onClick={() => { setBartenderBar(null); go('welcome') }} style={{ fontSize: 12, color: 'var(--text-mute)', padding: '4px 8px' }}>← Salir</button>
            ) : null
          }
        />
      )}

      <div
        key={screen}
        className="screen-fade"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
      {screen === 'welcome' && (
        <button
          className="theme-btn"
          onClick={toggleTheme}
          aria-label="Cambiar tema"
          style={{ position: 'absolute', top: 14, right: 14, zIndex: 20, width: 32, height: 32 }}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      )}

      {screen === 'welcome' && (
        <WelcomeScreen
          onLogin={(event) => { setSelectedEvent(event); go('menu') }}
          onBartender={() => go('bartender-bar')}
        />
      )}

      {screen === 'menu' && (
        <MenuScreen
          cart={cart}
          onCartChange={setCart}
          onCheckout={() => go('order')}
          event={selectedEvent}
        />
      )}

      {screen === 'order' && (
        <OrderScreen
          cart={cart}
          onPay={() => go('payment')}
          onBack={() => go('menu')}
        />
      )}

      {(screen === 'payment' || screen === 'paying' || screen === 'rejected') && (
        <PaymentScreen
          cart={cart}
          phase={screen}
          event={selectedEvent}
          onSuccess={() => go('paying')}
          onRetry={() => go('payment')}
          onBack={() => go('order')}
        />
      )}

      {(screen === 'queue' || screen === 'preparing' || screen === 'ready' || screen === 'offline') && (
        <QueueScreen
          phase={screen}
          cart={cart}
          bar={assignedBar}
          activeOrder={activeOrder}
          offline={screen === 'offline'}
          onReady={() => go('qr')}
          onOfflineRetry={() => go('queue')}
        />
      )}

      {(screen === 'qr' || screen === 'confirmed') && (
        <QRScreen
          cart={cart}
          phase={screen}
          bar={assignedBar}
          activeOrder={activeOrder}
          event={selectedEvent}
          onConfirmed={() => {
            if (screen === 'confirmed') {
              resetOrder()
            } else {
              go('confirmed')
            }
          }}
        />
      )}

      {screen === 'bartender-bar' && (
        <BarSelectScreen
          onSelect={bar => { setBartenderBar(bar); go('bartender') }}
        />
      )}

      {(screen === 'bartender' || screen === 'bartender-scanner') && (
        <BartenderScreen
          onBack={() => go('welcome')}
          scannerPhase={screen === 'bartender-scanner'}
          onScannerOpen={() => go('bartender-scanner')}
          onScannerClose={() => go('bartender')}
          bartenderBar={bartenderBar}
        />
      )}
      </div>
    </div>
  )
}

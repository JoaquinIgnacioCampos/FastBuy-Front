import { useState, useEffect, useRef } from 'react'
import './App.css'

import LoginScreen        from './screens/LoginScreen'
import WelcomeScreen      from './screens/WelcomeScreen'
import MenuScreen         from './screens/MenuScreen'
import OrderScreen        from './screens/OrderScreen'
import PaymentScreen      from './screens/PaymentScreen'
import QueueScreen        from './screens/QueueScreen'
import QRScreen           from './screens/QRScreen'
import BartenderScreen    from './screens/BartenderScreen'
import PaymentSetupScreen from './screens/PaymentSetupScreen'
import { useBars }                    from './hooks/useBars.js'
import { useProductMap, resolveProduct } from './hooks/useMenu.js'
import { useOrderStatus }             from './hooks/useOrderStatus.js'
import { useBackendHealth }           from './hooks/useBackendHealth.js'
import { createOrder, createPaymentPreference } from './services/api'
import { useScreen } from './hooks/useScreen.js'
import { loadPersisted, savePersisted, clearPersisted,
         PERSIST_SCREEN, PERSIST_CART, PERSIST_EVENT, PERSIST_ORDER, PERSIST_BAR } from './lib/persist.js'
import { TITLES, BACK_TARGETS, barIdFromPath } from './lib/screens.js'

// ── Constants ─────────────────────────────────────────────────────────────────

const PENDING_KEY          = 'fb_pending_payment'
const BARTENDER_SESSION_KEY = 'fb_bartender_session'
const BARTENDER_BAR_KEY     = 'fb_bartender_bar'

// ── localStorage helpers ──────────────────────────────────────────────────────

function savePending(payload) {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(payload)) } catch {}
}
function loadPending() {
  try { const raw = localStorage.getItem(PENDING_KEY); return raw ? JSON.parse(raw) : null } catch { return null }
}
function clearPending() {
  try { localStorage.removeItem(PENDING_KEY) } catch {}
}
function saveBartenderSession(session) {
  try { localStorage.setItem(BARTENDER_SESSION_KEY, JSON.stringify(session)) } catch {}
}
function clearBartenderSession() {
  try { localStorage.removeItem(BARTENDER_SESSION_KEY) } catch {}
}

function readReturnFromPayment() {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const status = params.get('status')
  const externalRef = params.get('external_reference')
  if (!status || !externalRef) return null
  const pending = loadPending()
  return { status, externalRef, pending }
}

// ── UI components ─────────────────────────────────────────────────────────────

function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
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

function StatusBar({ status }) {
  const labels = { up: 'Conectado', retrying: 'Reintentando…', down: 'Sin conexión' }
  return (
    <div className={`status-bar ${status}`}>
      <span className="status-dot" />
      {labels[status] ?? labels.up}
    </div>
  )
}

function NavBar({ title, onBack, right, theme, onToggleTheme, variant }) {
  return (
    <div className={`nav-bar${variant === 'bartender' ? ' nav-bar--bartender' : ''}`}>
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

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const initialReturn = useState(() => readReturnFromPayment())[0]

  // Ref lets useScreen.go() resolve the current bartender bar id for /staff/:barId
  // without a render cycle (bartenderBar is defined just below).
  const bartenderBarRef = useRef(null)
  const { screen, go, pathname } = useScreen({
    initialReturn,
    resolveBarId: () => bartenderBarRef.current?.id,
  })

  const [cart, setCart]               = useState(() => loadPersisted(PERSIST_CART) ?? {})
  const [theme, setTheme]             = useState('dark')
  const [assignedBar, setAssignedBar] = useState(() => loadPersisted(PERSIST_BAR))
  const [bartenderBar, setBartenderBar] = useState(() => {
    try {
      // Prefer the directly-persisted bartenderBar object (covers both login and dev picker)
      const bar = JSON.parse(localStorage.getItem(BARTENDER_BAR_KEY) || 'null')
      if (bar) {
        const urlBarId = barIdFromPath(pathname)
        if (!urlBarId || urlBarId === bar.id) return bar
      }
      // Fall back to session key (written by handleBartenderLogin)
      const s = JSON.parse(localStorage.getItem(BARTENDER_SESSION_KEY) || 'null')
      if (s) {
        const urlBarId = barIdFromPath(pathname)
        if (!urlBarId || urlBarId === s.barId) {
          return { id: s.barId, label: s.barLabel, location: '', username: s.username, eventId: s.eventId }
        }
      }
    } catch {}
    return null
  })
  const [activeOrder, setActiveOrder] = useState(() => loadPersisted(PERSIST_ORDER))
  const [selectedEvent, setSelectedEvent] = useState(() => loadPersisted(PERSIST_EVENT))

  const { data: bars = [] } = useBars()
  const productMap = useProductMap()
  const healthStatus = useBackendHealth()

  // Persist state to sessionStorage so refresh restores the current view
  useEffect(() => { savePersisted(PERSIST_CART, cart) }, [cart])
  useEffect(() => { selectedEvent ? savePersisted(PERSIST_EVENT, selectedEvent) : clearPersisted(PERSIST_EVENT) }, [selectedEvent])
  useEffect(() => { activeOrder   ? savePersisted(PERSIST_ORDER, activeOrder)   : clearPersisted(PERSIST_ORDER) }, [activeOrder])
  useEffect(() => { assignedBar   ? savePersisted(PERSIST_BAR, assignedBar)     : clearPersisted(PERSIST_BAR) }, [assignedBar])
  useEffect(() => {
    bartenderBarRef.current = bartenderBar
    bartenderBar
      ? localStorage.setItem(BARTENDER_BAR_KEY, JSON.stringify(bartenderBar))
      : localStorage.removeItem(BARTENDER_BAR_KEY)
  }, [bartenderBar])

  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])

  // Handle return from Mercado Pago redirect.
  // Re-reads pending fresh from localStorage so clearPending() before the async
  // call acts as a once-only guard — React StrictMode runs effects twice in dev;
  // the second invocation finds localStorage already empty and skips createOrder.
  useEffect(() => {
    if (!initialReturn) return
    const pending = loadPending()
    clearPending()
    // Collapse any duplicate slashes (e.g. a trailing-slash web-origin yields
    // "//?status=...") and fall back to "/" so replaceState never gets an
    // invalid protocol-relative URL like "//".
    const cleanPath = window.location.pathname.replace(/\/{2,}/g, '/') || '/'
    window.history.replaceState({}, '', cleanPath)
    if (!pending || initialReturn.status !== 'approved') return
    const { items, total, event } = pending
    createOrder(items, undefined, total, event?.id)
      .then(order => {
        const bar = { id: order.bar, label: order.barLabel ?? order.bar, location: '' }
        setActiveOrder(order)
        setAssignedBar(bar)
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  const pollEnabled = !!activeOrder && (screen === 'queue' || screen === 'preparing' || screen === 'ready' || screen === 'qr')
  const { data: liveOrder } = useOrderStatus(activeOrder?.id, { enabled: pollEnabled })

  useEffect(() => {
    if (!pollEnabled || liveOrder === undefined) return
    if (liveOrder === null) {
      // Order no longer exists: a vanished pickup reads as delivered, otherwise cancelled.
      go(screen === 'qr' ? 'confirmed' : 'order-cancelled')
      return
    }
    const status = liveOrder.status
    // Terminal states first
    if (status === 'delivered') { go('confirmed'); return }
    if (status === 'cancelled') { go('order-cancelled'); return }
    // Keep the customer's screen in sync with the live status — forward AND backward,
    // so a bartender freeing a PREPARING order sends the customer back to 'queue'.
    if (status === 'ready') {
      if (screen !== 'ready' && screen !== 'qr') { notifyOrderReady(); go('ready') }
    } else if (status === 'preparing') {
      if (screen !== 'preparing') go('preparing')
    } else if (status === 'queue') {
      if (screen !== 'queue') go('queue')
    }
  }, [liveOrder, screen, pollEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

  // Payment processing
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
        const pref = await createPaymentPreference(items, total, selectedEvent?.id)
        if (cancelled) return

        if (pref?.simulated || !pref?.initPoint) {
          // Simulated path: create the order now (no real payment needed)
          const order = await createOrder(items, undefined, total, selectedEvent?.id)
          if (cancelled) return
          const bar = bars.find(b => b.id === order.bar) ?? { id: order.bar, label: order.barLabel ?? order.bar, location: '' }
          clearPending()
          setAssignedBar(bar)
          setActiveOrder(order)
          go('queue')
          return
        }

        // Real MP path: stash cart for after the redirect; order created on return
        savePending({ items, total, cart, event: selectedEvent })
        window.location.href = pref.initPoint
      } catch {
        clearPending()
        if (!cancelled) go('rejected')
      }
    }, 600)
    return () => { cancelled = true; clearTimeout(t) }
  }, [screen]) // eslint-disable-line react-hooks/exhaustive-deps

  const title      = TITLES[screen]
  const backTarget = BACK_TARGETS[screen]

  function handleBackFromMenu() {
    const hasItems = Object.values(cart).some(q => q > 0)
    if (hasItems) {
      if (!window.confirm('¿Salir del evento? Tu carrito se vaciará.')) return
      setCart({})
      clearPersisted(PERSIST_CART)
    }
    setSelectedEvent(null)
    clearPersisted(PERSIST_EVENT)
    go('welcome')
  }

  function resetOrder() {
    setCart({})
    setAssignedBar(null)
    setActiveOrder(null)
    clearPersisted(PERSIST_CART, PERSIST_ORDER, PERSIST_BAR)
    go('menu')
  }

  function handleBartenderLogin(session) {
    saveBartenderSession(session)
    const bar = { id: session.barId, label: session.barLabel, location: '', username: session.username, eventId: session.eventId }
    setBartenderBar(bar)
    go('bartender', { barId: session.barId })
  }

  function handleLogout() {
    clearBartenderSession()
    localStorage.removeItem(BARTENDER_BAR_KEY)
    setBartenderBar(null)
    clearPersisted(PERSIST_SCREEN, PERSIST_CART, PERSIST_EVENT, PERSIST_ORDER, PERSIST_BAR)
    go('login')
  }

  const isBartenderView = screen === 'bartender' || screen === 'bartender-scanner'
  const navTitle   = isBartenderView ? (bartenderBar?.label ?? 'Barra') : title
  const showNavBar = !!navTitle && screen !== 'login' && screen !== 'welcome'
  const onBack     =
    screen === 'menu'          ? handleBackFromMenu :
    backTarget                 ? () => go(backTarget) :
    screen === 'payment-setup' ? () => go('bartender', { barId: bartenderBar?.id }) :
    null

  return (
    <div className="phone">
      <StatusBar status={healthStatus} />

      {showNavBar && (
        <NavBar
          title={navTitle}
          onBack={onBack}
          theme={theme}
          onToggleTheme={toggleTheme}
          variant={isBartenderView ? 'bartender' : undefined}
          right={isBartenderView ? (
            <button className="bartender-logout" onClick={handleLogout}>Cerrar sesión</button>
          ) : null}
        />
      )}

      <div
        key={screen}
        className={`screen-fade${(screen === 'bartender' || screen === 'bartender-scanner') ? ' bartender-scope' : ''}`}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
      >
        {(screen === 'login' || screen === 'welcome') && (
          <button
            className="theme-btn"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            style={{ position: 'absolute', top: 14, right: 14, zIndex: 20, width: 32, height: 32 }}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        )}

        {screen === 'login' && (
          <LoginScreen
            onCustomer={() => go('welcome')}
            onBartenderLogin={handleBartenderLogin}
          />
        )}

        {screen === 'welcome' && (
          <WelcomeScreen
            onLogin={(event) => {
              setSelectedEvent(event)
              if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission()
              }
              go('menu')
            }}
            onBack={() => go('login')}
          />
        )}

        {screen === 'menu' && (
          <MenuScreen cart={cart} onCartChange={setCart} onCheckout={() => go('order')} event={selectedEvent} />
        )}

        {screen === 'order' && (
          <OrderScreen cart={cart} onPay={() => go('payment')} onBack={() => go('menu')} />
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
            queuePosition={liveOrder?.queuePosition}
            etaMinutes={liveOrder?.etaMinutes}
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
            onConfirmed={() => { if (screen === 'confirmed') resetOrder(); else go('confirmed') }}
          />
        )}

        {screen === 'order-cancelled' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--warn-dim)', border: '2px solid var(--warn)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
            }}>🚫</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Pedido cancelado</div>
              <div style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                La barra canceló tu pedido. Si creés que fue un error, acercate a la barra.
              </div>
            </div>
            <button className="btn-primary" onClick={resetOrder} style={{ width: '100%' }}>
              Volver al menú
            </button>
          </div>
        )}

        {(screen === 'bartender' || screen === 'bartender-scanner') && (
          <BartenderScreen
            scannerPhase={screen === 'bartender-scanner'}
            onScannerOpen={() => go('bartender-scanner', { barId: bartenderBar?.id })}
            onScannerClose={() => go('bartender', { barId: bartenderBar?.id })}
            bartenderBar={bartenderBar}
          />
        )}

        {screen === 'payment-setup' && (
          <PaymentSetupScreen
            eventId={bartenderBar?.eventId}
            eventName={bartenderBar?.eventId ?? 'Evento'}
            onBack={() => go('bartender')}
          />
        )}
      </div>
    </div>
  )
}

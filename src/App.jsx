import { useState, useEffect, useRef } from 'react'
import './App.css'

import LoginScreen        from './screens/LoginScreen'
import RolePickerScreen   from './screens/RolePickerScreen'
import WelcomeScreen      from './screens/WelcomeScreen'
import MenuScreen         from './screens/MenuScreen'
import OrderScreen        from './screens/OrderScreen'
import PaymentScreen      from './screens/PaymentScreen'
import QueueScreen        from './screens/QueueScreen'
import QRScreen           from './screens/QRScreen'
import BartenderScreen    from './screens/BartenderScreen'
import BarSelectScreen    from './screens/BarSelectScreen'
import PaymentSetupScreen from './screens/PaymentSetupScreen'
import { useBars }                    from './hooks/useBars.js'
import { useProductMap, resolveProduct } from './hooks/useMenu.js'
import { useOrderStatus }             from './hooks/useOrderStatus.js'
import { useBackendHealth }           from './hooks/useBackendHealth.js'
import { createOrder, createPaymentPreference, loginBartender, loginAdmin } from './services/api'
import { useScreen } from './hooks/useScreen.js'
import { loadPersisted, savePersisted, clearPersisted,
         PERSIST_SCREEN, PERSIST_CART, PERSIST_EVENT, PERSIST_ORDER, PERSIST_BAR } from './lib/persist.js'
import { TITLES, BACK_TARGETS, barIdFromPath, TRANSIENT_SCREENS } from './lib/screens.js'

// ── Constants ─────────────────────────────────────────────────────────────────

const PENDING_KEY           = 'fb_pending_payment'
const BARTENDER_SESSION_KEY = 'fb_bartender_session'
const BARTENDER_BAR_KEY     = 'fb_bartender_bar'
const ADMIN_SESSION_KEY     = 'fb_admin_session'
const ROLE_KEY              = 'fb_role'

// DEV ONLY (develop branch — stripped on production):
// the "Vista bartender" picker auto-logs-in with seed credentials.
const DEV_BARTENDER_PASSWORDS = {
  'eclipse-north':  'norte123',
  'eclipse-center': 'centro123',
  'eclipse-south':  'sur123',
  'cumbia-main':    'principal123',
  'cumbia-vip':     'vip123',
}

// DEV ONLY: admin dev shortcut events (seeded via DataInitializer).
const DEV_ADMIN_CREDS = {
  'e1': { username: 'admin-eclipse', password: 'eclipse2025' },
  'e2': { username: 'admin-cumbia',  password: 'cumbia2025'  },
  'e3': { username: 'admin-cosquin', password: 'cosquin2025' },
  'e5': { username: 'admin-lolla',   password: 'lolla2025'   },
}
const DEV_ADMIN_SHORTCUTS = [
  { id: 'e1', label: '🌕 Eclipse (dev)'  },
  { id: 'e2', label: '🎺 Cumbia (dev)'   },
  { id: 'e3', label: '🎸 Cosquín (dev)'  },
]

// ── localStorage helpers ──────────────────────────────────────────────────────

function saveRole(role) {
  try { localStorage.setItem(ROLE_KEY, role) } catch {}
}
function clearRole() {
  try { localStorage.removeItem(ROLE_KEY) } catch {}
}
function loadRole() {
  try { return localStorage.getItem(ROLE_KEY) } catch { return null }
}

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
  try {
    localStorage.removeItem(BARTENDER_SESSION_KEY)
    localStorage.removeItem(BARTENDER_BAR_KEY)
  } catch {}
}
function saveAdminSession(session) {
  try { localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session)) } catch {}
}
function clearAdminSession() {
  try { localStorage.removeItem(ADMIN_SESSION_KEY) } catch {}
}
function parseLocalStorage(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
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

// Determines the initial screen based on persisted role + sessions.
// Called once at boot (inside useScreen's lazy useState initializer).
function computeInitialScreen() {
  const role = loadRole()
  if (!role) return 'role-picker'

  if (role === 'user') {
    const saved = loadPersisted(PERSIST_SCREEN)
    if (saved && !TRANSIENT_SCREENS.has(saved)) return saved
    return 'welcome'
  }

  if (role === 'bartender') {
    const saved = loadPersisted(PERSIST_SCREEN)
    const bartenderScreens = new Set(['bartender', 'bartender-scanner', 'bartender-bar', 'login'])
    if (saved && bartenderScreens.has(saved)) return saved
    const s = parseLocalStorage(BARTENDER_SESSION_KEY)
    return s ? 'bartender' : 'login'
  }

  if (role === 'admin') {
    const s = parseLocalStorage(ADMIN_SESSION_KEY)
    return s ? 'admin' : 'admin-login'
  }

  return 'role-picker'
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

  // Compute the role-based initial screen once at mount.
  // initialReturn (MP redirect) takes priority inside useScreen.
  const initialScreenRef = useRef(computeInitialScreen())

  const { screen, go, pathname } = useScreen({
    initialReturn,
    initialScreen: initialScreenRef.current,
    resolveBarId: () => bartenderBarRef.current?.id,
  })

  const [cart, setCart]               = useState(() => loadPersisted(PERSIST_CART) ?? {})
  const [theme, setTheme]             = useState('dark')
  const [assignedBar, setAssignedBar] = useState(() => loadPersisted(PERSIST_BAR))
  const [bartenderBar, setBartenderBar] = useState(() => {
    try {
      const bar = parseLocalStorage(BARTENDER_BAR_KEY)
      if (bar) {
        const urlBarId = barIdFromPath(pathname)
        if (!urlBarId || urlBarId === bar.id) return bar
      }
      const s = parseLocalStorage(BARTENDER_SESSION_KEY)
      if (s) {
        const urlBarId = barIdFromPath(pathname)
        if (!urlBarId || urlBarId === s.barId) {
          return { id: s.barId, label: s.barLabel, location: '', username: s.username, eventId: s.eventId }
        }
      }
    } catch {}
    return null
  })
  const [adminSession, setAdminSession] = useState(() => parseLocalStorage(ADMIN_SESSION_KEY))
  const [activeOrder, setActiveOrder]   = useState(() => loadPersisted(PERSIST_ORDER))
  const [selectedEvent, setSelectedEvent] = useState(() => loadPersisted(PERSIST_EVENT))

  const { data: bars = [] } = useBars()
  const productMap = useProductMap()
  const healthStatus = useBackendHealth()

  // Persist customer state
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
  useEffect(() => {
    if (!initialReturn) return
    const pending = loadPending()
    clearPending()
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
      go(screen === 'qr' ? 'confirmed' : 'order-cancelled')
      return
    }
    const status = liveOrder.status
    if (status === 'delivered') { go('confirmed'); return }
    if (status === 'cancelled') { go('order-cancelled'); return }
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
          const order = await createOrder(items, undefined, total, selectedEvent?.id)
          if (cancelled) return
          const bar = bars.find(b => b.id === order.bar) ?? { id: order.bar, label: order.barLabel ?? order.bar, location: '' }
          clearPending()
          setAssignedBar(bar)
          setActiveOrder(order)
          go('queue')
          return
        }

        savePending({ items, total, cart, event: selectedEvent })
        window.location.href = pref.initPoint
      } catch {
        clearPending()
        if (!cancelled) go('rejected')
      }
    }, 600)
    return () => { cancelled = true; clearTimeout(t) }
  }, [screen]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Role + session handlers ────────────────────────────────────────────────

  function handleRolePick(role) {
    saveRole(role)
    if (role === 'user')      go('welcome')
    else if (role === 'bartender') go('login')
    else if (role === 'admin')     go('admin-login')
  }

  function handleBartenderLogin(session) {
    saveBartenderSession(session)
    const bar = { id: session.barId, label: session.barLabel, location: '', username: session.username, eventId: session.eventId }
    setBartenderBar(bar)
    go('bartender', { barId: session.barId })
  }

  async function handleDevBartenderSelect(bar) {
    const password = DEV_BARTENDER_PASSWORDS[bar.id]
    if (password) {
      try {
        const session = await loginBartender(bar.id, password)
        handleBartenderLogin(session)
        return
      } catch {
        // fall through to unauthenticated view
      }
    }
    setBartenderBar(bar)
    go('bartender', { barId: bar.id })
  }

  function handleAdminLogin(session) {
    saveAdminSession(session)
    setAdminSession(session)
    go('admin')
  }

  async function handleDevAdminSelect(eventId) {
    const creds = DEV_ADMIN_CREDS[eventId]
    if (!creds) return
    try {
      const session = await loginAdmin(creds.username, creds.password)
      handleAdminLogin(session)
    } catch {
      // backend down — silently ignore
    }
  }

  function handleLogout() {
    clearBartenderSession()
    clearRole()
    setBartenderBar(null)
    clearPersisted(PERSIST_SCREEN, PERSIST_CART, PERSIST_EVENT, PERSIST_ORDER, PERSIST_BAR)
    go('role-picker')
  }

  function handleAdminLogout() {
    clearAdminSession()
    clearRole()
    setAdminSession(null)
    clearPersisted(PERSIST_SCREEN)
    go('role-picker')
  }

  function handleUserLogout() {
    clearRole()
    setCart({})
    setAssignedBar(null)
    setActiveOrder(null)
    setSelectedEvent(null)
    clearPersisted(PERSIST_SCREEN, PERSIST_CART, PERSIST_EVENT, PERSIST_ORDER, PERSIST_BAR)
    go('role-picker')
  }

  // ── UI helpers ─────────────────────────────────────────────────────────────

  const title      = TITLES[screen]
  const backTarget = BACK_TARGETS[screen]

  const isBartenderView = screen === 'bartender' || screen === 'bartender-scanner'
  const isAdminView     = screen === 'admin'
  const isStaffView     = isBartenderView || isAdminView

  // Scope class covers the role-specific color theme. Wraps NavBar + screen body
  // so --accent resolves to the role color everywhere inside.
  const scopeClass =
    ['login', 'bartender-bar', 'bartender', 'bartender-scanner', 'payment-setup'].includes(screen)
      ? 'bartender-scope'
      : ['admin-login', 'admin'].includes(screen)
        ? 'admin-scope'
        : ''

  const navTitle = isBartenderView
    ? (bartenderBar?.label ?? 'Barra')
    : isAdminView
      ? (adminSession?.eventName ?? 'Evento')
      : title

  const noNavScreens = new Set(['role-picker', 'login', 'admin-login', 'welcome'])
  const showNavBar = !!navTitle && !noNavScreens.has(screen)

  const onBack =
    screen === 'menu'          ? handleBackFromMenu :
    backTarget                 ? () => go(backTarget) :
    screen === 'payment-setup' ? () => go('bartender', { barId: bartenderBar?.id }) :
    null

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

  const showThemeBtn = noNavScreens.has(screen)

  return (
    <div className="phone">
      <StatusBar status={healthStatus} />

      {/* Role scope wraps both NavBar and screen body so --accent resolves to
          the correct role color everywhere (NavBar glows, buttons, brand mark). */}
      <div className={scopeClass} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {showNavBar && (
          <NavBar
            title={navTitle}
            onBack={onBack}
            theme={theme}
            onToggleTheme={toggleTheme}
            variant={isStaffView ? 'bartender' : undefined}
            right={isStaffView ? (
              <button
                className="bartender-logout"
                onClick={isBartenderView ? handleLogout : handleAdminLogout}
              >
                Cerrar sesión
              </button>
            ) : null}
          />
        )}

        <div
          key={screen}
          className="screen-fade"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
        >
          {showThemeBtn && (
            <button
              className="theme-btn"
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              style={{ position: 'absolute', top: 14, right: 14, zIndex: 20, width: 32, height: 32 }}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          )}

        {screen === 'role-picker' && (
          <RolePickerScreen onRole={handleRolePick} />
        )}

        {screen === 'login' && (
          <LoginScreen
            role="bartender"
            onLogin={handleBartenderLogin}
            onChangeRole={handleUserLogout}
            onBartenderPicker={() => go('bartender-bar')}
          />
        )}

        {screen === 'admin-login' && (
          <LoginScreen
            role="admin"
            onLogin={handleAdminLogin}
            onChangeRole={() => { clearRole(); go('role-picker') }}
            devShortcuts={DEV_ADMIN_SHORTCUTS}
            onDevShortcut={handleDevAdminSelect}
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
            onBack={() => go('role-picker')}
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

        {screen === 'bartender-bar' && (
          <BarSelectScreen onSelect={handleDevBartenderSelect} />
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

        {screen === 'admin' && (
          <PaymentSetupScreen
            eventId={adminSession?.eventId}
            eventName={adminSession?.eventName ?? 'Evento'}
            onBack={handleAdminLogout}
            backLabel="← Cambiar rol"
          />
        )}
        </div>{/* screen-fade */}
      </div>{/* scope wrapper */}
    </div>
  )
}

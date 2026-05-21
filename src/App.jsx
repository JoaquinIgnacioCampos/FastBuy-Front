import { useState, useEffect, useRef } from 'react'
import './App.css'

import WelcomeScreen    from './screens/WelcomeScreen'
import MenuScreen       from './screens/MenuScreen'
import OrderScreen      from './screens/OrderScreen'
import PaymentScreen    from './screens/PaymentScreen'
import QueueScreen      from './screens/QueueScreen'
import QRScreen         from './screens/QRScreen'
import BartenderScreen  from './screens/BartenderScreen'
import BarSelectScreen  from './screens/BarSelectScreen'
import { BARS } from './data'

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
  const [screen, setScreen]       = useState('welcome')
  const [cart, setCart]           = useState({})
  const [theme, setTheme]         = useState('dark')
  const [assignedBar, setAssignedBar] = useState(null)
  const [bartenderBar, setBartenderBar] = useState(null)
  const barLoadsRef = useRef(BARS.reduce((acc, b) => ({ ...acc, [b.id]: 0 }), {}))

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function toggleTheme() { setTheme(t => t === 'dark' ? 'light' : 'dark') }

  function assignBar() {
    const loads = barLoadsRef.current
    const bar = BARS.reduce((a, b) => loads[a.id] <= loads[b.id] ? a : b)
    barLoadsRef.current = { ...loads, [bar.id]: loads[bar.id] + 1 }
    setAssignedBar(bar)
  }

  async function notifyOrderReady() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    const opts = { body: `Acercate a ${assignedBar?.label ?? 'la barra'} y mostrá tu QR.`, icon: '/favicon.svg', vibrate: [200, 100, 200] }
    try {
      const reg = await navigator.serviceWorker.ready
      reg.showNotification('FastBuy · Tu pedido está listo 🍺', opts)
    } catch {
      try { new Notification('FastBuy · Tu pedido está listo 🍺', opts) } catch {}
    }
  }

  // Auto-advance queue simulation
  useEffect(() => {
    if (screen === 'queue') {
      const t = setTimeout(() => setScreen('preparing'), 4000)
      return () => clearTimeout(t)
    }
    if (screen === 'preparing') {
      const t = setTimeout(() => setScreen('ready'), 5000)
      return () => clearTimeout(t)
    }
    if (screen === 'ready') {
      notifyOrderReady()
    }
  }, [screen])

  // Payment simulation (paying → queue)
  useEffect(() => {
    if (screen === 'paying') {
      const t = setTimeout(() => { assignBar(); setScreen('queue') }, 2500)
      return () => clearTimeout(t)
    }
  }, [screen])

  function go(s) { setScreen(s) }

  const title = TITLES[screen]
  const backTarget = BACK_TARGETS[screen]

  function resetOrder() {
    setCart({})
    setAssignedBar(null)
    go('menu')
  }

  const isBartender = screen === 'bartender' || screen === 'bartender-scanner' || screen === 'bartender-bar'
  const navTitle = screen === 'bartender' ? (bartenderBar?.label ?? 'Barra') : title

  return (
    <div className="phone">
      {navTitle && (
        <NavBar
          title={navTitle}
          onBack={backTarget ? () => go(backTarget) : null}
          theme={theme}
          onToggleTheme={toggleTheme}
          right={
            screen === 'menu' ? (
              <button onClick={() => go('bartender-bar')} style={{ fontSize: 12, color: 'var(--text-mute)', padding: '4px 8px' }}>🍹</button>
            ) : isBartender ? (
              <button onClick={() => { setBartenderBar(null); go('welcome') }} style={{ fontSize: 12, color: 'var(--text-mute)', padding: '4px 8px' }}>← Salir</button>
            ) : null
          }
        />
      )}

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
          onLogin={() => go('menu')}
          onBartender={() => go('bartender-bar')}
        />
      )}

      {screen === 'menu' && (
        <MenuScreen
          cart={cart}
          onCartChange={setCart}
          onCheckout={() => go('order')}
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
  )
}

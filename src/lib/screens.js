// Screen <-> URL routing maps and per-screen metadata for the app's screen
// state machine (see useScreen).

export const SCREEN_TO_PATH = {
  'role-picker':       '/',
  login:               '/login',
  welcome:             '/events',
  menu:                '/menu',
  order:               '/order',
  payment:             '/payment',
  paying:              '/payment',
  rejected:            '/payment',
  queue:               '/queue',
  preparing:           '/queue',
  ready:               '/queue',
  offline:             '/queue',
  qr:                  '/pickup',
  confirmed:           '/pickup',
  'order-cancelled':   '/cancelled',
  'bartender-bar':     '/staff/bars',
  bartender:           '/staff',
  'bartender-scanner': '/staff',
  'payment-setup':     '/staff/setup',
  'admin-login':       '/admin/login',
  admin:               '/admin',
}

export const PATH_TO_SCREEN = {
  '/':             'role-picker',
  '/login':        'login',
  '/events':       'welcome',
  '/menu':         'menu',
  '/order':        'order',
  '/payment':      'payment',
  '/queue':        'queue',
  '/pickup':       'qr',
  '/cancelled':    'order-cancelled',
  '/staff/bars':   'bartender-bar',
  '/staff/setup':  'payment-setup',
  '/staff':        'bartender',
  '/admin/login':  'admin-login',
  '/admin':        'admin',
}

export const TITLES = {
  menu:                'Menú',
  order:               'Tu pedido',
  payment:             'Mercado Pago',
  paying:              'Procesando pago',
  rejected:            'Pago rechazado',
  queue:               'Cola virtual',
  preparing:           'Cola virtual',
  ready:               'Cola virtual',
  offline:             'Sin conexión',
  qr:                  'Retirar pedido',
  confirmed:           'Pedido retirado',
  'order-cancelled':   'Pedido cancelado',
  'bartender-bar':     'Seleccionar Barra',
  bartender:           '—',
  'bartender-scanner': '—',
  'payment-setup':     'Configurar pagos',
  admin:               '—',
}

export const BACK_TARGETS = {
  order:    'menu',
  payment:  'order',
  rejected: 'order',
}

// Transient checkout screens must never be auto-resumed from persisted state:
// 'paying' immediately re-fires the payment effect (with a possibly-empty cart,
// which fails), and 'payment'/'rejected' are mid-flow steps.
export const TRANSIENT_SCREENS = new Set(['payment', 'paying', 'rejected'])

export function pathToScreen(pathname) {
  if (pathname.startsWith('/e/'))          return 'welcome' // QR deep link → event auto-select
  if (pathname.startsWith('/staff/setup')) return 'payment-setup'
  if (pathname.startsWith('/staff/bars'))  return 'bartender-bar'
  if (pathname.startsWith('/staff/'))      return 'bartender'
  if (pathname.startsWith('/admin/login')) return 'admin-login'
  if (pathname === '/admin')               return 'admin'
  return PATH_TO_SCREEN[pathname] ?? null
}

export function barIdFromPath(pathname) {
  const m = pathname.match(/^\/staff\/([^/]+)$/)
  return m ? m[1] : null
}

// Returns the eventId embedded in a /e/:eventId QR deep link, or null.
export function eventIdFromPath(pathname) {
  const m = pathname.match(/^\/e\/([^/]+)$/)
  return m ? decodeURIComponent(m[1]) : null
}

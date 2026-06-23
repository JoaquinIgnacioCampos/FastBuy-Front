// localStorage-backed persistence for the customer flow. Unlike sessionStorage,
// this survives the app being closed, so a customer who closes mid-order can
// reopen on the same device and land back on their order/queue. Cleared on
// delivery (resetOrder), logout, and leaving an event.

export const PERSIST_SCREEN = 'fb_screen'
export const PERSIST_CART   = 'fb_cart'
export const PERSIST_EVENT  = 'fb_event'
export const PERSIST_ORDER  = 'fb_order'
export const PERSIST_BAR    = 'fb_bar'

export function loadPersisted(key)      { try { return JSON.parse(localStorage.getItem(key)) } catch { return null } }
export function savePersisted(key, val) { try { localStorage.setItem(key, JSON.stringify(val)) } catch { /* storage unavailable/quota — ignore */ } }
export function clearPersisted(...keys) { keys.forEach(k => { try { localStorage.removeItem(k) } catch { /* ignore */ } }) }

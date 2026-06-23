import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { loadPersisted, savePersisted, PERSIST_SCREEN } from '../lib/persist.js'
import { SCREEN_TO_PATH, pathToScreen, TRANSIENT_SCREENS } from '../lib/screens.js'

/**
 * Owns the screen state machine and keeps the URL in sync via React Router.
 *
 * - `initialReturn`: parsed Mercado Pago return info (or null) used to pick the
 *   initial screen after a payment redirect.
 * - `resolveBarId`: function returning the current bartender bar id, read lazily
 *   at navigation time (for `/staff/:barId`) to avoid a state cycle with the
 *   caller's bartender-bar state.
 *
 * Returns `{ screen, go, pathname }`. `go(screen, { barId })` sets the screen,
 * persists it, and navigates.
 */
export function useScreen({ initialReturn, resolveBarId }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [screen, setScreen] = useState(() => {
    if (initialReturn?.status === 'approved' && initialReturn.pending) return 'queue'
    if (initialReturn?.status === 'rejected' || initialReturn?.status === 'failure') return 'rejected'
    const saved = loadPersisted(PERSIST_SCREEN)
    if (saved && !TRANSIENT_SCREENS.has(saved)) return saved
    return pathToScreen(location.pathname) ?? 'login'
  })

  function go(s, opts = {}) {
    setScreen(s)
    savePersisted(PERSIST_SCREEN, s)
    const barId = opts.barId ?? resolveBarId?.()
    const path =
      (s === 'bartender' || s === 'bartender-scanner') && barId
        ? `/staff/${barId}`
        : SCREEN_TO_PATH[s] ?? '/'
    navigate(path)
  }

  return { screen, go, pathname: location.pathname }
}

# FastBuy Frontend — Claude Instructions

## Project Overview
React 19 + Vite frontend for FastBuy. Runs on port 5173. Started via `start-fastbuy.ps1` alongside the Spring Boot backend.

- GitHub: https://github.com/JoaquinIgnacioCampos/FastBuy-Front
- Branching: `main` (stable) + `develop` (daily work). Feature branches off `develop`.

## Behavioral Instructions

<!-- New instructions are appended here as they are given across sessions. -->

### 2026-05-21
- Log every behavioral change given by the user in both `FastBuy-Front/CLAUDE.md` and `FastBuy-Back/CLAUDE.md` to track progress across sessions.
- ngrok free static domains are randomly assigned (e.g. `crepe-phonics-slogan.ngrok-free.dev`). Custom subdomains like `fastbuy.ngrok-free.app` require a paid plan. Do not attempt to change the ngrok domain to a custom one without confirming the user has reserved it in their ngrok dashboard.
- When the ngrok domain changes, update both `start-fastbuy.ps1` (`$domain`) and `vite.config.js` (`server.allowedHosts`) to keep them in sync.
- `npm run dev:backend` uses `vite --mode backend`, which loads `.env.backend`. Without that file, `VITE_API_URL` is undefined and the app falls back to demo mode regardless of the script used. `.env.backend` has been created with `VITE_API_URL=http://localhost:8080`.
- Service switching: `src/config.js` exports `IS_DEMO = !import.meta.env.VITE_API_URL`. `src/services/index.js` re-exports from either `demo.js` or `api.js` based on this flag.
- The 3 endpoints the frontend calls (all in `src/services/api.js`, used only by `BartenderScreen`): `GET /orders?bar={barId}`, `POST /orders/{id}/advance`, `POST /orders/{id}/deliver`.
- All other data (products, bars, categories, event) is hardcoded in `src/front-demo-data.js` and not yet fetched from the backend.
- When the backend is unreachable, `BartenderScreen` must show a user-friendly error UI (not a black screen). Pattern: `fetchError` state + `retryKey` state, error card with "Reintentar" button matching the style of `QRCameraScanner`'s error UI. All `getOrders`, `advanceOrder`, and `markDelivered` calls must be wrapped in try/catch and set `fetchError` on failure.

### 2026-05-27
- `start-fastbuy-back.ps1` uses a single ngrok tunnel (port 5173, static domain `crepe-phonics-slogan.ngrok-free.dev`) — identical to the demo script except it runs `npm run dev:backend` instead of `npm run dev`. The free ngrok plan supports only 1 tunnel per agent session, so a second tunnel for the backend cannot be added.
- Backend API calls from external devices work via a **Vite dev-server proxy**: `vite.config.js` proxies `/api/*` to `http://localhost:8080/*` (stripping the `/api` prefix). `.env.backend` sets `VITE_API_URL=/api` so all API calls are relative and always route through the proxy regardless of the ngrok URL.
- Both start scripts use an inline **Ctrl+C stop** pattern: `try { while ($true) { Start-Sleep 1 } } finally { Kill-Tree each proc }`. Press Ctrl+C in the launcher terminal to stop all services. No separate stop script is needed.
- `start-fastbuy-back.ps1` kills any stale process on ports 5173 and 8080 before starting services, to prevent a leftover demo-mode Vite from occupying port 5173 and causing the app to appear in demo mode.
- `start-fastbuy-back.ps1` verifies (and auto-creates) `.env.backend` with `VITE_API_URL=/api` before launching Vite.
- `stop-fastbuy.ps1` and `stop-fastbuy.bat` have been deleted — they are no longer needed.
- No CORS configuration is needed on the Spring Boot backend because the browser never calls it directly — all requests go through the Vite proxy.
- `BartenderScreen` polls the backend every 5 seconds (`setInterval(load, 5000)` inside the main `useEffect`). The `cancelled` flag prevents state updates after unmount. The interval is cleared on unmount alongside the cancellation flag.
- Full backend order flow: `POST /orders` is called on payment confirmation (`paying` phase in `App.jsx`); `GET /orders?bar=` is polled every 5s while customer is on queue/preparing screens; `activeOrder` state stores the real order object and is passed to `QueueScreen` and `QRScreen` for display.
- `.env.backend` sets `VITE_API_URL=/api` (not a full URL). Vite proxy rewrites `/api/*` → `http://localhost:8080/*`.

### 2026-06-02 — Backend-first refactor
- All domain data (events, bars, products, categories) now flows through the backend in `npm run dev:backend` mode. `src/front-demo-data.js` was deleted; the demo service (`src/services/demo.js`) is the single source of truth for offline-dev seed data, and its product/bar/category IDs are kept in sync with `FastBuy-Back/.../data.sql` so screens behave identically across modes. Demo mode stays as the offline-dev fallback only.
- TanStack Query (`@tanstack/react-query`) is the data layer. Components never call services directly — they call hooks in `src/hooks/` (`useEvents`, `useBars`, `useMenu`, `useCategories`, `useOrders`, `useOrderStatus`, `useCreateOrder`, `useAdvanceOrder`, `useMarkDelivered`). Hooks call services. Polling uses `refetchInterval`; no raw `setInterval` for data.
- Standard shared components: `src/components/ErrorBoundary.jsx` (root-mounted in `main.jsx`), `src/components/QueryStates.jsx` (`<Loading />`, `<ErrorPanel />`), `src/components/ProductImage.jsx` (renders URL → `<img>` with emoji fallback). Reuse these instead of reimplementing per-screen.
- Bar assignment is a backend concern. `POST /orders` accepts an optional `bar` field; when omitted, the server picks the bar with the fewest in-flight beverages (sum of item quantities across QUEUE+PREPARING orders) that carries every requested item, returning the assigned bar in the response. Frontend never computes assignment — `App.jsx` just reads `order.bar` from the response.
- Per-bar menus: `GET /bars/{barId}/menu` returns the subset of products served at that bar; `GET /products` returns the union (the customer-facing menu, since the bar isn't known until payment). Each product has an `image` field (URL or emoji) and an `emoji` fallback used by `ProductImage`.
- Events are fetched from `GET /events`, which filters out events whose `endsAt < NOW - 6h` (6-hour grace period) and sorts by `startsAt ASC`. `WelcomeScreen` renders a list with `live`/`upcoming`/`finished` badges; only `live` events are enterable.
- Bartender two-step: the queue tab shows two sub-sections — `En cola` (status=queue, "Comenzar a preparar" button) and `Preparando` (status=preparing, "Marcar listo" button). Both call `POST /orders/{id}/advance` which steps queue → preparing → ready exactly one transition per call.
- QR screen auto-advances to `confirmed` when the customer's order disappears from `getOrderStatus` polling (interpreted as "bartender confirmed delivery"). The customer-side QR simulation button was removed; demo mode auto-advances after a 6s timer.
- Removed: demo cheatsheet box in `WelcomeScreen`, the hardcoded `BARTENDER_CODE = '00000000'` (entry is via the "Vista Bartender 🍹" button only), Visa/Mastercard rows from `PaymentScreen` (only `balance` remains until Phase 6 lands a real MP integration).
- Mercado Pago spike notes live at `FastBuy-Back/mercado-pago-spike.md` — Checkout Pro via preference+redirect is the lowest-effort path; needs `MP_ACCESS_TOKEN`. Not yet wired into the runtime flow.

### 2026-06-03 — Two-step welcome, MP redirect flow, lenient assignment
- `WelcomeScreen` is now a two-step flow with internal `step` state: **step 1** (`pick-event`) shows only the events list + Continuar CTA (disabled until a live event is tapped); **step 2** (`enter-phone`) shows the selected event as a bright header card, the phone input, and an "Entrar" CTA. A back chevron returns to step 1. The auto-select-on-single-live-event was removed — tapping is always required.
- Selected `EventCard` uses solid `var(--accent)` background + inverted `var(--accent-on)` text + 3-px accent glow + a `✓` chip. Replaces the previous low-contrast `accent-dim` treatment.
- Mercado Pago redirect-back flow: `App.jsx`'s `paying` effect now calls `createOrder` → `createPaymentPreference(order.id)` → `window.location.href = pref.initPoint`. Before the redirect, the in-flight `{ order, bar, cart, event }` is stashed in `localStorage` under key `fb_pending_payment`. On boot, `App.jsx` reads `?status=` and `?external_reference=` from the URL, restores the pending payload if `status=approved`, jumps to the queue screen, and strips the params via `history.replaceState`. Works identically whether the backend hit real MP or the simulated fallback.
- New service / hook: `createPaymentPreference(orderId)` in `services/api.js` and `services/demo.js` (demo returns a same-origin simulated initPoint so the redirect flow works offline). Wrapped by `hooks/useCreatePaymentPreference.js` (currently used directly via the service function in `App.jsx`; the hook is available for future mutation-driven flows).
- Customer menu now shows 15 distinct emoji glyphs (was: many 🍺/🌭/🥤 duplicates), and the backend's lenient bar assignment means mixed carts (e.g. a north-only product + a south-only one) succeed instead of bouncing back as 422.

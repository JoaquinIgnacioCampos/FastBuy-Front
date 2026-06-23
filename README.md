# FastBuy — Frontend

React 19 + Vite SPA for FastBuy, an event-based beverage ordering system. Customers pick an event, browse the menu, pay via Mercado Pago, and join a virtual queue. Bartenders manage that queue from a staff view. Event organizers configure per-event payment credentials from an admin view.

- **Backend repo:** [FastBuy-Back](https://github.com/JoaquinIgnacioCampos/FastBuy-Back)
- **Prod URL:** hosted on Cloudflare Pages

---

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | React 19 |
| Build tool | Vite 8 |
| Data fetching | TanStack Query v5 |
| Routing | React Router v6 (hash-less) |
| Styling | CSS custom properties (dark/light theme) |

---

## Project structure

```
src/
├── App.jsx               # Root component: role state machine, session management
├── screens/              # One file per screen
│   ├── RolePickerScreen  # Initial screen — choose role
│   ├── LoginScreen       # Shared login form (bartender or admin)
│   ├── WelcomeScreen     # Event list (customer flow)
│   ├── MenuScreen        # Product menu + cart
│   ├── OrderScreen       # Cart review
│   ├── PaymentScreen     # Mercado Pago trigger
│   ├── QueueScreen       # Queue / preparing / ready status
│   ├── QRScreen          # Pickup QR code
│   ├── BartenderScreen   # Order queue management
│   ├── BarSelectScreen   # Dev bar picker
│   └── PaymentSetupScreen# MP seller token config (bartender access + admin main view)
├── hooks/                # TanStack Query wrappers + custom hooks
├── services/api.js       # All fetch calls (single BASE = '/api')
├── lib/
│   ├── screens.js        # Route ↔ screen maps, TITLES, BACK_TARGETS
│   ├── persist.js        # localStorage helpers for customer state
│   └── format.js         # Date/time formatters
└── components/           # Shared UI: ErrorBoundary, QueryStates, ProductImage
```

---

## Running locally

Requires the backend running on `:8080`. Use the launcher script:

```powershell
.\start-fastbuy.ps1
```

This starts the Spring Boot backend (`:8080`), Vite dev server (`:5173`), and an ngrok tunnel on the static domain `crepe-phonics-slogan.ngrok-free.dev`. ngrok is required so Mercado Pago's `auto_return` redirect can reach a public HTTPS URL.

To run Vite alone (no backend):

```bash
npm install
npm run dev
```

Vite proxies `/api/*` → `http://localhost:8080/*`, so all API calls are relative and work through ngrok without CORS issues.

---

## Role system

The app starts at the **role picker** screen (`/`). The chosen role is persisted in `localStorage` (`fb_role`) so reopening lands on the right entry view. Any logout or "Cambiar rol" clears `fb_role` and returns to the picker.

### Usuario (customer)
Entry: tap **"Entrar al evento"** → event list → menu → payment → queue.

State persisted across page closes: cart, active order, selected event, assigned bar (`fb_cart`, `fb_order`, `fb_event`, `fb_bar`). Transient checkout screens (`payment`, `paying`, `rejected`) are never auto-resumed.

### Bartender
Entry: tap **"Soy bartender"** → login form at `/login` → bartender queue view at `/staff/:barId`.

Session stored in `fb_bartender_session` (includes bearer token). Auth-gated write endpoints (`advance`, `deliver`, `cancel`, `release`) require `Authorization: Bearer <token>`.

### Organizador (admin)
Entry: tap **"Soy organizador"** → login form at `/admin/login` → admin view at `/admin`.

Session stored in `fb_admin_session` (includes bearer token). The admin view shows the Mercado Pago seller token configuration for their event. Payment-account writes (`POST`/`DELETE`) require `Authorization: Bearer <token>`.

---

## Dev credentials

### Bartenders

Use the **"Vista bartender 🍹"** shortcut on the bartender login screen. It opens a bar picker that auto-authenticates using these seed credentials:

| Username | Password | Bar |
|----------|----------|-----|
| `eclipse-north` | `norte123` | Barra Norte (Festival Eclipse) |
| `eclipse-center` | `centro123` | Barra Central (Festival Eclipse) |
| `eclipse-south` | `sur123` | Barra Sur VIP (Festival Eclipse) |
| `cumbia-main` | `principal123` | Barra Principal (Festival Cumbiero) |
| `cumbia-vip` | `vip123` | Barra VIP (Festival Cumbiero) |

### Admins (Organizadores)

Use the quick-access buttons on the admin login screen (dev section):

| Button | Username | Password | Event |
|--------|----------|----------|-------|
| 🌕 Eclipse (dev) | `admin-eclipse` | `eclipse2025` | Festival Eclipse (e1) |
| 🎺 Cumbia (dev) | `admin-cumbia` | `cumbia2025` | Festival Cumbiero (e2) |
| 🎸 Cosquín (dev) | `admin-cosquin` | `cosquin2025` | Cosquín Rock (e3) |

There is also a seeded admin for Lollapalooza 2027 (`admin-lolla` / `lolla2025` / e5), accessible by typing credentials manually.

---

## Screen flow

```
role-picker
├── usuario  → welcome (event list)
│              └── menu → order → payment → paying → queue → [preparing → ready] → qr → confirmed
├── bartender → login (/login) → bartender (/staff/:barId)
│                                 └── payment-setup (/staff/setup)
└── admin     → admin-login (/admin/login) → admin (/admin)
```

The customer flow also handles:
- `order-cancelled` — bartender triggered a no-show cancel
- `offline` — backend unreachable on queue screen
- MP payment return: `?status=approved` restores order from `fb_pending_payment`

---

## Configuration

All API calls use `BASE = '/api'` (hardcoded). Vite's dev proxy rewrites `/api/*` → `http://localhost:8080/*`.

For local MP payments to work (real redirect + auto_return), ngrok must be running so Mercado Pago has a public HTTPS URL to return to. The ngrok domain is `crepe-phonics-slogan.ngrok-free.dev`.

No `.env` file is needed for local dev.

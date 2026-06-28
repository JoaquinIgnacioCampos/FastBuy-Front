# FastBuy — Frontend

SPA en React 19 + Vite para FastBuy, un sistema de pedidos de bebidas para eventos. Los clientes eligen un evento, navegan el menú, pagan con Mercado Pago y se unen a una cola virtual. Los bartenders gestionan la cola desde una vista de staff. Los organizadores configuran las credenciales de pago por evento desde una vista de administrador.

- **Repo del backend:** [FastBuy-Back](https://github.com/JoaquinIgnacioCampos/FastBuy-Back)
- **URL de producción:** alojado en Cloudflare Pages

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 |
| Build tool | Vite 8 |
| Fetching de datos | TanStack Query v5 |
| Routing | React Router v6 (sin hash) |
| Estilos | CSS custom properties (tema oscuro/claro) |

---

## Estructura del proyecto

```
src/
├── App.jsx               # Componente raíz: máquina de estados de roles, manejo de sesión
├── screens/              # Un archivo por pantalla
│   ├── RolePickerScreen  # Pantalla inicial — elegir rol
│   ├── LoginScreen       # Formulario de login compartido (bartender u organizador)
│   ├── WelcomeScreen     # Lista de eventos (flujo cliente)
│   ├── MenuScreen        # Menú de productos + carrito
│   ├── OrderScreen       # Revisión del carrito
│   ├── PaymentScreen     # Trigger de Mercado Pago
│   ├── QueueScreen       # Estado de cola / preparando / listo
│   ├── QRScreen          # Código QR para retiro
│   ├── BartenderScreen   # Gestión de la cola de pedidos
│   └── PaymentSetupScreen# Config del token de vendedor MP (acceso bartender + vista principal admin)
├── hooks/                # Wrappers de TanStack Query + hooks personalizados
├── services/api.js       # Todas las llamadas fetch (BASE = '/api')
├── lib/
│   ├── screens.js        # Mapas ruta ↔ pantalla, TITLES, BACK_TARGETS
│   ├── persist.js        # Helpers de localStorage para el estado del cliente
│   └── format.js         # Formateadores de fechas y horas
└── components/           # UI compartida: ErrorBoundary, QueryStates, ProductImage
```

---

## Ejecución local

Requiere el backend corriendo en `:8080`. Usar el script de inicio:

```powershell
.\start-fastbuy.ps1
```

Esto inicia el backend de Spring Boot (`:8080`), el servidor de desarrollo de Vite (`:5173`) y un túnel ngrok en el dominio estático `crepe-phonics-slogan.ngrok-free.dev`. ngrok es necesario para que el `auto_return` de Mercado Pago pueda redirigir a una URL HTTPS pública.

Para correr solo Vite (sin backend):

```bash
npm install
npm run dev
```

Vite proxea `/api/*` → `http://localhost:8080/*`, por lo que todas las llamadas a la API son relativas y funcionan a través de ngrok sin problemas de CORS.

---

## Sistema de roles

La app arranca en la pantalla del **selector de rol** (`/`). El rol elegido se persiste en `localStorage` (`fb_role`) para que al reabrir la app se llegue a la vista correcta. Cualquier cierre de sesión o "Cambiar rol" limpia `fb_role` y vuelve al selector.

### Usuario (cliente)
Entrada: tocar **"Entrar al evento"** → lista de eventos → menú → pago → cola.

Estado persistido al cerrar la app: carrito, pedido activo, evento seleccionado, barra asignada (`fb_cart`, `fb_order`, `fb_event`, `fb_bar`). Las pantallas de checkout transitorias (`payment`, `paying`, `rejected`) nunca se reanudan automáticamente.

### Bartender
Entrada: tocar **"Soy bartender"** → formulario de login en `/login` → vista de cola de bartender en `/staff/:barId`.

Sesión guardada en `fb_bartender_session` (incluye el token de portador). Los endpoints de escritura autenticados (`advance`, `deliver`, `cancel`, `release`) requieren `Authorization: Bearer <token>`.

### Organizador (admin)
Entrada: tocar **"Soy organizador"** → formulario de login en `/admin/login` → vista de admin en `/admin`.

Sesión guardada en `fb_admin_session` (incluye el token de portador). La vista de admin muestra la configuración del token de vendedor de Mercado Pago para su evento. Las escrituras de cuenta de pago (`POST`/`DELETE`) requieren `Authorization: Bearer <token>`.

---

## Credenciales de desarrollo

### Bartenders

Usar el acceso rápido **"Vista bartender 🍹"** en la pantalla de login de bartender. Abre un selector de barra que se autentica automáticamente con estas credenciales seed:

| Usuario | Contraseña | Barra |
|---------|-----------|-------|
| `eclipse-north` | `norte123` | Barra Norte (Festival Eclipse) |
| `eclipse-center` | `centro123` | Barra Central (Festival Eclipse) |
| `eclipse-south` | `sur123` | Barra Sur VIP (Festival Eclipse) |
| `cumbia-main` | `principal123` | Barra Principal (Festival Cumbiero) |
| `cumbia-vip` | `vip123` | Barra VIP (Festival Cumbiero) |

### Admins (Organizadores)

Usar los botones de acceso rápido en la pantalla de login de admin (sección dev):

| Botón | Usuario | Contraseña | Evento |
|-------|---------|-----------|--------|
| 🌕 Eclipse (dev) | `admin-eclipse` | `eclipse2025` | Festival Eclipse (e1) |
| 🎺 Cumbia (dev) | `admin-cumbia` | `cumbia2025` | Festival Cumbiero (e2) |
| 🎸 Cosquín (dev) | `admin-cosquin` | `cosquin2025` | Cosquín Rock (e3) |

También hay un admin seed para Lollapalooza 2027 (`admin-lolla` / `lolla2025` / e5), accesible ingresando las credenciales manualmente.

---

## Flujo de pantallas

```
role-picker
├── usuario   → welcome (lista de eventos)
│               └── menu → order → payment → paying → queue → [preparing → ready] → qr → confirmed
├── bartender → login (/login) → bartender (/staff/:barId)
│                                 └── payment-setup (/staff/setup)
└── admin     → admin-login (/admin/login) → admin (/admin)
```

El flujo de cliente también maneja:
- `order-cancelled` — el bartender canceló por no-show
- `offline` — backend inaccesible en la pantalla de cola
- Retorno de pago MP: `?status=approved` restaura el pedido desde `fb_pending_payment`

---

## Configuración

Todas las llamadas a la API usan `BASE = '/api'` (hardcodeado). El proxy de desarrollo de Vite reescribe `/api/*` → `http://localhost:8080/*`.

Para que los pagos MP funcionen localmente (redirección real + auto_return), ngrok debe estar corriendo para que Mercado Pago tenga una URL HTTPS pública a la cual redirigir. El dominio de ngrok es `crepe-phonics-slogan.ngrok-free.dev`.

No se necesita ningún archivo `.env` para desarrollo local.

# sac-access-control — consola SENIAT

UI Next.js (pnpm, shadcn/ui) de la plataforma de ingresos. Un solo frontend de producto. El prototipo FACE-R (`app/` en el workspace) no se mantiene como kiosko paralelo.

On-premise LAN. Habla con `sac-administrative-backend` (`NEXT_PUBLIC_BACKEND_URL` / `BACKEND_URL`, default `http://localhost:8000`).

## Estaciones

| Ruta | Layout | Uso |
|------|--------|-----|
| `/gate` | Fullscreen (`app/gate/layout.tsx`, sin MainLayout) | Garita: cara estable → recognize (sin botón); fallback **cédula** (sin RIF/nombre/motivo/fiscal); enroll envía solo cédula; destino = departamento → `POST /visits/` + ticket. Salida: `GET /visits?cedula=&open=true` (no fuerza hoy); 1 abierta → auto `PATCH .../exit`; varias → lista; alertas bienes OUT/IN |
| `/desk` | Dashboard | Taquilla: cola FIFO (etiqueta = nombre o cédula), `PATCH .../call`, cronómetro `called_at`, `PATCH .../intake` `{name, reason, rif?}`, close express `atendido\|incompleto\|remitido` (exige nombre y motivo). Live WS o poll. **No** llama `PATCH .../attend` |
| `/` | Dashboard | Gerencia: supervisión del flujo (no opera ingreso/taquilla). Atajos a Garita, Taquilla y Bienes; pipeline del día (espera, taquilla, en sede, incompleto, salidas). Sigue mostrando métricas, RIF y rendimiento por fiscal. **Sin** % vs ayer |
| `/assets` | Dashboard | Inventario institucional (lista / ficha / alta admin). No es interrogatorio de pertenencias del contribuyente |

Sidebar: Dashboard `/`, Garita `/gate`, Taquilla `/desk`, Bienes `/assets`, `/search`, `/fiscals`, `/settings`. No hay «Registrar Entrada». `/entry` existe y redirige a `/gate`; no está en el menú.

Búsqueda `/search`: la tabla no tiene «Registrar Salida» ni «Marcar como Atendido».

## Auth

- Cookie httpOnly `sac_token` (login BFF `POST /api/auth/login`)
- BFF `GET /api/auth/session` entrega `{ access_token }` al JS para Bearer hacia la API (`lib/api/auth-token.ts`)
- BFF `GET /api/auth/me` incluye `id` (UUID) para carrier / asignarme
- Middleware exige cookie (en producción verifica JWT con `AUTH_JWT_SECRET`)

Tras un cambio de JWT en el backend hay que **volver a iniciar sesión**. Superficie conocida: `/api/auth/session` expone el token a JavaScript (XSS).

## MediaPipe (garita)

Archivos locales en `public/vendor/mediapipe/` (`face_landmarker.task`, `vision_bundle.mjs`, wasm). `lib/gate/face-mesh.ts` los carga desde `/vendor/mediapipe`. **No instalar MediaPipe por npm.**

## i18n

Existen claves `es` y `en` en `lib/i18n-messages.ts`. El locale está **fijo a `es`** (`locale-provider.tsx`). No hay switch de idioma.

## Arranque

```bash
pnpm install
pnpm dev
```

Variables típicas: `BACKEND_URL` / `NEXT_PUBLIC_BACKEND_URL` (origen sin `/api/v1` al final), `AUTH_JWT_SECRET` (obligatorio en producción).

## Qué no está

- Ticket térmico
- Excel/PDF
- Dos frontends de producto

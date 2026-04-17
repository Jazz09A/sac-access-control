import { NextResponse } from 'next/server'

const COOKIE = 'sac_token'

/** Origen del API (solo host:puerto). Si en .env pusiste .../api/v1, se quita para no duplicar la ruta. */
function normalizeBackendOrigin(raw: string): string {
  let u = raw.trim().replace(/\/+$/, '')
  if (u.endsWith('/api/v1')) {
    u = u.slice(0, -'/api/v1'.length).replace(/\/+$/, '')
  }
  return u
}

function backendLoginUrl(base: string) {
  return `${normalizeBackendOrigin(base)}/api/v1/auth/login`
}

export async function POST(request: Request) {
  const backendRaw = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000'
  const backend = normalizeBackendOrigin(backendRaw)
  let body: { username?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ detail: 'Cuerpo inválido' }, { status: 400 })
  }

  const url = backendLoginUrl(backendRaw)
  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: body.username ?? '',
        password: body.password ?? '',
      }),
      cache: 'no-store',
    })
  } catch {
    return NextResponse.json(
      {
        detail:
          `No hay conexión con el API en ${backend}. Arranca el backend (puerto 8000) y revisa BACKEND_URL en .env.local (solo origen, sin /api/v1).`,
      },
      { status: 503 },
    )
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    if (res.status === 404) {
      return NextResponse.json(
        {
          detail:
            'El backend respondió 404 en /api/v1/auth/login. Revisa: (1) BACKEND_URL en .env.local debe ser solo el origen, p. ej. http://127.0.0.1:8000 — sin /api/v1 al final; (2) reinicia uvicorn con el código actual; (3) en http://127.0.0.1:8000/docs debe existir POST /api/v1/auth/login.',
        },
        { status: 502 },
      )
    }
    const raw =
      typeof data === 'object' && data !== null && 'detail' in data
        ? (data as { detail: unknown }).detail
        : null
    const detail =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? 'Datos inválidos'
          : 'No se pudo iniciar sesión'
    return NextResponse.json({ detail }, { status: res.status })
  }

  const accessToken = (data as { access_token?: string }).access_token
  if (!accessToken) {
    return NextResponse.json({ detail: 'Respuesta del servidor incompleta' }, { status: 502 })
  }

  const response = NextResponse.json({ ok: true })
  const maxAge = 60 * 30
  response.cookies.set(COOKIE, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  })
  return response
}

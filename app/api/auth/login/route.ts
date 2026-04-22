import { NextResponse } from 'next/server'

const COOKIE = 'sac_token'
const USER_NAME_COOKIE = 'sac_user_name'

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

async function getUserFullName(base: string, personId: string) {
  const url = `${normalizeBackendOrigin(base)}/api/v1/users/?skip=0&limit=100`

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      return null
    }

    const users = (await response.json().catch(() => [])) as Array<{
      person_id: string
      full_name: string
    }>

    return users.find((user) => user.person_id === personId)?.full_name ?? null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const backendRaw = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000'
  const backend = normalizeBackendOrigin(backendRaw)

  // Logs de diagnóstico detallados
  // console.log('[API Login] ========== INICIO LOGIN ==========')
  // console.log('[API Login] BACKEND_URL env:', process.env.BACKEND_URL)
  // console.log('[API Login] BACKEND_URL usado:', backendRaw)
  // console.log('[API Login] Backend normalizado:', backend)
  // console.log('[API Login] NODE_ENV:', process.env.NODE_ENV)
  // console.log('[API Login] Request URL:', request.url)
  // console.log('[API Login] Request headers:', Object.fromEntries(request.headers.entries()))

  let body: { username?: string; password?: string }
  const contentType = request.headers.get('content-type') || ''

  try {
    if (contentType.includes('application/json')) {
      body = await request.json()
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      body = {
        username: formData.get('username')?.toString(),
        password: formData.get('password')?.toString()
      }
    } else {
      // Try JSON as default
      body = await request.json()
    }
    // console.log('[API Login] Body recibido:', { username: body.username, hasPassword: !!body.password })
  } catch (err) {
    console.error('[API Login] Error parseando body:', err)
    return NextResponse.json({ detail: 'Cuerpo inválido' }, { status: 400 })
  }

  const url = backendLoginUrl(backendRaw)
  // console.log('[API Login] URL backend completa:', url)
  // console.log('[API Login] Enviando petición al backend...')

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        person_id: body.username ?? '',
        password: body.password ?? '',
      }),
      cache: 'no-store',
    })
    // console.log('[API Login] Backend response status:', res.status)
    // console.log('[API Login] Backend response headers:', Object.fromEntries(res.headers.entries()))
  } catch (err) {
    console.error('[API Login] ERROR conectando al backend:', err)
    console.error('[API Login] Error details:', err instanceof Error ? err.message : String(err))
    return NextResponse.json(
      {
        detail:
          `No hay conexión con el API en ${backend}. Error: ${err instanceof Error ? err.message : String(err)}`,
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
  //  console.log('[API Login] access_token presente:', !!accessToken)
  //  console.log('[API Login] Data recibida del backend:', JSON.stringify(data, null, 2).substring(0, 500))

  if (!accessToken) {
    console.error('[API Login] ERROR: No se recibió access_token del backend')
    return NextResponse.json({ detail: 'Respuesta del servidor incompleta' }, { status: 502 })
  }

  // console.log('[API Login] Token recibido correctamente, configurando cookies...')

  const response = NextResponse.json({ ok: true })
  const maxAge = 60 * 30 // 30 minutos
  const fullName = body.username ? await getUserFullName(backendRaw, body.username) : null

  // Determinar configuración de cookies según el entorno
  const isProduction = process.env.NODE_ENV === 'production'
  const isSecure = isProduction // Secure solo en producción (requiere HTTPS)

  // console.log('[API Login] Configuración cookies:', {
  //   isProduction,
  //   isSecure,
  //   maxAge,
  //   hasToken: !!accessToken,
  //   fullName: fullName ?? body.username
  // })

  // Cookie del token (httpOnly - no accesible desde JavaScript)
  response.cookies.set(COOKIE, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure,
    path: '/',
    maxAge,
  })

  // Cookie del nombre de usuario (accesible desde JavaScript para mostrar en UI)
  response.cookies.set(USER_NAME_COOKIE, fullName ?? body.username ?? '', {
    httpOnly: false,
    sameSite: 'lax',
    secure: isSecure,
    path: '/',
    maxAge,
  })

  // console.log('[API Login] Cookies configuradas correctamente')
  // console.log('[API Login] ========== FIN LOGIN (EXITO) ==========')
  return response
}

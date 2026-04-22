import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const COOKIE = 'sac_token'

function normalizeBackendOrigin(raw: string): string {
  let u = raw.trim().replace(/\/+$/, '')
  if (u.endsWith('/api/v1')) {
    u = u.slice(0, -'/api/v1'.length).replace(/\/+$/, '')
  }
  return u
}

/**
 * POST proxy to backend POST /api/v1/users/ — requires admin JWT.
 * El navegador no llama al backend directo (evita CORS); enviamos el token en Authorization.
 */
export async function POST(request: Request) {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) {
    return NextResponse.json({ detail: 'No autorizado' }, { status: 401 })
  }

  const backendRaw = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000'
  const base = normalizeBackendOrigin(backendRaw)
  const url = `${base}/api/v1/users/`

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ detail: 'Cuerpo inválido' }, { status: 400 })
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status })
  }
  return NextResponse.json(data, { status: 201 })
}

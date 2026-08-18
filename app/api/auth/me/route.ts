import { decodeJwt, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const COOKIE = 'sac_token'
const USER_NAME_COOKIE = 'sac_user_name'

type MePayload = {
  id?: string | null
  username: string | null
  fullName?: string | null
  role?: string | null
}

type BackendMeResponse = {
  id?: string
  person_id: string
  full_name: string
  role: string
  email?: string
  is_active?: boolean
}

function normalizeBackendOrigin(raw: string): string {
  let u = raw.trim().replace(/\/+$/, '')
  if (u.endsWith('/api/v1')) {
    u = u.slice(0, -'/api/v1'.length).replace(/\/+$/, '')
  }
  return u
}

async function getUserInfoFromBackend(token: string): Promise<BackendMeResponse | null> {
  const backendRaw = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000'
  const url = `${normalizeBackendOrigin(backendRaw)}/api/v1/auth/me`

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      console.error('[API Me] Backend auth/me error:', response.status)
      return null
    }

    const user = (await response.json().catch(() => null)) as BackendMeResponse | null
    return user
  } catch (err) {
    console.error('[API Me] Error fetching from backend:', err)
    return null
  }
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE)?.value
  const storedUserName = cookieStore.get(USER_NAME_COOKIE)?.value
  if (!token) {
    return NextResponse.json({ username: null, fullName: null }, { status: 401 })
  }

  const secret = process.env.AUTH_JWT_SECRET
  let personId: string | null = null

  try {
    if (secret && process.env.NODE_ENV === 'production') {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
      personId = typeof payload.sub === 'string' ? payload.sub : null
    } else {
      const payload = decodeJwt(token)
      personId = typeof payload.sub === 'string' ? payload.sub : null
    }
  } catch {
    return NextResponse.json({ username: null, fullName: null }, { status: 401 })
  }

  if (!personId) {
    return NextResponse.json({ username: null, fullName: null }, { status: 401 })
  }

  const backendUser = await getUserInfoFromBackend(token)
  // console.log('[API Me] Backend user:', backendUser)

  const payload: MePayload = {
    id: backendUser?.id ?? null,
    username: personId,
    fullName: storedUserName || backendUser?.full_name || null,
    role: backendUser?.role || null,
  }

  // console.log('[API Me] Response payload:', payload)
  return NextResponse.json(payload)
}

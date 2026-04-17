import { decodeJwt, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const COOKIE = 'sac_token'
const USER_NAME_COOKIE = 'sac_user_name'

type MePayload = {
  username: string | null
  fullName?: string | null
}

type BackendUser = {
  person_id: string
  full_name: string
}

function normalizeBackendOrigin(raw: string): string {
  let u = raw.trim().replace(/\/+$/, '')
  if (u.endsWith('/api/v1')) {
    u = u.slice(0, -'/api/v1'.length).replace(/\/+$/, '')
  }
  return u
}

async function getUserFullName(personId: string): Promise<string | null> {
  const backendRaw = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000'
  const url = `${normalizeBackendOrigin(backendRaw)}/api/v1/users/?skip=0&limit=100`

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      return null
    }

    const users = (await response.json().catch(() => [])) as BackendUser[]
    const currentUser = users.find((user) => user.person_id === personId)
    return currentUser?.full_name ?? null
  } catch {
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

  const fullName = storedUserName || (await getUserFullName(personId))
  const payload: MePayload = {
    username: personId,
    fullName,
  }

  return NextResponse.json(payload)
}

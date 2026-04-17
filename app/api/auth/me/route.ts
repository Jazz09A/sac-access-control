import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const COOKIE = 'sac_token'

export async function GET() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) {
    return NextResponse.json({ username: null }, { status: 401 })
  }

  const secret = process.env.AUTH_JWT_SECRET
  if (!secret) {
    return NextResponse.json({ username: 'operador' })
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    const sub = payload.sub
    return NextResponse.json({
      username: typeof sub === 'string' ? sub : null,
    })
  } catch {
    return NextResponse.json({ username: null }, { status: 401 })
  }
}

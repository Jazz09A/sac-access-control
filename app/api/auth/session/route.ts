import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const COOKIE = 'sac_token'

export async function GET() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) {
    return NextResponse.json({ detail: 'No autenticado' }, { status: 401 })
  }
  return NextResponse.json({ access_token: token })
}

import { NextResponse } from 'next/server'

const COOKIE = 'sac_token'
const USER_NAME_COOKIE = 'sac_user_name'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  res.cookies.set(USER_NAME_COOKIE, '', { httpOnly: false, path: '/', maxAge: 0 })
  return res
}

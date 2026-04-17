import { jwtVerify } from 'jose'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE = 'sac_token'

export async function middleware(request: NextRequest) {
  const secret = process.env.AUTH_JWT_SECRET
  if (!secret) {
    console.warn('AUTH_JWT_SECRET no está definido; el login no validará el JWT en middleware.')
  }

  const { pathname } = request.nextUrl

  if (pathname === '/login') {
    const token = request.cookies.get(COOKIE)?.value
    if (token && secret) {
      try {
        await jwtVerify(token, new TextEncoder().encode(secret))
        return NextResponse.redirect(new URL('/', request.url))
      } catch {
        // token inválido: mostrar login
      }
    }
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE)?.value

  if (!secret) {
    if (pathname === '/login') {
      return token ? NextResponse.redirect(new URL('/', request.url)) : NextResponse.next()
    }
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  try {
    await jwtVerify(token, new TextEncoder().encode(secret))
    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL('/login', request.url))
    res.cookies.delete(COOKIE)
    return res
  }
}

export const config = {
  matcher: ['/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}

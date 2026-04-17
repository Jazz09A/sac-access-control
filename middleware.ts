import { jwtVerify } from 'jose'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE = 'sac_token'

export async function middleware(request: NextRequest) {
  const secret = process.env.AUTH_JWT_SECRET
  const { pathname } = request.nextUrl
  const token = request.cookies.get(COOKIE)?.value
  const shouldVerifyJwt = process.env.NODE_ENV === 'production' && !!secret

  // En desarrollo no validamos la firma del JWT del backend; basta con la cookie.
  if (!shouldVerifyJwt) {
    // En /login: si hay cookie, ir al dashboard
    if (pathname === '/login') {
      if (token) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      return NextResponse.next()
    }

    // En cualquier otra ruta: si no hay cookie, ir al login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
  }

  // Modo producción: verificar JWT
  if (pathname === '/login') {
    if (!token) {
      return NextResponse.next()
    }
    try {
      await jwtVerify(token, new TextEncoder().encode(secret!))
      return NextResponse.redirect(new URL('/', request.url))
    } catch {
      return NextResponse.next()
    }
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret!))
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

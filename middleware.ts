import { jwtVerify } from 'jose'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE = 'sac_token'

export async function middleware(request: NextRequest) {
  const secret = process.env.AUTH_JWT_SECRET
  const { pathname } = request.nextUrl
  const token = request.cookies.get(COOKIE)?.value
  const shouldVerifyJwt = process.env.NODE_ENV === 'production' && !!secret

  // Logs de debugging
  console.log('[Middleware] ========== REQUEST ==========')
  console.log('[Middleware] Path:', pathname)
  console.log('[Middleware] NODE_ENV:', process.env.NODE_ENV)
  console.log('[Middleware] hasToken:', !!token)
  console.log('[Middleware] tokenLength:', token?.length ?? 0)
  console.log('[Middleware] hasJwtSecret:', !!secret)
  console.log('[Middleware] shouldVerifyJwt:', shouldVerifyJwt)
  console.log('[Middleware] All cookies:', request.cookies.getAll().map(c => c.name))

  // En desarrollo no validamos la firma del JWT del backend; basta con la cookie.
  if (!shouldVerifyJwt) {
    console.log('[Middleware] Modo DESARROLLO - sin verificación JWT')

    // En /login: si hay cookie, ir al dashboard
    if (pathname === '/login') {
      if (token) {
        console.log('[Middleware] Login con token -> redirect a /')
        return NextResponse.redirect(new URL('/', request.url))
      }
      console.log('[Middleware] Login sin token -> permitir acceso')
      return NextResponse.next()
    }

    // En cualquier otra ruta: si no hay cookie, ir al login
    if (!token) {
      console.log('[Middleware] Ruta protegida sin token -> redirect a /login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    console.log('[Middleware] Ruta protegida con token -> permitir acceso')
    return NextResponse.next()
  }

  // Modo producción: verificar JWT
  console.log('[Middleware] Modo PRODUCCIÓN - con verificación JWT')

  if (pathname === '/login') {
    if (!token) {
      console.log('[Middleware] Login sin token -> permitir acceso')
      return NextResponse.next()
    }
    try {
      await jwtVerify(token, new TextEncoder().encode(secret!))
      console.log('[Middleware] Login con token válido -> redirect a /')
      return NextResponse.redirect(new URL('/', request.url))
    } catch (err) {
      console.log('[Middleware] Login con token inválido -> permitir acceso para nuevo login')
      return NextResponse.next()
    }
  }

  if (!token) {
    console.log('[Middleware] Ruta protegida sin token -> redirect a /login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret!))
    console.log('[Middleware] Token válido -> permitir acceso')
    return NextResponse.next()
  } catch (err) {
    console.log('[Middleware] Token inválido -> redirect a /login y borrar cookie')
    console.log('[Middleware] Error JWT:', err instanceof Error ? err.message : String(err))
    const res = NextResponse.redirect(new URL('/login', request.url))
    res.cookies.delete(COOKIE)
    return res
  }
}

export const config = {
  matcher: ['/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}

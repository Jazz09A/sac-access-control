import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()

  // Obtener todas las cookies
  const allCookies = cookieStore.getAll()

  // Buscar cookies específicas de la aplicación
  const sacToken = cookieStore.get('sac_token')
  const sacUserName = cookieStore.get('sac_user_name')

  const diagnostics = {
    timestamp: new Date().toISOString(),
    total_cookies: allCookies.length,
    cookie_names: allCookies.map(c => c.name),
    sac_token: {
      present: !!sacToken,
      length: sacToken?.value?.length ?? 0,
      preview: sacToken?.value ? `${sacToken.value.substring(0, 20)}...` : null,
    },
    sac_user_name: {
      present: !!sacUserName,
      value: sacUserName?.value ?? null,
    },
  }

  console.log('[Debug/Cookies] Diagnóstico de cookies:', diagnostics)

  return NextResponse.json(diagnostics)
}

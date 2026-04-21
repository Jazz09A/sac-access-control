import { NextResponse } from 'next/server'

export async function GET() {
  // Información de diagnóstico para debugging
  const diagnostics = {
    timestamp: new Date().toISOString(),
    node_env: process.env.NODE_ENV,
    environment: {
      has_backend_url: !!process.env.BACKEND_URL,
      backend_url_length: process.env.BACKEND_URL?.length ?? 0,
      has_public_backend_url: !!process.env.NEXT_PUBLIC_BACKEND_URL,
      public_backend_url_length: process.env.NEXT_PUBLIC_BACKEND_URL?.length ?? 0,
      has_jwt_secret: !!process.env.AUTH_JWT_SECRET,
      jwt_secret_length: process.env.AUTH_JWT_SECRET?.length ?? 0,
    },
    // No exponemos los valores reales por seguridad, solo los primeros caracteres
    preview: {
      backend_url_preview: process.env.BACKEND_URL ? `${process.env.BACKEND_URL.substring(0, 20)}...` : 'NO CONFIGURADO',
      public_backend_url_preview: process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL.substring(0, 20)}...` : 'NO CONFIGURADO',
      jwt_secret_preview: process.env.AUTH_JWT_SECRET ? `${process.env.AUTH_JWT_SECRET.substring(0, 5)}...` : 'NO CONFIGURADO',
    },
    is_production: process.env.NODE_ENV === 'production',
    cookies_will_be_secure: process.env.NODE_ENV === 'production',
  }

  console.log('[Debug/Env] Diagnóstico solicitado:', diagnostics)

  return NextResponse.json(diagnostics)
}

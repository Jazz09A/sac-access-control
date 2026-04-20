export class ApiError extends Error {
  status: number
  detail?: string

  constructor(message: string, status: number, detail?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

const getApiBaseUrl = () => {
  // Client-side: only NEXT_PUBLIC_* variables are available
  // Server-side: both NEXT_PUBLIC_BACKEND_URL and BACKEND_URL are available
  const isServer = typeof window === 'undefined'

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    || (isServer ? process.env.BACKEND_URL : undefined)
    || (isServer ? process.env.API_BASE_URL : undefined)

  if (!baseUrl) {
    const msg = isServer
      ? 'Falta configurar BACKEND_URL o NEXT_PUBLIC_BACKEND_URL en .env.local o .env'
      : 'Falta configurar NEXT_PUBLIC_BACKEND_URL en .env.local (requerido para el navegador)'
    throw new ApiError(msg, 500)
  }

  console.log('[API] baseUrl:', baseUrl)
  return baseUrl.replace(/\/+$/, '')
}

const buildUrl = (path: string) => `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers)

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
    cache: 'no-store',
  })

  if (!response.ok) {
    let detail: string | undefined

    try {
      const payload = await response.json()
      detail =
        typeof payload?.detail === 'string'
          ? payload.detail
          : typeof payload?.message === 'string'
            ? payload.message
            : undefined
    } catch {
      detail = undefined
    }

    throw new ApiError(
      detail || `La solicitud a la API falló con código ${response.status}.`,
      response.status,
      detail
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

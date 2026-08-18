const COOKIE = 'sac_token'

let cachedBrowserToken: string | null | undefined

export function clearAccessTokenCache() {
  cachedBrowserToken = undefined
}

export async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers')
      return (await cookies()).get(COOKIE)?.value ?? null
    } catch {
      return null
    }
  }

  if (cachedBrowserToken !== undefined) {
    return cachedBrowserToken
  }

  const response = await fetch('/api/auth/session', {
    cache: 'no-store',
    credentials: 'same-origin',
  })
  if (!response.ok) {
    cachedBrowserToken = null
    return null
  }

  const payload = (await response.json().catch(() => null)) as { access_token?: string } | null
  cachedBrowserToken = payload?.access_token ?? null
  return cachedBrowserToken
}

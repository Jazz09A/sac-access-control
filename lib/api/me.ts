export type SessionUser = {
  id: string | null
  role: string | null
  username: string | null
  fullName: string | null
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const response = await fetch('/api/auth/me', {
    cache: 'no-store',
    credentials: 'same-origin',
  })
  if (!response.ok) return null

  const payload = (await response.json().catch(() => null)) as {
    id?: string | null
    role?: string | null
    username?: string | null
    fullName?: string | null
  } | null

  if (!payload) return null

  return {
    id: typeof payload.id === 'string' && payload.id.trim() ? payload.id : null,
    role: payload.role ?? null,
    username: payload.username ?? null,
    fullName: payload.fullName ?? null,
  }
}

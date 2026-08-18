export const DEV_PREVIEW_STORAGE_KEY = 'sac_dev_preview_role'

export const DEV_PREVIEW_ROLES = ['gate', 'officer', 'manager', 'admin'] as const

export type DevPreviewRole = (typeof DEV_PREVIEW_ROLES)[number]

export const DEV_ROLE_HOME: Record<DevPreviewRole, string> = {
  gate: '/gate',
  officer: '/desk',
  manager: '/',
  admin: '/',
}

const NAV_HREFS_BY_ROLE: Record<DevPreviewRole, readonly string[] | null> = {
  gate: ['/gate'],
  officer: ['/desk'],
  manager: ['/', '/assets', '/search', '/fiscals', '/settings'],
  admin: null,
}

export function parseDevPreviewRole(value: string | null | undefined): DevPreviewRole | null {
  if (value === 'gate' || value === 'officer' || value === 'manager' || value === 'admin') {
    return value
  }
  return null
}

export function filterNavByPreviewRole<T extends { href: string }>(
  items: readonly T[],
  role: DevPreviewRole | null,
): T[] {
  if (!role || role === 'admin') return [...items]
  const allowed = NAV_HREFS_BY_ROLE[role]
  if (!allowed) return [...items]
  return items.filter((item) => allowed.includes(item.href))
}

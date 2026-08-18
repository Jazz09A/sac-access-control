'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import { DevRolePreviewBar } from '@/components/dev/dev-role-preview-bar'
import {
  DEV_PREVIEW_STORAGE_KEY,
  DEV_ROLE_HOME,
  parseDevPreviewRole,
  type DevPreviewRole,
} from '@/lib/dev-role-preview'

type DevRolePreviewContextValue = {
  role: DevPreviewRole | null
  setPreviewRole: (role: DevPreviewRole) => void
}

const DevRolePreviewContext = createContext<DevRolePreviewContextValue | null>(null)

const isDev = process.env.NODE_ENV === 'development'

export function DevRolePreviewProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [role, setRole] = useState<DevPreviewRole | null>(null)

  useEffect(() => {
    if (!isDev) return
    setRole(parseDevPreviewRole(sessionStorage.getItem(DEV_PREVIEW_STORAGE_KEY)))
    setMounted(true)
  }, [])

  const setPreviewRole = useCallback(
    (next: DevPreviewRole) => {
      if (!isDev) return
      sessionStorage.setItem(DEV_PREVIEW_STORAGE_KEY, next)
      setRole(next)
      router.push(DEV_ROLE_HOME[next])
    },
    [router],
  )

  const value = useMemo(
    () => ({ role, setPreviewRole }),
    [role, setPreviewRole],
  )

  return (
    <DevRolePreviewContext.Provider value={value}>
      {children}
      {isDev && mounted ? <DevRolePreviewBar role={role} onRoleChange={setPreviewRole} /> : null}
    </DevRolePreviewContext.Provider>
  )
}

export function useDevRolePreview() {
  const ctx = useContext(DevRolePreviewContext)
  if (!ctx) {
    return {
      role: null as DevPreviewRole | null,
      setPreviewRole: (_role: DevPreviewRole) => {},
    }
  }
  return ctx
}

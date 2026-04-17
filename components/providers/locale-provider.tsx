'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import type { AppLocale } from '@/lib/i18n-messages'
import { messages } from '@/lib/i18n-messages'

type LocaleContextValue = {
  locale: AppLocale
  setLocale: (l: AppLocale) => void
  t: (key: string) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale: AppLocale = 'es'

  const setLocale = useCallback((_l: AppLocale) => {
    // La interfaz queda fija en espanol por ahora.
  }, [])

  const t = useCallback(
    (key: string) => {
      return messages.es[key] ?? key
    },
    [],
  )

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    return {
      locale: 'es' as AppLocale,
      setLocale: (_: AppLocale) => {},
      t: (key: string) => messages.es[key] ?? key,
    }
  }
  return ctx
}

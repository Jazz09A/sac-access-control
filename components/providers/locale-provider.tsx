'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { AppLocale } from '@/lib/i18n-messages'
import { messages } from '@/lib/i18n-messages'

const STORAGE_KEY = 'sac_locale'

type LocaleContextValue = {
  locale: AppLocale
  setLocale: (l: AppLocale) => void
  t: (key: string) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>('es')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw === 'en' || raw === 'es') {
        setLocaleState(raw)
      }
    } catch {
      /* ignore */
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      /* ignore */
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale === 'en' ? 'en' : 'es'
    }
  }, [locale, hydrated])

  const setLocale = useCallback((l: AppLocale) => {
    setLocaleState(l)
  }, [])

  const t = useCallback(
    (key: string) => {
      const table = messages[locale] ?? messages.es
      return table[key] ?? messages.es[key] ?? key
    },
    [locale],
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

'use client'

import { LocaleProvider } from '@/components/providers/locale-provider'
import { ThemeProvider } from '@/components/theme-provider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <LocaleProvider>{children}</LocaleProvider>
    </ThemeProvider>
  )
}

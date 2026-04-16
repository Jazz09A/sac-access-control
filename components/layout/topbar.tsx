'use client'

import { useEffect, useState } from 'react'
import { Bell, Clock, Globe, Moon, Settings, Sun, User } from 'lucide-react'
import { formatDateTime, getVenezuelaTime } from '@/utils/formatters'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'

export function Topbar() {
  const [currentDateTime, setCurrentDateTime] = useState<string>('')
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    // Set initial time
    setCurrentDateTime(formatDateTime(getVenezuelaTime()))

    // Update time every minute
    const interval = setInterval(() => {
      setCurrentDateTime(formatDateTime(getVenezuelaTime()))
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const root = document.documentElement
    root.classList.add('theme-animating')
    setTheme(theme === 'dark' ? 'light' : 'dark')
    window.setTimeout(() => {
      root.classList.remove('theme-animating')
    }, 420)
  }

  return (
    <header className="border-b border-white/8 bg-background/80 backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:min-h-18 sm:px-5 lg:h-20 lg:px-8 lg:py-0">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Dashboard / Resumen
          </div>
          <h2 className="mt-1 truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl lg:mt-2 lg:text-2xl">
            Panel de Control
          </h2>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-sm font-medium text-muted-foreground lg:flex">
          <Clock className="h-4 w-4 text-primary" />
          <span>{currentDateTime}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={mounted && theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            className="inline-flex h-9 w-9 rounded-full border border-white/8 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground sm:h-10 sm:w-10"
          >
            {mounted && theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-white/8 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground sm:h-10 sm:w-10">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden h-10 w-10 rounded-full border border-white/8 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground md:flex">
            <Globe className="w-4 h-4" />
          </Button>
          <div className="ml-1 flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-1.5 py-1 sm:ml-2 sm:gap-3 sm:px-2 sm:py-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_18px_rgba(59,130,246,0.26)]">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden pr-2 sm:block">
              <p className="text-sm font-medium text-foreground">Admin</p>
              <p className="text-xs text-muted-foreground">Operador principal</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="hidden h-10 w-10 rounded-full border border-white/8 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground sm:inline-flex">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

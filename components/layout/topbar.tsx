'use client'

import { useEffect, useState } from 'react'
import { Bell, Clock, Globe, Moon, Settings, User } from 'lucide-react'
import { formatDateTime, getVenezuelaTime } from '@/utils/formatters'
import { Button } from '@/components/ui/button'

export function Topbar() {
  const [currentDateTime, setCurrentDateTime] = useState<string>('')

  useEffect(() => {
    // Set initial time
    setCurrentDateTime(formatDateTime(getVenezuelaTime()))

    // Update time every minute
    const interval = setInterval(() => {
      setCurrentDateTime(formatDateTime(getVenezuelaTime()))
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <header className="border-b border-white/8 bg-background/80 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-6 px-6 lg:px-8">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Dashboard / Resumen
          </div>
          <h2 className="mt-2 truncate text-2xl font-semibold tracking-tight text-foreground">
            Panel de Control
          </h2>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-sm font-medium text-muted-foreground lg:flex">
          <Clock className="h-4 w-4 text-primary" />
          <span>{currentDateTime}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-white/8 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground">
            <Moon className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-white/8 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden h-10 w-10 rounded-full border border-white/8 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground md:flex">
            <Globe className="w-4 h-4" />
          </Button>
          <div className="ml-2 flex items-center gap-3 rounded-full border border-white/8 bg-white/[0.03] px-2 py-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_18px_rgba(148,255,74,0.28)]">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden pr-2 sm:block">
              <p className="text-sm font-medium text-foreground">Admin</p>
              <p className="text-xs text-muted-foreground">Operador principal</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-white/8 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  ChevronDown,
  Clock,
  HelpCircle,
  LogOut,
  Moon,
  Settings,
  SlidersHorizontal,
  Sun,
  User,
} from 'lucide-react'
import { formatDateTime, getVenezuelaTime } from '@/utils/formatters'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { HelpDialog } from '@/components/layout/help-dialog'
import { useLocale } from '@/components/providers/locale-provider'
import { useTheme } from 'next-themes'

export function Topbar() {
  const router = useRouter()
  const { t } = useLocale()
  const [currentDateTime, setCurrentDateTime] = useState<string>('')
  const [mounted, setMounted] = useState(false)
  const [displayName, setDisplayName] = useState<string>('Operador')
  const [helpOpen, setHelpOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setCurrentDateTime(formatDateTime(getVenezuelaTime()))
    const interval = setInterval(() => {
      setCurrentDateTime(formatDateTime(getVenezuelaTime()))
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json().catch(() => ({}))
        if (!cancelled && res.ok && (data?.fullName || data?.username)) {
          const u = String(data.fullName ?? data.username)
          setDisplayName(u.charAt(0).toUpperCase() + u.slice(1))
        }
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const toggleTheme = () => {
    const root = document.documentElement
    root.classList.add('theme-animating')
    setTheme(theme === 'dark' ? 'light' : 'dark')
    window.setTimeout(() => {
      root.classList.remove('theme-animating')
    }, 420)
  }

  return (
    <>
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
      <header className="border-b border-white/8 bg-background/80 backdrop-blur-xl">
        <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:min-h-18 sm:px-5 lg:h-20 lg:px-8 lg:py-0">
          <div className="min-w-0">
            <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              {t('topbar.breadcrumb')}
            </div>
            <h2 className="mt-1 truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl lg:mt-2 lg:text-2xl">
              {t('topbar.title')}
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
              aria-label={mounted && theme === 'dark' ? t('topbar.lightMode') : t('topbar.darkMode')}
              className="inline-flex h-9 w-9 rounded-full border border-white/8 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground sm:h-10 sm:w-10"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled
              title={t('topbar.alertsTooltip')}
              aria-label={t('topbar.alertsTooltip')}
              className="h-9 w-9 rounded-full border border-white/8 bg-white/[0.03] text-muted-foreground opacity-70 sm:h-10 sm:w-10"
            >
              <Bell className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="ml-1 flex max-w-[220px] items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-1.5 py-1 text-left outline-none transition-colors hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-ring sm:ml-2 sm:gap-3 sm:px-2 sm:py-1.5"
                  aria-label={t('topbar.accountSubtitle')}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_18px_rgba(59,130,246,0.26)]">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="hidden min-w-0 flex-1 pr-1 sm:block">
                    <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{t('topbar.accountSubtitle')}</p>
                  </div>
                  <ChevronDown className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-60 rounded-2xl border-white/10 bg-popover/95 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                sideOffset={8}
              >
                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-normal text-muted-foreground">
                  {t('topbar.sessionLabel')}
                </DropdownMenuLabel>
                <div className="px-2 pb-2">
                  <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{t('topbar.role')}</p>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-xl py-2.5"
                  onClick={() => router.push('/settings#perfil')}
                >
                  <User className="h-4 w-4" />
                  {t('topbar.editProfile')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-xl py-2.5"
                  onClick={() => router.push('/settings#preferencias')}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {t('topbar.preferences')}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 rounded-xl py-2.5" disabled>
                  <Bell className="h-4 w-4 opacity-50" />
                  {t('topbar.notifications')}
                  <span className="ml-auto text-[10px] text-muted-foreground">{t('topbar.soon')}</span>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer gap-2 rounded-xl py-2.5">
                    <Settings className="h-4 w-4" />
                    {t('topbar.moreSettings')}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="rounded-xl border-white/10 bg-popover/95 p-2 backdrop-blur-xl">
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 rounded-lg py-2"
                      onClick={() => router.push('/settings#idioma-region')}
                    >
                      <Settings className="h-4 w-4" />
                      {t('topbar.languageRegion')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 rounded-lg py-2"
                      onClick={() => setHelpOpen(true)}
                    >
                      <HelpCircle className="h-4 w-4" />
                      {t('topbar.helpShortcuts')}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer gap-2 rounded-xl py-2.5">
                    {mounted && theme === 'dark' ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4" />
                    )}
                    {t('topbar.appearance')}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="rounded-xl border-white/10 bg-popover/95 p-2 backdrop-blur-xl">
                    <DropdownMenuRadioGroup
                      value={mounted ? (theme ?? 'dark') : 'dark'}
                      onValueChange={(v) => setTheme(v)}
                    >
                      <DropdownMenuRadioItem value="light" className="rounded-lg">
                        {t('topbar.lightMode')}
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dark" className="rounded-lg">
                        {t('topbar.darkMode')}
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer gap-2 rounded-xl py-2.5 focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  {t('topbar.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  )
}

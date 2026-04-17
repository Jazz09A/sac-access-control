'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  LogIn,
  Search,
  Settings,
  ShieldCheck,
  Command,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/components/providers/locale-provider'

const navConfig = [
  { href: '/', msgKey: 'nav.dashboard' as const, icon: LayoutDashboard },
  { href: '/entry', msgKey: 'nav.entry' as const, icon: LogIn },
  { href: '/search', msgKey: 'nav.search' as const, icon: Search },
  { href: '/settings', msgKey: 'nav.settings' as const, icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useLocale()

  return (
    <aside className="hidden min-h-full w-[248px] flex-col border-r border-white/8 bg-sidebar px-3 py-4 lg:flex xl:w-[272px] xl:px-4 xl:py-5">
      <div className="border-b border-white/8 px-3 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_24px_rgba(59,130,246,0.32)]">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">{t('sidebar.brand')}</h1>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              {t('sidebar.subtitle')}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/6 bg-white/[0.03] p-3">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>{t('sidebar.shift')}</span>
            <Command className="size-3.5" />
          </div>
          <p className="mt-3 text-sm font-medium text-sidebar-foreground">{t('sidebar.shiftTitle')}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{t('sidebar.shiftDesc')}</p>
        </div>
      </div>

      <div className="px-3 pb-3 pt-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {t('sidebar.nav')}
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {navConfig.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  'h-12 w-full justify-start gap-3 rounded-2xl px-4 text-sm transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-[0_0_28px_rgba(59,130,246,0.26)] hover:bg-primary/95'
                    : 'text-muted-foreground hover:bg-white/[0.04] hover:text-sidebar-foreground',
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
                {t(item.msgKey)}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/8 px-3 pt-5">
        <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-primary">
            <Sparkles className="size-3.5" />
            {t('sidebar.system')}
          </div>
          <p className="mt-3 text-sm font-medium text-sidebar-foreground">{t('sidebar.systemVersion')}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{t('sidebar.systemDesc')}</p>
        </div>
      </div>
    </aside>
  )
}

export function MobileNav() {
  const pathname = usePathname()
  const { t } = useLocale()

  return (
    <div className="border-b border-white/8 px-4 py-3 lg:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {navConfig.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href} className="shrink-0">
              <Button
                variant="ghost"
                className={cn(
                  'h-10 rounded-xl px-3 text-sm',
                  isActive
                    ? 'bg-primary text-primary-foreground hover:bg-primary/95'
                    : 'border border-white/8 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {t(item.msgKey)}
              </Button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

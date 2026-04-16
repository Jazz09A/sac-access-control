'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  LogIn,
  Search,
  Users,
  ShieldCheck,
  Command,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard
  },
  {
    name: 'Registrar Entrada',
    href: '/entry',
    icon: LogIn
  },
  {
    name: 'Buscar Visitas',
    href: '/search',
    icon: Search
  },
  {
    name: 'Contribuyentes',
    href: '/contributors',
    icon: Users
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden min-h-full w-[248px] flex-col border-r border-white/8 bg-sidebar px-3 py-4 lg:flex xl:w-[272px] xl:px-4 xl:py-5">
      <div className="border-b border-white/8 px-3 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_24px_rgba(148,255,74,0.35)]">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">Control de Ingresos</h1>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Consola administrativa
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/6 bg-white/[0.03] p-3">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>Turno activo</span>
            <Command className="size-3.5" />
          </div>
          <p className="mt-3 text-sm font-medium text-sidebar-foreground">
            Operacion de acceso
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Monitoreo continuo de entradas, permanencia y salida de contribuyentes.
          </p>
        </div>
      </div>

      <div className="px-3 pb-3 pt-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Navegacion
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  'h-12 w-full justify-start gap-3 rounded-2xl px-4 text-sm transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-[0_0_28px_rgba(148,255,74,0.24)] hover:bg-primary/95'
                    : 'text-muted-foreground hover:bg-white/[0.04] hover:text-sidebar-foreground'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/8 px-3 pt-5">
        <div className="rounded-2xl border border-white/6 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-primary">
            <Sparkles className="size-3.5" />
            Estado del sistema
          </div>
          <p className="mt-3 text-sm font-medium text-sidebar-foreground">Sistema v1.0</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Consola preparada para seguimiento diario y trazabilidad operativa.
          </p>
        </div>
      </div>
    </aside>
  )
}

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="border-b border-white/8 px-4 py-3 lg:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href} className="shrink-0">
              <Button
                variant="ghost"
                className={cn(
                  'h-10 rounded-xl px-3 text-sm',
                  isActive
                    ? 'bg-primary text-primary-foreground hover:bg-primary/95'
                    : 'border border-white/8 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

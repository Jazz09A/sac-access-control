'use client'

import Link from 'next/link'
import { Package, ScanFace, Ticket } from 'lucide-react'
import { useLocale } from '@/components/providers/locale-provider'

const stations = [
  {
    href: '/gate',
    titleKey: 'dashboard.cta.gateTitle',
    lineKey: 'dashboard.cta.gateLabel',
    icon: ScanFace,
  },
  {
    href: '/desk',
    titleKey: 'dashboard.cta.deskTitle',
    lineKey: 'dashboard.cta.deskLabel',
    icon: Ticket,
  },
  {
    href: '/assets',
    titleKey: 'dashboard.cta.assetsTitle',
    lineKey: 'dashboard.cta.assetsLabel',
    icon: Package,
  },
] as const

export function StationShortcuts() {
  const { t } = useLocale()

  return (
    <section aria-labelledby="dashboard-stations-title">
      <h2 id="dashboard-stations-title" className="mb-2 text-xs text-muted-foreground">
        {t('dashboard.stationsLabel')}
      </h2>
      <nav className="flex flex-col rounded-lg border border-white/8 bg-white/[0.03] sm:flex-row">
        {stations.map((station, index) => {
          const Icon = station.icon
          return (
            <Link
              key={station.href}
              href={station.href}
              className={`flex min-w-0 flex-1 items-center gap-3 px-4 py-2.5 outline-none transition-colors hover:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-primary ${
                index > 0 ? 'border-t border-white/8 sm:border-t-0 sm:border-l' : ''
              }`}
            >
              <Icon className="size-4 shrink-0 text-primary" aria-hidden />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {t(station.titleKey)}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {t(station.lineKey)}
                </span>
              </span>
            </Link>
          )
        })}
      </nav>
    </section>
  )
}

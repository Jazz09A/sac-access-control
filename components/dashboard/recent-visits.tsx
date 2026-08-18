'use client'

import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/components/providers/locale-provider'
import { Visit, VisitStatus } from '@/types'
import { formatTimeAgoLocaleFromStrings } from '@/utils/formatters'
import { Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecentVisitsProps {
  visits: Visit[]
  isLoading?: boolean
}

export function RecentVisits({ visits, isLoading = false }: RecentVisitsProps) {
  const { t, locale } = useLocale()

  const statusClasses: Record<VisitStatus, string> = {
    [VisitStatus.WAITING]: 'text-yellow-200',
    [VisitStatus.IN_SERVICE]: 'text-sky-200',
    [VisitStatus.ATTENDED]: 'text-emerald-200',
    [VisitStatus.INCOMPLETE]: 'text-orange-200',
    [VisitStatus.REFERRED]: 'text-violet-200',
    [VisitStatus.FINISHED]: 'text-green-200',
  }

  const statusLabel = (s: VisitStatus) => t(`dashboard.status.${s}`)

  return (
    <section className="rounded-lg border border-white/8 bg-white/[0.03]" aria-labelledby="dashboard-recent-title">
      <div className="px-4 py-3">
        <p className="text-xs text-muted-foreground">{t('recent.sectionLabel')}</p>
        <h2 id="dashboard-recent-title" className="text-sm font-medium text-foreground">
          {t('recent.title')}
        </h2>
      </div>
      {isLoading ? (
        <ul className="border-t border-white/8" aria-busy="true">
          {[...Array(4)].map((_, i) => (
            <li key={i} className="px-4 py-2.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </li>
          ))}
        </ul>
      ) : visits.length === 0 ? (
        <p className="border-t border-white/8 px-4 py-4 text-sm text-muted-foreground">{t('recent.empty')}</p>
      ) : (
        <ul>
          {visits.map((visit) => (
            <li key={visit.id} className="flex items-center justify-between gap-3 border-t border-white/8 px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <p className="min-w-0 truncate text-sm font-medium text-foreground">
                    {visit.contributor_name}
                  </p>
                  <span className={cn('text-xs', statusClasses[visit.status])}>
                    {statusLabel(visit.status)}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {formatTimeAgoLocaleFromStrings(visit.entry_date, visit.entry_time, locale)}
                  {visit.reason ? ` · ${visit.reason}` : ''}
                  {visit.department ? ` · ${visit.department}` : ''}
                </p>
              </div>
              <Link
                href={`/${visit.id}`}
                className="shrink-0 rounded-md p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Eye className="size-4" aria-hidden />
                <span className="sr-only">{visit.contributor_name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

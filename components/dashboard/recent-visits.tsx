'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/components/providers/locale-provider'
import { Visit, VisitStatus } from '@/types'
import { formatTimeAgoLocaleFromStrings } from '@/utils/formatters'
import { Eye, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecentVisitsProps {
  visits: Visit[]
  isLoading?: boolean
}

export function RecentVisits({ visits, isLoading = false }: RecentVisitsProps) {
  const { t, locale } = useLocale()

  const statusClasses: Record<VisitStatus, string> = {
    [VisitStatus.WAITING]: 'border-yellow-400/15 bg-yellow-400/10 text-yellow-200',
    [VisitStatus.ATTENDED]: 'border-emerald-400/15 bg-emerald-400/10 text-emerald-200',
    [VisitStatus.FINISHED]: 'border-green-400/15 bg-green-400/10 text-green-200',
  }

  const statusLabel = (s: VisitStatus) => t(`dashboard.status.${s}`)

  return (
    <Card className="h-full gap-3 bg-white/[0.03] py-4">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {t('recent.sectionLabel')}
            </p>
            <CardTitle className="mt-2 text-xl font-medium tracking-tight">{t('recent.title')}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-full border border-white/8 bg-white/[0.03] text-muted-foreground hover:text-foreground"
            aria-hidden
          >
            <ArrowUpRight className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border/60 p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : visits.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t('recent.empty')}</p>
          ) : (
            visits.map((visit) => (
              <div
                key={visit.id}
                className="group flex items-center justify-between rounded-xl border border-border/60 p-3 transition-all hover:border-primary/30 hover:bg-primary/[0.02]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <h4 className="min-w-0 truncate text-sm font-semibold transition-colors group-hover:text-primary">
                      {visit.contributor_name}
                    </h4>
                    <Badge
                      variant="outline"
                      className={cn(
                        'h-5 border px-2 py-0 text-[10px] font-medium uppercase tracking-[0.14em]',
                        statusClasses[visit.status],
                      )}
                    >
                      {statusLabel(visit.status)}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-col gap-0.5">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {formatTimeAgoLocaleFromStrings(visit.entry_date, visit.entry_time, locale)}
                    </p>
                    <p className="line-clamp-1 text-[11px] text-muted-foreground">{visit.reason}</p>
                    <p className="text-[11px] text-foreground/70">{visit.department}</p>
                  </div>
                </div>
                <Link href={`/${visit.id}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full border border-white/8 bg-white/[0.03] opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

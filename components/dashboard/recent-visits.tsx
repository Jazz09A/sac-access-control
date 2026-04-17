'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/components/providers/locale-provider'
import { Visit, VisitStatus } from '@/types'
import { formatTimeAgoLocale } from '@/utils/formatters'
import { Eye, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecentVisitsProps {
  visits: Visit[]
}

export function RecentVisits({ visits }: RecentVisitsProps) {
  const { t, locale } = useLocale()

  const statusClasses: Record<VisitStatus, string> = {
    [VisitStatus.ACTIVE]: 'border-primary/20 bg-primary/10 text-primary',
    [VisitStatus.CLOSED]: 'border-white/8 bg-white/[0.04] text-foreground/80',
    [VisitStatus.PENDING]: 'border-amber-400/15 bg-amber-400/10 text-amber-200',
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
          {visits.length === 0 ? (
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
                      {visit.contributor.name}
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
                      {formatTimeAgoLocale(visit.entryDateTime, locale)}
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

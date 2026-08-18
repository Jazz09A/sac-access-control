'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/components/providers/locale-provider'
import { Visit, VisitStatus } from '@/types'

interface OfficerRow {
  name: string
  count: number
}

function groupAttentions(visits: Visit[], unassignedLabel: string): OfficerRow[] {
  const counts = new Map<string, number>()

  for (const visit of visits) {
    if (visit.status === VisitStatus.WAITING) continue
    const name = (visit.fiscal_name || visit.received_by || '').trim() || unassignedLabel
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

interface OfficerPerformanceProps {
  visits: Visit[]
  isLoading: boolean
  error?: string | null
  onRetry?: () => void
}

export function OfficerPerformance({ visits, isLoading, error, onRetry }: OfficerPerformanceProps) {
  const { t } = useLocale()
  const rows = groupAttentions(visits, t('dashboard.officerUnassigned'))

  return (
    <Card className="gap-3 rounded-lg bg-white/[0.03] py-3">
      <CardHeader className="px-4 pb-0">
        <p className="text-xs text-muted-foreground">{t('dashboard.officerLabel')}</p>
        <CardTitle className="text-sm font-medium">{t('dashboard.officerTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-2">
        {isLoading ? (
          <div className="space-y-2" aria-busy="true">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-8 w-full rounded-md" />
            ))}
          </div>
        ) : error ? (
          <div className="space-y-3">
            <p className="text-sm text-red-300" role="alert">
              {error}
            </p>
            {onRetry ? (
              <Button type="button" variant="outline" onClick={onRetry}>
                {t('dashboard.retry')}
              </Button>
            ) : null}
          </div>
        ) : rows.length === 0 ? (
          <p className="py-3 text-sm text-muted-foreground">{t('dashboard.officerEmpty')}</p>
        ) : (
          <ul>
            {rows.map((row) => (
              <li key={row.name} className="flex items-center justify-between gap-3 py-1.5">
                <p className="truncate text-sm font-medium text-foreground">{row.name}</p>
                <p className="shrink-0 text-sm tabular-nums text-muted-foreground">
                  {row.count} {t('dashboard.officerCount')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

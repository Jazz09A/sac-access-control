'use client'

import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/components/providers/locale-provider'
import { formatClockSeconds } from '@/utils/formatters'
import type { VisitDayMetrics } from '@/services/visits'

const CONGESTION_WAITING = 8
const CONGESTION_WAIT_SECONDS = 900

interface OperationsMetricsProps {
  metrics: VisitDayMetrics | null
  isLoading: boolean
}

export function isCongested(metrics: VisitDayMetrics | null): boolean {
  if (!metrics) return false
  const avgWait = metrics.avg_wait_seconds ?? 0
  return metrics.waiting >= CONGESTION_WAITING || avgWait >= CONGESTION_WAIT_SECONDS
}

export function OperationsMetrics({
  metrics,
  isLoading,
}: OperationsMetricsProps) {
  const { t } = useLocale()
  const congested = isCongested(metrics)

  const rows = [
    { key: 'dashboard.timesWait', value: metrics?.avg_wait_seconds },
    { key: 'dashboard.timesAttention', value: metrics?.avg_attention_seconds },
    { key: 'dashboard.timesStay', value: metrics?.avg_stay_seconds },
  ]

  return (
    <section
      className={
        congested && !isLoading
          ? 'rounded-lg border border-amber-400/30 bg-amber-500/10 p-4'
          : 'rounded-lg border border-white/8 bg-white/[0.03] p-4'
      }
      aria-labelledby="dashboard-times-title"
    >
      <h2 id="dashboard-times-title" className="text-sm font-medium text-foreground">
        {t('dashboard.timesTitle')}
      </h2>
      <ul className="mt-2">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-3 py-1.5">
            <p className="text-sm text-muted-foreground">{t(row.key)}</p>
            {isLoading ? (
              <Skeleton className="h-5 w-14" />
            ) : (
              <p className="font-mono text-sm tabular-nums text-foreground">
                {formatClockSeconds(row.value)}
              </p>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-start gap-2 border-t border-white/8 pt-2 text-sm">
        {isLoading ? (
          <Skeleton className="h-5 w-48" />
        ) : congested ? (
          <>
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden />
            <span>
              <span className="font-medium text-foreground">{t('dashboard.congestionYes')}</span>
              <span className="text-muted-foreground">
                {' · '}
                {t('dashboard.congestionYesBody').replace('{waiting}', String(metrics?.waiting ?? 0))}
              </span>
            </span>
          </>
        ) : (
          <>
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" aria-hidden />
            <span>
              <span className="font-medium text-foreground">{t('dashboard.congestionNo')}</span>
              <span className="text-muted-foreground">
                {' · '}
                {t('dashboard.congestionNoBody')}
              </span>
            </span>
          </>
        )}
      </div>
    </section>
  )
}

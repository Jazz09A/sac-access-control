'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/components/providers/locale-provider'
import type { VisitDayMetrics } from '@/services/visits'

interface PipelineStage {
  key: string
  labelKey: string
  value: number | null
}

interface DayPipelineProps {
  metrics: VisitDayMetrics | null
  incompleteCount: number | null
  isLoading: boolean
  error: string | null
  incompleteError: string | null
  onRetry: () => void
}

export function DayPipeline({
  metrics,
  incompleteCount,
  isLoading,
  error,
  incompleteError,
  onRetry,
}: DayPipelineProps) {
  const { t } = useLocale()

  const waiting = metrics?.waiting ?? 0
  const inService = metrics?.in_service ?? 0
  const closed = metrics?.closed ?? 0
  const exited = metrics?.exited ?? 0
  const onPremises = waiting + inService + closed

  const stages: PipelineStage[] = [
    { key: 'waiting', labelKey: 'dashboard.pipeline.waiting', value: metrics ? waiting : null },
    { key: 'desk', labelKey: 'dashboard.pipeline.desk', value: metrics ? inService : null },
    { key: 'onPremises', labelKey: 'dashboard.pipeline.onPremises', value: metrics ? onPremises : null },
    { key: 'incomplete', labelKey: 'dashboard.pipeline.incomplete', value: incompleteCount },
    { key: 'exited', labelKey: 'dashboard.pipeline.exited', value: metrics ? exited : null },
  ]

  const allZero =
    Boolean(metrics) &&
    waiting === 0 &&
    inService === 0 &&
    onPremises === 0 &&
    (incompleteCount ?? 0) === 0 &&
    exited === 0

  if (error && !metrics) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground" role="alert">
          {error}
        </p>
        <Button variant="outline" onClick={onRetry}>
          {t('dashboard.retry')}
        </Button>
      </div>
    )
  }

  return (
    <section className="rounded-lg border border-white/8 bg-white/[0.03] p-4" aria-labelledby="dashboard-pipeline-title">
      <h2 id="dashboard-pipeline-title" className="text-sm font-medium text-foreground">
        {t('dashboard.pipelineTitle')}
      </h2>
      <dl className="mt-3 flex flex-col sm:flex-row" aria-busy={isLoading}>
        {stages.map((stage, index) => (
          <div
            key={stage.key}
            className={`flex min-w-0 flex-1 items-baseline gap-2 py-1.5 sm:px-3 sm:py-0 ${
              index > 0 ? 'border-t border-white/8 sm:border-t-0 sm:border-l' : 'sm:pl-0'
            } ${index === stages.length - 1 ? 'sm:pr-0' : ''}`}
          >
            <dd className="text-xl font-semibold tabular-nums text-foreground">
              {isLoading && stage.value === null ? (
                <Skeleton className="inline-block h-6 w-8" />
              ) : stage.value === null ? (
                '—'
              ) : (
                stage.value
              )}
            </dd>
            <dt className="truncate text-xs text-muted-foreground">{t(stage.labelKey)}</dt>
          </div>
        ))}
      </dl>
      {incompleteError ? (
        <p className="mt-2 text-xs text-muted-foreground" role="status">
          {incompleteError}
        </p>
      ) : null}
      {!isLoading && allZero ? (
        <p className="mt-2 text-sm text-muted-foreground">{t('dashboard.pipelineEmpty')}</p>
      ) : null}
    </section>
  )
}

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { RecentVisits } from '@/components/dashboard/recent-visits'
import { OperationsMetrics } from '@/components/dashboard/operations-metrics'
import { RifTrace } from '@/components/dashboard/rif-trace'
import { OfficerPerformance } from '@/components/dashboard/officer-performance'
import { StationShortcuts } from '@/components/dashboard/station-shortcuts'
import { DayPipeline } from '@/components/dashboard/day-pipeline'
import { useLocale } from '@/components/providers/locale-provider'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { VisitStatus, type Visit } from '@/types'
import {
  getDashboardAdvanced,
  getVisitDayMetrics,
  getVisits,
  type UltimaActividad,
  type DashboardAdvancedResponse,
  type VisitDayMetrics,
} from '@/services/visits'
import { useVisitLiveRefresh } from '@/hooks/use-visit-live'
import { getVenezuelaDate } from '@/utils/formatters'
import { toast } from 'sonner'

function transformActividadToVisit(actividad: UltimaActividad, date: string): Visit {
  return {
    id: actividad.id,
    contributor_id: 0,
    contributor_name: actividad.contribuyente,
    fiscal_id: 0,
    fiscal_name: undefined,
    reason: actividad.motivo,
    observations: undefined,
    received_by: actividad.responsable,
    responsible_person: actividad.responsable,
    department: '',
    file_number: undefined,
    entry_date: date,
    entry_time: actividad.entry_time,
    exit_date: undefined,
    exit_time: undefined,
    signature_image_url: undefined,
    status: actividad.status,
    created_at: `${date}T${actividad.entry_time}`,
  }
}

export default function DashboardPage() {
  const { t } = useLocale()
  const [dashboardData, setDashboardData] = useState<DashboardAdvancedResponse | null>(null)
  const [metrics, setMetrics] = useState<VisitDayMetrics | null>(null)
  const [todayVisits, setTodayVisits] = useState<Visit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState<string | null>(null)
  const [metricsError, setMetricsError] = useState<string | null>(null)
  const [visitsError, setVisitsError] = useState<string | null>(null)
  const hasLoadedRef = useRef(false)

  const loadDashboard = useCallback(async () => {
    const silent = hasLoadedRef.current
    if (!silent) setIsLoading(true)

    const today = getVenezuelaDate()
    const [advancedResult, metricsResult, visitsResult] = await Promise.allSettled([
      getDashboardAdvanced(),
      getVisitDayMetrics(today),
      getVisits({ entry_date: today, limit: 200 }),
    ])

    if (advancedResult.status === 'fulfilled') {
      setDashboardData(advancedResult.value)
      setDashboardError(null)
    } else if (!silent) {
      setDashboardError(t('error.loading'))
      toast.error(t('error.loading'))
    }

    if (metricsResult.status === 'fulfilled') {
      setMetrics(metricsResult.value)
      setMetricsError(null)
    } else {
      setMetricsError(t('dashboard.metricsError'))
    }

    if (visitsResult.status === 'fulfilled') {
      setTodayVisits(visitsResult.value.data)
      setVisitsError(null)
    } else {
      setVisitsError(t('dashboard.officerError'))
    }

    hasLoadedRef.current = true
    setIsLoading(false)
  }, [t])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  useVisitLiveRefresh(loadDashboard)

  const statusLabel = (s: VisitStatus) => t(`dashboard.status.${s}`)

  const recentVisits: Visit[] = (dashboardData?.ultimas_actividades ?? []).map(actividad =>
    transformActividadToVisit(actividad, dashboardData?.date ?? new Date().toISOString().split('T')[0])
  )

  const incompleteCount =
    visitsError || (isLoading && todayVisits.length === 0)
      ? null
      : todayVisits.filter((visit) => visit.status === VisitStatus.INCOMPLETE).length

  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-3 p-4">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">{t('dashboard.heading')}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('dashboard.intro')}</p>
      </header>

      <StationShortcuts />

      <DayPipeline
        metrics={metrics}
        incompleteCount={incompleteCount}
        isLoading={isLoading && !metrics}
        error={metricsError}
        incompleteError={visitsError ? t('dashboard.pipelineIncompleteError') : null}
        onRetry={() => void loadDashboard()}
      />

      {dashboardError && !dashboardData ? (
        <div className="flex flex-col gap-3 rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground">{dashboardError}</p>
          <Button variant="outline" onClick={() => void loadDashboard()}>
            {t('error.tryAgain')}
          </Button>
        </div>
      ) : null}

      {metrics || !metricsError ? (
        <OperationsMetrics
          metrics={metrics}
          isLoading={isLoading && !metrics}
        />
      ) : null}

      <div className="grid gap-3 xl:grid-cols-2">
        <RifTrace />
        <OfficerPerformance
          visits={todayVisits}
          isLoading={isLoading && todayVisits.length === 0 && !visitsError}
          error={visitsError}
          onRetry={() => void loadDashboard()}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.95fr)]">
        <section className="rounded-lg border border-white/8 bg-white/[0.03]" aria-labelledby="dashboard-trace-title">
          <div className="flex items-baseline justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">{t('dashboard.traceLabel')}</p>
              <h2 id="dashboard-trace-title" className="text-sm font-medium text-foreground">
                {t('dashboard.traceTitle')}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading
                ? t('dashboard.recordsCount').replace('{n}', '-')
                : t('dashboard.recordsCount').replace('{n}', String(recentVisits.length))}
            </p>
          </div>
          {isLoading ? (
            <ul className="border-t border-white/8" aria-busy="true">
              {[...Array(4)].map((_, i) => (
                <li key={i} className="px-4 py-2.5">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                </li>
              ))}
            </ul>
          ) : recentVisits.length === 0 ? (
            <p className="border-t border-white/8 px-4 py-4 text-sm text-muted-foreground">
              {t('dashboard.recentEmpty')}
            </p>
          ) : (
            <ul>
              {recentVisits.slice(0, 4).map((visit) => (
                <li
                  key={visit.id}
                  className="flex items-center justify-between gap-3 border-t border-white/8 px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {visit.contributor_name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {visit.reason || '-'}
                      {' · '}
                      {visit.department || '-'}
                      {' · '}
                      {visit.fiscal_name || visit.received_by || '-'}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {statusLabel(visit.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <RecentVisits visits={recentVisits} isLoading={isLoading} />
      </div>
    </div>
  )
}

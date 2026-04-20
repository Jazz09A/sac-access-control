'use client'

import { useEffect, useState } from 'react'
import { Users, LogIn, LogOut, Clock, Activity, ShieldCheck } from 'lucide-react'
import { MetricsCard } from '@/components/dashboard/metrics-card'
import { RecentVisits } from '@/components/dashboard/recent-visits'
import { useLocale } from '@/components/providers/locale-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { VisitStatus, type Visit } from '@/types'
import { getDashboardAdvanced, type UltimaActividad, type DashboardAdvancedResponse } from '@/services/visits'
import { toast } from 'sonner'

// Transform UltimaActividad from API to Visit format for RecentVisits component
function transformActividadToVisit(actividad: UltimaActividad, date: string): Visit {
  return {
    id: `${actividad.rif}-${actividad.entry_time}`, // Generate unique id from rif + time
    contributor_id: 0, // Not provided by dashboard API
    contributor_name: actividad.contribuyente,
    fiscal_id: 0, // Not provided by this endpoint
    fiscal_name: undefined,
    reason: actividad.motivo,
    observations: undefined,
    received_by: actividad.responsable,
    responsible_person: actividad.responsable,
    department: '', // Not provided by this endpoint
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true)
        const data = await getDashboardAdvanced()
        setDashboardData(data)
      } catch (error) {
        console.error('Error loading dashboard:', error)
        toast.error('Error al cargar los datos del dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const statusLabel = (s: VisitStatus) => t(`dashboard.status.${s}`)

  // Transform ultimas_actividades to Visit format
  const recentVisits: Visit[] = (dashboardData?.ultimas_actividades ?? []).map(actividad =>
    transformActividadToVisit(actividad, dashboardData?.date ?? new Date().toISOString().split('T')[0])
  )

  // Calculate metrics from API data
  const entriesToday = dashboardData?.entradas_dia?.hoy ?? 0
  const currentlyInside = dashboardData?.personas_dentro?.actual ?? 0
  const attendedVisits = dashboardData?.visitas_atendidas ?? 0
  const pendingVisits = dashboardData?.visitas_pendientes ?? 0
  const comparisonPct = dashboardData?.entradas_dia?.porcentaje_cambio ?? 0

  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 p-4 sm:p-5 lg:gap-6 lg:p-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
            <ShieldCheck className="size-3.5" />
            {t('dashboard.executiveBadge')}
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
              {t('dashboard.heading')}
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              {t('dashboard.intro')}
            </p>
          </div>
        </div>

        <Card className="bg-[linear-gradient(180deg,rgba(59,130,246,0.22),rgba(59,130,246,0.08))] py-4">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary/90">
                  {t('dashboard.statusLabel')}
                </p>
                <CardTitle className="mt-2 text-xl font-medium">{t('dashboard.currentActivity')}</CardTitle>
              </div>
              <Activity className="size-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[auto_1fr] sm:items-end sm:gap-x-4">
              {isLoading ? (
                <Skeleton className="h-12 w-16" />
              ) : (
                <p className="text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
                  {currentlyInside}
                </p>
              )}
              <p className="text-sm leading-5 text-foreground/80 sm:pb-1">
                {t('dashboard.taxpayersInDivision')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricsCard
          title={t('dashboard.metric.entriesTitle')}
          value={isLoading ? '-' : entriesToday}
          icon={LogIn}
          description={t('dashboard.metric.entriesDesc')}
          trend={{ value: comparisonPct, label: t('dashboard.trend.vsYesterday') }}
          isLoading={isLoading}
        />
        <MetricsCard
          title={t('dashboard.metric.insideTitle')}
          value={isLoading ? '-' : currentlyInside}
          icon={Users}
          description={t('dashboard.metric.insideDesc')}
          trend={{ value: -5, label: t('dashboard.trend.vsLastHour') }}
          isLoading={isLoading}
        />
        <MetricsCard
          title={t('dashboard.metric.attendedTitle')}
          value={isLoading ? '-' : attendedVisits}
          icon={LogOut}
          description={t('dashboard.metric.attendedDesc')}
          isLoading={isLoading}
        />
        <MetricsCard
          title={t('dashboard.metric.pendingTitle')}
          value={isLoading ? '-' : pendingVisits}
          icon={Clock}
          description={t('dashboard.metric.pendingDesc')}
          trend={{ value: 1, label: t('dashboard.trend.newToday') }}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.95fr)]">
        <Card className="bg-white/[0.03] py-4">
          <CardHeader className="pb-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {t('dashboard.traceLabel')}
                </p>
                <CardTitle className="mt-2 text-lg font-medium">{t('dashboard.traceTitle')}</CardTitle>
              </div>
              <Badge
                variant="outline"
                className="w-fit border-primary/30 bg-primary/15 text-[10px] uppercase tracking-[0.16em] text-primary dark:border-primary/20 dark:bg-primary/10"
              >
                {isLoading
                  ? t('dashboard.recordsCount').replace('{n}', '-')
                  : t('dashboard.recordsCount').replace('{n}', String(recentVisits.length))}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                ))}
              </div>
            ) : recentVisits.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No hay visitas recientes
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                {recentVisits.slice(0, 4).map((visit) => (
                  <div
                    key={visit.id}
                    className="rounded-2xl border border-border bg-muted/40 p-4 dark:border-white/8 dark:bg-white/[0.03]"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {visit.contributor_name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{visit.reason || '-'}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="w-fit self-start border-border bg-background text-[10px] uppercase tracking-[0.14em] text-muted-foreground dark:border-white/8 dark:bg-white/[0.03] sm:self-auto"
                      >
                        {statusLabel(visit.status)}
                      </Badge>
                    </div>
                    <div className="mt-4 space-y-1 text-[11px] text-foreground/70">
                      <p>{visit.department || '-'}</p>
                      <p>{visit.fiscal_name || visit.received_by || '-'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr] xl:grid-cols-1">
          <RecentVisits visits={recentVisits} isLoading={isLoading} />
          <Card className="bg-white/[0.03] py-4">
            <CardHeader className="pb-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {t('dashboard.quickFollowLabel')}
              </p>
              <CardTitle className="text-lg font-medium">{t('dashboard.dayStatusTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 pt-4">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {t('dashboard.mini.attended')}
                </p>
                {isLoading ? (
                  <Skeleton className="mt-2 h-8 w-12" />
                ) : (
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                    {attendedVisits}
                  </p>
                )}
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {t('dashboard.mini.pending')}
                </p>
                {isLoading ? (
                  <Skeleton className="mt-2 h-8 w-12" />
                ) : (
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                    {pendingVisits}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

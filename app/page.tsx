import { Users, LogIn, LogOut, Clock, Activity, ShieldCheck } from 'lucide-react'
import { MetricsCard } from '@/components/dashboard/metrics-card'
import { RecentVisits } from '@/components/dashboard/recent-visits'
import { mockDashboardMetrics, mockVisits } from '@/services/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  // Sort visits by entry date, newest first
  const sortedVisits = [...mockVisits].sort(
    (a, b) => new Date(b.entryDateTime).getTime() - new Date(a.entryDateTime).getTime()
  )

  const activeVisits = sortedVisits.filter((visit) => visit.status === 'activa')
  const latestVisit = sortedVisits[0]

  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 p-4 sm:p-5 lg:gap-6 lg:p-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
            <ShieldCheck className="size-3.5" />
            Resumen ejecutivo
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
              Dashboard
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              Resumen operativo del control de ingresos y salidas con foco en ritmo de atencion,
              permanencia y trazabilidad de visitas.
            </p>
          </div>
        </div>

        <Card className="bg-[linear-gradient(180deg,rgba(150,255,83,0.18),rgba(150,255,83,0.06))] py-4">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary/90">
                  Estado actual
                </p>
                <CardTitle className="mt-2 text-xl font-medium">Actividad en curso</CardTitle>
              </div>
              <Activity className="size-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[auto_1fr] sm:items-end sm:gap-x-4">
              <p className="text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
                {mockDashboardMetrics.currentlyInside}
              </p>
              <p className="text-sm leading-5 text-foreground/80 sm:pb-1">
                contribuyentes dentro del establecimiento
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Ultima visita</p>
                <p className="mt-2 font-medium text-foreground">{latestVisit?.department ?? 'Sin datos'}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Activas</p>
                <p className="mt-2 font-medium text-foreground">{activeVisits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricsCard
          title="Entradas Hoy"
          value={mockDashboardMetrics.totalEntriesToday}
          icon={LogIn}
          description="Total de contribuyentes registrados"
          trend={{ value: 12, label: 'vs. ayer' }}
        />
        <MetricsCard
          title="Dentro del Establecimiento"
          value={mockDashboardMetrics.currentlyInside}
          icon={Users}
          description="Visitantes activos en el momento"
          trend={{ value: -5, label: 'vs. la hora pasada' }}
        />
        <MetricsCard
          title="Visitas Atendidas"
          value={mockDashboardMetrics.attendedVisits}
          icon={LogOut}
          description="Visitas completadas hoy"
        />
        <MetricsCard
          title="Visitas Pendientes"
          value={mockDashboardMetrics.pendingVisits}
          icon={Clock}
          description="Requieren seguimiento"
          trend={{ value: 1, label: 'nuevas hoy' }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.95fr)]">
        <Card className="bg-white/[0.03] py-4">
          <CardHeader className="pb-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Trazabilidad reciente
                </p>
                <CardTitle className="mt-2 text-lg font-medium">Actividad operativa</CardTitle>
              </div>
              <Badge
                variant="outline"
                className="w-fit border-primary/20 bg-primary/10 text-[10px] uppercase tracking-[0.16em] text-primary"
              >
                {sortedVisits.length} registros
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              {sortedVisits.slice(0, 4).map((visit) => (
                <div
                  key={visit.id}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {visit.contributor.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{visit.reason}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-white/8 bg-white/[0.03] text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
                    >
                      {visit.status}
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-1 text-[11px] text-foreground/70">
                    <p>{visit.department}</p>
                    <p>{visit.officer}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr] xl:grid-cols-1">
          <RecentVisits visits={sortedVisits.slice(0, 4)} />
          <Card className="bg-white/[0.03] py-4">
            <CardHeader className="pb-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Seguimiento rapido
              </p>
              <CardTitle className="text-lg font-medium">Estado del dia</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 pt-4">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Atendidas
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                  {mockDashboardMetrics.attendedVisits}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Pendientes
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                  {mockDashboardMetrics.pendingVisits}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

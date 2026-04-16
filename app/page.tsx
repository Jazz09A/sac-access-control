import { Users, LogIn, LogOut, Clock, Activity, ShieldCheck, ArrowUpRight } from 'lucide-react'
import { MetricsCard } from '@/components/dashboard/metrics-card'
import { ChartSection } from '@/components/dashboard/chart-section'
import { RecentVisits } from '@/components/dashboard/recent-visits'
import { mockDashboardMetrics, mockHourlyData, mockVisits } from '@/services/mock-data'
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
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-8 p-6 lg:p-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
            <ShieldCheck className="size-3.5" />
            Resumen ejecutivo
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-6xl xl:text-7xl">
              Dashboard
            </h1>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
              Resumen operativo del control de ingresos y salidas con foco en ritmo de atencion,
              permanencia y trazabilidad de visitas.
            </p>
          </div>
        </div>

        <Card className="bg-[linear-gradient(180deg,rgba(150,255,83,0.18),rgba(150,255,83,0.06))] py-5">
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
          <CardContent className="space-y-4">
            <div>
              <p className="text-5xl font-semibold tracking-[-0.05em] text-foreground">
                {mockDashboardMetrics.currentlyInside}
              </p>
              <p className="mt-2 text-sm text-foreground/80">
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

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <ChartSection data={mockHourlyData} />
          <Card className="bg-white/[0.03] py-5">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Trazabilidad reciente
                  </p>
                  <CardTitle className="mt-2 text-xl font-medium">Actividad operativa</CardTitle>
                </div>
                <ButtonGhost />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedVisits.slice(0, 4).map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{visit.contributor.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {visit.reason} · {visit.department}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-white/8 bg-white/[0.03] text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    {visit.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <RecentVisits visits={sortedVisits.slice(0, 5)} />
          <Card className="bg-white/[0.03] py-5">
            <CardHeader className="pb-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Seguimiento rapido
              </p>
              <CardTitle className="text-xl font-medium">Resumen de atencion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Visitas atendidas
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                  {mockDashboardMetrics.attendedVisits}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Visitas pendientes
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
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

function ButtonGhost() {
  return (
    <div className="flex size-9 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-muted-foreground">
      <ArrowUpRight className="size-4" />
    </div>
  )
}

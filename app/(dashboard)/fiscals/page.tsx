'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useLocale } from '@/components/providers/locale-provider'
import { formatDuration, formatTime, getVenezuelaDate } from '@/utils/formatters'
import { toast } from 'sonner'
import { Download, RefreshCw } from 'lucide-react'

type RankingItem = {
  fiscalId: string
  fiscal: string
  total: number
  avgMinutes: number
}

type ReportVisit = {
  visitId: string
  fiscalId: string
  fiscalName: string
  contributorName: string
  contributorRif: string
  entryDateTime: Date
  exitDateTime?: Date
  status: 'activa' | 'cerrada' | 'pendiente'
  reason: string
  department?: string
}

type ApiReportItem = {
  visit_id: string
  fiscal_id: number | null
  fiscal_name: string | null
  contributor_name: string
  contributor_rif: string
  entry_date: string
  entry_time: string
  exit_date: string | null
  exit_time: string | null
  status: string
  reason?: string
  department?: string | null
}

type ApiReportResponse = {
  total: number
  items: ApiReportItem[]
}

function backendStatusToUi(status: string): 'activa' | 'cerrada' | 'pendiente' {
  if (status === 'finalizado' || status === 'rechazado') return 'cerrada'
  if (status === 'atendido') return 'activa'
  return 'pendiente'
}

function parseBackendDateTime(date: string, time: string | null): Date | undefined {
  if (!date || !time) return undefined
  return new Date(`${date}T${time}`)
}

function getStayMinutes(visit: ReportVisit): number {
  const end = visit.exitDateTime ?? new Date()
  const diffMs = end.getTime() - visit.entryDateTime.getTime()
  return Math.max(0, Math.floor(diffMs / 60000))
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

export default function FiscalsPage() {
  const { t } = useLocale()
  const [visits, setVisits] = useState<ReportVisit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fiscalFilter, setFiscalFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'activa' | 'cerrada' | 'pendiente'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState(getVenezuelaDate())
  const [dateTo, setDateTo] = useState(getVenezuelaDate())
  const [reloadTick, setReloadTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function loadData() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (fiscalFilter !== 'all') params.set('fiscal_id', fiscalFilter)
        if (statusFilter !== 'all') params.set('status', statusFilter)
        if (searchTerm.trim()) params.set('q', searchTerm.trim())
        if (dateFrom) params.set('date_from', dateFrom)
        if (dateTo) params.set('date_to', dateTo)

        const res = await fetch(`/api/reports/fiscals?${params.toString()}`, {
          method: 'GET',
          cache: 'no-store',
        })
        const data = (await res.json()) as ApiReportResponse | { detail?: string }
        if (!res.ok) {
          throw new Error((data as { detail?: string }).detail ?? 'No se pudo consultar el reporte.')
        }
        const mapped = (data as ApiReportResponse).items.map((item) => ({
          visitId: item.visit_id,
          fiscalId: item.fiscal_id ? String(item.fiscal_id) : '0',
          fiscalName: item.fiscal_name ?? 'Sin asignar',
          contributorName: item.contributor_name,
          contributorRif: item.contributor_rif,
          entryDateTime: parseBackendDateTime(item.entry_date, item.entry_time) ?? new Date(),
          exitDateTime: parseBackendDateTime(item.exit_date ?? '', item.exit_time),
          status: backendStatusToUi(item.status),
          reason: item.reason ?? '-',
          department: item.department ?? undefined,
        }))
        if (!cancelled) {
          setVisits(mapped)
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : 'Error cargando reporte por fiscal')
          setVisits([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }
    loadData()
    return () => {
      cancelled = true
    }
  }, [fiscalFilter, statusFilter, searchTerm, dateFrom, dateTo, reloadTick])

  const allFiscals = useMemo(() => {
    const map = new Map<string, string>()
    visits.forEach((visit) => map.set(visit.fiscalId, visit.fiscalName))
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [visits])

  const filteredVisits = visits

  const ranking = useMemo<RankingItem[]>(() => {
    const map = new Map<string, { total: number; minutes: number }>()
    filteredVisits.forEach((visit) => {
      const key = `${visit.fiscalId}|${visit.fiscalName}`
      const current = map.get(key) ?? { total: 0, minutes: 0 }
      current.total += 1
      current.minutes += getStayMinutes(visit)
      map.set(key, current)
    })
    return Array.from(map.entries())
      .map(([key, data]) => {
        const [fiscalId, fiscal] = key.split('|')
        return {
          fiscalId,
          fiscal,
        total: data.total,
        avgMinutes: data.total ? Math.round(data.minutes / data.total) : 0,
        }
      })
      .sort((a, b) => b.total - a.total)
  }, [filteredVisits])

  const contributorStats = useMemo(() => {
    const map = new Map<
      string,
      { name: string; rif: string; total: number; minutes: number; lastFiscal: string; lastVisit: Date }
    >()
    filteredVisits.forEach((visit) => {
      const key = visit.contributorRif.toUpperCase()
      const current = map.get(key) ?? {
        name: visit.contributorName,
        rif: visit.contributorRif,
        total: 0,
        minutes: 0,
        lastFiscal: visit.fiscalName,
        lastVisit: visit.entryDateTime,
      }
      current.total += 1
      current.minutes += getStayMinutes(visit)
      if (visit.entryDateTime > current.lastVisit) {
        current.lastVisit = visit.entryDateTime
        current.lastFiscal = visit.fiscalName
      }
      map.set(key, current)
    })
    return Array.from(map.values())
      .map((item) => ({
        ...item,
        avgMinutes: item.total ? Math.round(item.minutes / item.total) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
  }, [filteredVisits])

  const summary = useMemo(() => {
    const totalVisits = filteredVisits.length
    const totalFiscals = new Set(filteredVisits.map((v) => `${v.fiscalId}|${v.fiscalName}`)).size
    const activeInside = filteredVisits.filter((v) => v.status === 'activa').length
    const avgStay =
      totalVisits > 0
        ? Math.round(filteredVisits.reduce((acc, v) => acc + getStayMinutes(v), 0) / totalVisits)
        : 0
    return { totalVisits, totalFiscals, activeInside, avgStay }
  }, [filteredVisits])

  const statusLabel: Record<'activa' | 'cerrada' | 'pendiente', string> = {
    activa: t('fiscals.status.activa'),
    cerrada: t('fiscals.status.cerrada'),
    pendiente: t('fiscals.status.pendiente'),
  }

  const exportPrintableReport = () => {
    const reportDate = new Date().toLocaleString('es-VE')
    const reportPeriod =
      dateFrom && dateTo
        ? dateFrom === dateTo
          ? dateFrom
          : `${dateFrom} al ${dateTo}`
        : dateFrom || dateTo || getVenezuelaDate()
    const reportNumber = `RPT-FIS-LIB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(
      filteredVisits.length,
    ).padStart(4, '0')}`
    const rankingRows = ranking
      .map(
        (item) =>
          `<tr><td>${item.fiscal}</td><td>${item.total}</td><td>${formatMinutes(item.avgMinutes)}</td></tr>`,
      )
      .join('')
    const detailRows = filteredVisits
      .map((visit) => {
        const stay = visit.exitDateTime
          ? formatDuration(visit.entryDateTime, visit.exitDateTime)
          : formatDuration(visit.entryDateTime, new Date())
        return `<tr>
          <td>${visit.fiscalName}</td>
          <td>${visit.contributorName}<br/><small>${visit.contributorRif}</small></td>
          <td>${formatTime(visit.entryDateTime)}</td>
          <td>${visit.exitDateTime ? formatTime(visit.exitDateTime) : '--:--'}</td>
          <td>${stay}</td>
          <td>${statusLabel[visit.status]}</td>
        </tr>`
      })
      .join('')

    const html = `
      <html>
        <head>
          <title>Reporte de visitas</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { margin: 0 0 8px; }
            h2 { margin: 0 0 6px; font-size: 15px; font-weight: 700; }
            h3 { margin: 0 0 8px; }
            p { margin: 0 0 16px; color: #4b5563; }
            .summary { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 8px; margin-bottom: 20px; }
            .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; }
            .label { font-size: 12px; color: #6b7280; margin-bottom: 6px; }
            .value { font-size: 22px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; text-align: left; vertical-align: top; }
            th { background: #f3f4f6; font-weight: 700; }
            .report-header { border: 1px solid #d1d5db; border-radius: 10px; padding: 14px; margin-bottom: 16px; }
            .report-meta { display: flex; justify-content: space-between; gap: 10px; margin-top: 8px; font-size: 12px; color: #111827; }
            .signature-wrap { margin-top: 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
            .signature-box { border-top: 1px solid #111827; padding-top: 6px; min-height: 64px; font-size: 12px; }
            .signature-label { color: #6b7280; font-size: 11px; }
            @media print { body { padding: 8px; } }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h1>REPORTE DE VISITAS</h1>
            <h2>Division de Fiscalizacion - Region Libertador</h2>
            <div class="report-meta">
              <span><strong>Numero de reporte:</strong> ${reportNumber}</span>
              <span><strong>Fecha y hora de emision:</strong> ${reportDate}</span>
            </div>
            <div class="report-meta">
              <span><strong>Periodo analizado:</strong> ${reportPeriod}</span>
            </div>
          </div>
          <div class="summary">
            <div class="card"><div class="label">${t('fiscals.summary.totalVisits')}</div><div class="value">${summary.totalVisits}</div></div>
            <div class="card"><div class="label">${t('fiscals.summary.totalFiscals')}</div><div class="value">${summary.totalFiscals}</div></div>
            <div class="card"><div class="label">${t('fiscals.summary.avgStay')}</div><div class="value">${formatMinutes(summary.avgStay)}</div></div>
            <div class="card"><div class="label">${t('fiscals.summary.insideNow')}</div><div class="value">${summary.activeInside}</div></div>
          </div>
          <h3>${t('fiscals.ranking.title')}</h3>
          <table>
            <thead><tr><th>${t('fiscals.table.fiscal')}</th><th>${t('fiscals.summary.totalVisits')}</th><th>${t('fiscals.summary.avgStay')}</th></tr></thead>
            <tbody>${rankingRows || '<tr><td colspan="3">Sin datos</td></tr>'}</tbody>
          </table>
          <h3>${t('fiscals.table.title')}</h3>
          <table>
            <thead><tr><th>${t('fiscals.table.fiscal')}</th><th>${t('fiscals.table.contributor')}</th><th>${t('fiscals.table.arrival')}</th><th>${t('fiscals.table.exit')}</th><th>${t('fiscals.table.stay')}</th><th>${t('fiscals.table.status')}</th></tr></thead>
            <tbody>${detailRows || '<tr><td colspan="6">Sin registros</td></tr>'}</tbody>
          </table>
          <div class="signature-wrap">
            <div class="signature-box">
              <div>Firma del responsable</div>
              <div class="signature-label">Nombre y cargo</div>
            </div>
            <div class="signature-box">
              <div>Recibido por</div>
              <div class="signature-label">Division de Fiscalizacion - Region Libertador</div>
            </div>
          </div>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank', 'width=1200,height=900')
    if (!printWindow) {
      toast.error(t('fiscals.report.popupError'))
      return
    }
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 p-4 sm:p-5 lg:gap-6 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
            {t('fiscals.title')}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{t('fiscals.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setReloadTick((v) => v + 1)} disabled={isLoading}>
            <RefreshCw className="size-4" />
            {t('fiscals.actions.refresh')}
          </Button>
          <Button onClick={exportPrintableReport} disabled={isLoading}>
            <Download className="size-4" />
            {t('fiscals.actions.pdf')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="py-4">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">{t('fiscals.summary.totalVisits')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-10 w-16" /> : <p className="text-3xl font-semibold">{summary.totalVisits}</p>}
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">{t('fiscals.summary.totalFiscals')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-10 w-16" /> : <p className="text-3xl font-semibold">{summary.totalFiscals}</p>}
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">{t('fiscals.summary.avgStay')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-10 w-20" /> : <p className="text-3xl font-semibold">{formatMinutes(summary.avgStay)}</p>}
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">{t('fiscals.summary.insideNow')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-10 w-16" /> : <p className="text-3xl font-semibold">{summary.activeInside}</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="py-4">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">{t('fiscals.filters.search')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 pt-4 md:grid-cols-5">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{t('fiscals.filters.fiscal')}</p>
            <select
              value={fiscalFilter}
              onChange={(e) => setFiscalFilter(e.target.value)}
              disabled={isLoading}
              className="h-10 w-full rounded-xl border border-input bg-input px-3 text-sm outline-none focus-visible:border-focus-purple focus-visible:ring-1 focus-visible:ring-focus-purple"
            >
              <option value="all">{t('fiscals.filters.fiscalAll')}</option>
              {allFiscals.map((fiscal) => (
                <option key={fiscal.id} value={fiscal.id}>
                  {fiscal.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{t('fiscals.filters.status')}</p>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | 'activa' | 'cerrada' | 'pendiente')
              }
              disabled={isLoading}
              className="h-10 w-full rounded-xl border border-input bg-input px-3 text-sm outline-none focus-visible:border-focus-purple focus-visible:ring-1 focus-visible:ring-focus-purple"
            >
              <option value="all">{t('fiscals.filters.statusAll')}</option>
              <option value="activa">{statusLabel.activa}</option>
              <option value="cerrada">{statusLabel.cerrada}</option>
              <option value="pendiente">{statusLabel.pendiente}</option>
            </select>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{t('fiscals.filters.search')}</p>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('fiscals.filters.searchPlaceholder')}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Fecha desde</p>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Fecha hasta</p>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">{t('fiscals.ranking.title')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, idx) => (
                <Skeleton key={idx} className="h-10 w-full" />
              ))}
            </div>
          ) : ranking.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('fiscals.ranking.empty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>{t('fiscals.table.fiscal')}</TableHead>
                    <TableHead>{t('fiscals.summary.totalVisits')}</TableHead>
                    <TableHead>{t('fiscals.summary.avgStay')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.map((item, idx) => (
                    <TableRow key={`${item.fiscalId}-${item.fiscal}`}>
                      <TableCell className="font-semibold">{idx + 1}</TableCell>
                      <TableCell>{item.fiscal}</TableCell>
                      <TableCell>
                        <Badge>{item.total}</Badge>
                      </TableCell>
                      <TableCell>{formatMinutes(item.avgMinutes)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">{t('fiscals.contributors.title')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, idx) => (
                <Skeleton key={idx} className="h-10 w-full" />
              ))}
            </div>
          ) : contributorStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('fiscals.table.empty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('fiscals.table.contributor')}</TableHead>
                    <TableHead>{t('fiscals.summary.totalVisits')}</TableHead>
                    <TableHead>{t('fiscals.summary.avgStay')}</TableHead>
                    <TableHead>{t('fiscals.table.fiscal')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contributorStats.map((item) => (
                    <TableRow key={item.rif}>
                      <TableCell>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.rif}</p>
                      </TableCell>
                      <TableCell>{item.total}</TableCell>
                      <TableCell>{formatMinutes(item.avgMinutes)}</TableCell>
                      <TableCell>{item.lastFiscal}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg">{t('fiscals.table.title')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, idx) => (
                <Skeleton key={idx} className="h-10 w-full" />
              ))}
            </div>
          ) : filteredVisits.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('fiscals.table.empty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('fiscals.table.fiscal')}</TableHead>
                    <TableHead>{t('fiscals.table.contributor')}</TableHead>
                    <TableHead>{t('fiscals.table.reason')}</TableHead>
                    <TableHead>{t('fiscals.table.arrival')}</TableHead>
                    <TableHead>{t('fiscals.table.exit')}</TableHead>
                    <TableHead>{t('fiscals.table.stay')}</TableHead>
                    <TableHead>{t('fiscals.table.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVisits.map((visit) => (
                    <TableRow key={visit.visitId}>
                      <TableCell>{visit.fiscalName}</TableCell>
                      <TableCell>
                        <p className="font-medium">{visit.contributorName}</p>
                        <p className="text-xs text-muted-foreground">{visit.contributorRif}</p>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-[240px] truncate">{visit.reason}</p>
                        <p className="text-xs text-muted-foreground">{visit.department ?? '-'}</p>
                      </TableCell>
                      <TableCell>{formatTime(visit.entryDateTime)}</TableCell>
                      <TableCell>{visit.exitDateTime ? formatTime(visit.exitDateTime) : '--:--'}</TableCell>
                      <TableCell>
                        {visit.exitDateTime
                          ? formatDuration(visit.entryDateTime, visit.exitDateTime)
                          : formatDuration(visit.entryDateTime, new Date())}
                      </TableCell>
                      <TableCell>
                        <Badge variant={visit.status === 'activa' ? 'default' : 'outline'}>
                          {statusLabel[visit.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

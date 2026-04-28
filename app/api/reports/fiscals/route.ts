import { NextRequest, NextResponse } from 'next/server'
import { getVenezuelaDate } from '@/utils/formatters'

const COOKIE = 'sac_token'

function normalizeBackendOrigin(raw: string): string {
  let u = raw.trim().replace(/\/+$/, '')
  if (u.endsWith('/api/v1')) {
    u = u.slice(0, -'/api/v1'.length).replace(/\/+$/, '')
  }
  return u
}

function buildReportUrl(base: string, query: URLSearchParams): string {
  const origin = normalizeBackendOrigin(base)
  const qs = query.toString()
  return `${origin}/api/v1/visits/reports/fiscals${qs ? `?${qs}` : ''}`
}

function mapUiStatusToBackend(status: string): string | null {
  if (status === 'activa') return 'atendido'
  if (status === 'cerrada') return 'finalizado,rechazado'
  if (status === 'pendiente') return 'espera,reprogramado'
  return null
}

export async function GET(request: NextRequest) {
  const backendRaw = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000'
  const token = request.cookies.get(COOKIE)?.value
  const incoming = request.nextUrl.searchParams
  const query = new URLSearchParams()

  const fiscalId = incoming.get('fiscal_id')
  const statusFilter = incoming.get('status')
  const q = incoming.get('q')
  const dateFrom = incoming.get('date_from')
  const dateTo = incoming.get('date_to')

  if (fiscalId && fiscalId !== 'all') query.set('fiscal_id', fiscalId)
  if (statusFilter && statusFilter !== 'all') {
    const mapped = mapUiStatusToBackend(statusFilter)
    if (mapped) query.set('status_filter', mapped)
  }
  if (q) query.set('q', q)
  if (dateFrom) query.set('date_from', dateFrom)
  if (dateTo) query.set('date_to', dateTo)
  if (!dateFrom && !dateTo) {
    const todayVz = getVenezuelaDate()
    query.set('date_from', todayVz)
    query.set('date_to', todayVz)
  }
  query.set('limit', '500')

  try {
    const res = await fetch(buildReportUrl(backendRaw, query), {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(
        { detail: (data as { detail?: string }).detail ?? 'No se pudo consultar el reporte.' },
        { status: res.status },
      )
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { detail: 'No hay conexión con el backend para consultar el reporte por fiscal.' },
      { status: 503 },
    )
  }
}

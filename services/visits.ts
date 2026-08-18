/**
 * Visits API Service
 */

import { ApiError, apiRequest } from '@/lib/api/client'
import { getAccessToken } from '@/lib/api/auth-token'
import { DEFAULT_LOCAL_BACKEND_URL } from '@/utils/constants'
import { getVenezuelaDate } from '@/utils/formatters'
import { Visit, VisitHistory, SearchFilters, VisitStatus, type VisitCloseStatus } from '@/types'

export interface VisitsListResponse {
  data: Visit[]
  total: number
  skip: number
  limit: number
}

type VisitsHistoryResponse = VisitHistory[] | { data?: VisitHistory[] }
interface VisitsHistoryPaginatedResponse {
  total?: number
  skip?: number
  limit?: number
  items?: VisitHistory[]
  data?: VisitHistory[]
}

export interface VisitsHistoryResult {
  items: VisitHistory[]
  total: number
}

export interface CreateVisitRequest {
  /** RIF fiscal del contribuyente (obligatorio en el backend) */
  contributor_rif: string
  contributor_name: string
  responsible_person: string
  fiscal_id: number | string
  reason: string
  observations?: string
  department: string
  file_number?: string
  entry_date: string
  entry_time: string
  signature_image_url?: string | null
}

/**
 * Get visits history with filters for administrative reports
 */
export async function getVisitsHistory(filters: SearchFilters = {}): Promise<VisitsHistoryResult> {
  const normalizedFilters: SearchFilters = { ...filters }
  if (!normalizedFilters.fecha_desde && !normalizedFilters.fecha_hasta) {
    const todayVz = getVenezuelaDate()
    normalizedFilters.fecha_desde = todayVz
    normalizedFilters.fecha_hasta = todayVz
  }

  const params = new URLSearchParams()

  Object.entries(normalizedFilters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString())
    }
  })

  const queryString = params.toString()
  const url = `/api/v1/visits/history${queryString ? `?${queryString}` : ''}`

  const response = await apiRequest<VisitsHistoryResponse | VisitsHistoryPaginatedResponse>(url)
  if (Array.isArray(response)) {
    return {
      items: response,
      total: response.length
    }
  }

  if (Array.isArray(response?.items)) {
    return {
      items: response.items,
      total: typeof response.total === 'number' ? response.total : response.items.length
    }
  }

  if (Array.isArray(response?.data)) {
    return {
      items: response.data,
      total: typeof response.total === 'number' ? response.total : response.data.length
    }
  }

  return {
    items: [],
    total: 0
  }
}

/**
 * Create a new visit entry
 * Note: contributor_id is not sent; backend creates/looks up contributor by name
 */
export async function createVisit(data: CreateVisitRequest): Promise<Visit> {
  return apiRequest<Visit>('/api/v1/visits/', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export interface CreateVisitWithPhotoRequest {
  contributor_cedula?: string
  contributor_rif?: string
  contributor_name?: string
  responsible_person?: string
  fiscal_id?: number | string
  reason?: string
  observations?: string
  department: string
  file_number?: string
  entry_date?: string
  entry_time?: string
  photo: File
}

export interface UpdateVisitRequest {
  fiscal_id?: string
  reason?: string
  observations?: string
  received_by?: string
  department?: string
  file_number?: string
  entry_date?: string
  entry_time?: string
  exit_date?: string
  exit_time?: string
  status?: VisitStatus
}

/**
 * Create a new visit entry with photo upload
 * Uses multipart/form-data to send the photo file
 */
export async function createVisitWithPhoto(data: CreateVisitWithPhotoRequest): Promise<Visit> {
  const formData = new FormData()
  if (data.contributor_cedula?.trim()) {
    formData.append('contributor_cedula', data.contributor_cedula.trim())
  }
  formData.append('department', data.department)
  formData.append('photo', data.photo)
  if (data.contributor_rif?.trim()) formData.append('contributor_rif', data.contributor_rif.trim())
  if (data.contributor_name) formData.append('contributor_name', data.contributor_name)
  if (data.responsible_person) formData.append('responsible_person', data.responsible_person)
  if (data.fiscal_id != null && data.fiscal_id !== '') formData.append('fiscal_id', String(data.fiscal_id))
  if (data.reason) formData.append('reason', data.reason)
  if (data.observations) formData.append('observations', data.observations)
  if (data.file_number) formData.append('file_number', data.file_number)
  if (data.entry_date) formData.append('entry_date', data.entry_date)
  if (data.entry_time) formData.append('entry_time', data.entry_time)

  // Misma lógica que lib/api/client: en el navegador solo existe NEXT_PUBLIC_*; si no, localhost.
  const baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL
    || process.env.NEXT_PUBLIC_API_BASE_URL
    || DEFAULT_LOCAL_BACKEND_URL

  // Send request without Content-Type header (browser sets it with boundary)
  const token = await getAccessToken()
  const headers = new Headers()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/api/v1/visits/`, {
    method: 'POST',
    body: formData,
    headers,
    cache: 'no-store'
  })

  if (!response.ok) {
    let detail: string | undefined
    try {
      const payload = await response.json()
      detail =
        typeof payload?.detail === 'string'
          ? payload.detail
          : typeof payload?.message === 'string'
            ? payload.message
            : undefined
    } catch {
      detail = undefined
    }
    throw new ApiError(
      detail || `La solicitud falló con código ${response.status}`,
      response.status,
      detail,
    )
  }

  return response.json()
}

/**
 * Get visits with optional filters
 */
export async function getVisits(filters: {
  contributor_id?: number
  cedula?: string
  rif?: string
  status?: VisitStatus
  fiscal_id?: number | string
  entry_date?: string
  open?: boolean
  skip?: number
  limit?: number
} = {}): Promise<VisitsListResponse> {
  const normalizedFilters = { ...filters }
  if (!normalizedFilters.open && !normalizedFilters.entry_date) {
    normalizedFilters.entry_date = getVenezuelaDate()
  }

  const params = new URLSearchParams()

  Object.entries(normalizedFilters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (typeof value === 'boolean') {
      if (value) params.append(key, 'true')
      return
    }
    params.append(key, value.toString())
  })

  const queryString = params.toString()
  const url = `/api/v1/visits${queryString ? `?${queryString}` : ''}`

  const response = await apiRequest<Visit[] | VisitsListResponse>(url)
  if (Array.isArray(response)) {
    return {
      data: response,
      total: response.length,
      skip: normalizedFilters.skip ?? 0,
      limit: normalizedFilters.limit ?? response.length,
    }
  }

  return {
    data: Array.isArray(response.data) ? response.data : [],
    total: typeof response.total === 'number' ? response.total : (response.data?.length ?? 0),
    skip: typeof response.skip === 'number' ? response.skip : (normalizedFilters.skip ?? 0),
    limit: typeof response.limit === 'number' ? response.limit : (normalizedFilters.limit ?? 100),
  }
}

export interface VisitDayMetrics {
  target_date: string
  waiting: number
  in_service: number
  closed: number
  exited: number
  avg_wait_seconds: number | null
  avg_attention_seconds: number | null
  avg_stay_seconds: number | null
}

export interface CloseVisitRequest {
  status: VisitCloseStatus
  observations?: string
}

export interface IntakeVisitRequest {
  name: string
  reason: string
  rif?: string
}

/**
 * FIFO queue for a department: waiting + in service, oldest first.
 */
export async function getVisitQueue(department?: string): Promise<Visit[]> {
  const params = new URLSearchParams()
  if (department) {
    params.set('department', department)
  }
  const queryString = params.toString()
  const url = `/api/v1/visits/queue${queryString ? `?${queryString}` : ''}`
  const response = await apiRequest<Visit[] | VisitsListResponse>(url)
  if (Array.isArray(response)) return response
  return Array.isArray(response.data) ? response.data : []
}

/**
 * Move a waiting visit to in-service and stamp called_at.
 */
export async function callVisit(visitId: string): Promise<Visit> {
  return apiRequest<Visit>(`/api/v1/visits/${visitId}/call`, {
    method: 'PATCH',
  })
}

/**
 * Complete identity and reason for an in-service visit before close.
 */
export async function intakeVisit(visitId: string, data: IntakeVisitRequest): Promise<Visit> {
  const payload: IntakeVisitRequest = {
    name: data.name.trim(),
    reason: data.reason.trim(),
  }
  const rif = data.rif?.trim()
  if (rif) {
    payload.rif = rif
  }
  return apiRequest<Visit>(`/api/v1/visits/${visitId}/intake`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/**
 * Close an in-service visit as attended, incomplete, or referred.
 */
export async function closeVisit(visitId: string, data: CloseVisitRequest): Promise<Visit> {
  const payload: CloseVisitRequest = { status: data.status }
  const notes = data.observations?.trim()
  if (notes) {
    payload.observations = notes
  }
  return apiRequest<Visit>(`/api/v1/visits/${visitId}/close`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/**
 * Day metrics for gerencia: occupancy, closed counts, and average times.
 */
export async function getVisitDayMetrics(targetDate?: string): Promise<VisitDayMetrics> {
  const params = new URLSearchParams()
  params.append('target_date', targetDate || getVenezuelaDate())
  const queryString = params.toString()
  return apiRequest<VisitDayMetrics>(`/api/v1/visits/metrics?${queryString}`)
}

/**
 * Get visits history with filters for administrative reports
 */
// export async function getVisitsHistoryReport(filters: SearchFilters = {}): Promise<VisitsHistoryReportResponse> {
//     const params = new URLSearchParams()

//   Object.entries(filters).forEach(([key, value]) => {
//     if (value !== undefined && value !== null && value !== '') {
//       params.append(key, value.toString())
//     }
//   })  

//   const queryString = params.toString()
//   const url = `/api/v1/visits/history${queryString ? `?${queryString}` : ''}`

//   return apiRequest<VisitsHistoryReport[]>(url)
// }

/**
 * Get a specific visit by ID
 */
export async function getVisit(visitId: string): Promise<Visit> {
  return apiRequest<Visit>(`/api/v1/visits/${visitId}`)
}

/**
 * Register visit exit. Backend stamps finalizado + exit_at.
 */
export async function registerVisitExit(visitId: string, data?: {
  exit_date?: string
  exit_time?: string
  status?: VisitStatus.FINISHED
}): Promise<Visit> {
  return apiRequest<Visit>(`/api/v1/visits/${visitId}/exit`, {
    method: 'PATCH',
    body: JSON.stringify(data ?? {}),
  })
}

/**
 * Mark visit as attended
 * Changes status from 'espera' to 'atendido'
 */
export async function markVisitAsAttended(visitId: string): Promise<Visit> {
  return apiRequest<Visit>(`/api/v1/visits/${visitId}/attend`, {
    method: 'PATCH'
  })
}

/**
 * Update visit fields using partial payload
 */
export async function updateVisit(visitId: string, data: UpdateVisitRequest): Promise<Visit> {
  return apiRequest<Visit>(`/api/v1/visits/${visitId}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
}

/**
 * Soft delete a visit record
 */
export async function deleteVisit(visitId: string): Promise<void> {
  return apiRequest<void>(`/api/v1/visits/${visitId}`, {
    method: 'DELETE'
  })
}

/**
 * Dashboard metrics response from API
 */
export interface EntradasDia {
  hoy: number
  ayer: number
  porcentaje_cambio: number
}

export interface PersonasDentro {
  actual: number
  hora_anterior: number
  porcentaje_cambio: number
}

export interface UltimaActividad {
  id: string
  motivo: string
  contribuyente: string
  rif: string
  responsable: string
  status: VisitStatus
  entry_time: string
}

export interface DashboardAdvancedResponse {
  date: string
  visitas_en_curso: number
  entradas_dia: EntradasDia
  personas_dentro: PersonasDentro
  visitas_atendidas: number
  visitas_pendientes: number
  ultimas_actividades: UltimaActividad[]
}

/**
 * Get dashboard advanced metrics
 * @param targetDate Optional date in YYYY-MM-DD format. If not provided, uses current date.
 */
export async function getDashboardAdvanced(targetDate?: string): Promise<DashboardAdvancedResponse> {
  const params = new URLSearchParams()
  params.append('target_date', targetDate || getVenezuelaDate())

  const queryString = params.toString()
  const url = `/api/v1/dashboard/advanced${queryString ? `?${queryString}` : ''}`

  return apiRequest<DashboardAdvancedResponse>(url)
}
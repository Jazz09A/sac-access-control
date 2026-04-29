/**
 * Visits API Service
 */

import { apiRequest } from '@/lib/api/client'
import { DEFAULT_LOCAL_BACKEND_URL } from '@/utils/constants'
import { getVenezuelaDate } from '@/utils/formatters'
import { Visit, VisitHistory, SearchFilters, VisitStatus } from '@/types'

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

export interface CreateVisitWithPhotoRequest extends CreateVisitRequest {
  photo: File
}

/**
 * Create a new visit entry with photo upload
 * Uses multipart/form-data to send the photo file
 */
export async function createVisitWithPhoto(data: CreateVisitWithPhotoRequest): Promise<Visit> {
  const formData = new FormData()

  // Add all text fields (contributor_rif es obligatorio en POST /api/v1/visits/)
  formData.append('contributor_rif', data.contributor_rif.trim())
  formData.append('contributor_name', data.contributor_name)
  formData.append('responsible_person', data.responsible_person)
  formData.append('fiscal_id', String(data.fiscal_id))
  formData.append('reason', data.reason)
  formData.append('entry_date', data.entry_date)
  formData.append('entry_time', data.entry_time)

  // Add optional fields if present
  if (data.observations) {
    formData.append('observations', data.observations)
  }
  if (data.department) {
    formData.append('department', data.department)
  }
  if (data.file_number) {
    formData.append('file_number', data.file_number)
  }

  // Add photo file
  formData.append('photo', data.photo)

  // Misma lógica que lib/api/client: en el navegador solo existe NEXT_PUBLIC_*; si no, localhost.
  const baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL
    || process.env.NEXT_PUBLIC_API_BASE_URL
    || DEFAULT_LOCAL_BACKEND_URL

  // Send request without Content-Type header (browser sets it with boundary)
  const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/api/v1/visits/`, {
    method: 'POST',
    body: formData,
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
    throw new Error(detail || `La solicitud falló con código ${response.status}`)
  }

  return response.json()
}

/**
 * Get visits with optional filters
 */
export async function getVisits(filters: {
  contributor_id?: number
  rif?: string
  status?: VisitStatus
  fiscal_id?: number
  entry_date?: string
  skip?: number
  limit?: number
} = {}): Promise<VisitsListResponse> {
  const normalizedFilters = { ...filters }
  if (!normalizedFilters.entry_date) {
    normalizedFilters.entry_date = getVenezuelaDate()
  }

  const params = new URLSearchParams()

  Object.entries(normalizedFilters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString())
    }
  })

  const queryString = params.toString()
  const url = `/api/v1/visits${queryString ? `?${queryString}` : ''}`

  return apiRequest<VisitsListResponse>(url)
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
 * Register visit exit
 * Status must be VisitStatus.FINISHED ('finalizado')
 */
export async function registerVisitExit(visitId: string, data: {
  exit_date: string
  exit_time: string
  status: VisitStatus.FINISHED
}): Promise<Visit> {
  return apiRequest<Visit>(`/api/v1/visits/${visitId}/exit`, {
    method: 'PATCH',
    body: JSON.stringify(data)
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
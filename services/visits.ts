/**
 * Visits API Service
 */

import { apiRequest } from '@/lib/api/client'
import { Visit, VisitHistory, SearchFilters } from '@/types'

export interface VisitsListResponse {
  data: Visit[]
  total: number
  skip: number
  limit: number
}

/**
 * Get visits history with filters for administrative reports
 */
export async function getVisitsHistory(filters: SearchFilters = {}): Promise<VisitHistory[]> {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString())
    }
  })

  const queryString = params.toString()
  const url = `/api/v1/visits/history${queryString ? `?${queryString}` : ''}`

  return apiRequest<VisitHistory[]>(url)
}

/**
 * Get visits with optional filters
 */
export async function getVisits(filters: {
  contributor_id?: number
  rif?: string
  status?: string
  fiscal_id?: number
  entry_date?: string
  skip?: number
  limit?: number
} = {}): Promise<VisitsListResponse> {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
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
 */
export async function registerVisitExit(visitId: string, data: {
  exit_date: string
  exit_time: string
  status: string
}): Promise<Visit> {
  return apiRequest<Visit>(`/api/v1/visits/${visitId}/exit`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
}
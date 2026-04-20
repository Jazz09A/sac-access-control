/**
 * Fiscals API Service
 */

import { apiRequest } from '@/lib/api/client'
import { Fiscal } from '@/types'

export interface FiscalsSearchResponse {
  data: Fiscal[]
  total: number
  skip: number
  limit: number
}

export interface FiscalSyncResult {
  started_at: string
  finished_at: string
  fetched_total: number
  inserted_total: number
  updated_total: number
  skipped_total: number
  duration_ms: number
  status: 'success' | 'failed'
  error_message: string | null
}

export interface FiscalSyncStatus {
  last_sync: FiscalSyncResult | null
}

/**
 * Search fiscals with pagination and query filter
 * @param query Search term (optional) - searches by name
 * @param skip Number of records to skip (default: 0)
 * @param limit Number of records to return (default: 20)
 */
export async function searchFiscals(params: {
  query?: string
  skip?: number
  limit?: number
} = {}): Promise<Fiscal[]> {
  const searchParams = new URLSearchParams()

  if (params.query) {
    searchParams.append('query', params.query)
  }
  searchParams.append('skip', String(params.skip ?? 0))
  searchParams.append('limit', String(params.limit ?? 20))

  const queryString = searchParams.toString()
  const url = `/api/v1/fiscals/${queryString ? `?${queryString}` : ''}`

  return apiRequest<Fiscal[]>(url)
}

/**
 * Sync fiscals from MySQL/TiDB to PostgreSQL
 */
export async function syncFiscals(): Promise<FiscalSyncResult> {
  return apiRequest<FiscalSyncResult>('/api/v1/fiscals/sync', {
    method: 'POST'
  })
}

/**
 * Get last sync status
 */
export async function getFiscalSyncStatus(): Promise<FiscalSyncStatus> {
  return apiRequest<FiscalSyncStatus>('/api/v1/fiscals/sync/status')
}

import { ApiError, apiRequest, getApiBaseUrl } from '@/lib/api/client'
import { getAccessToken } from '@/lib/api/auth-token'

export type AssetStatus = 'in_sede' | 'assigned' | 'in_transit_out'
export type AssetMovementDirection = 'out' | 'in'

export interface SeniatAsset {
  id: string
  inventory_code: string
  serial?: string | null
  brand?: string | null
  model?: string | null
  category: string
  description?: string | null
  photo_object_key?: string | null
  workstation?: string | null
  status: AssetStatus
  assigned_user_id?: string | null
  created_at?: string
}

export interface SeniatAssetCreate {
  inventory_code: string
  serial?: string | null
  brand?: string | null
  model?: string | null
  category: string
  description?: string | null
  workstation?: string | null
}

export interface AssetOpenOutAlert {
  id: string
  asset_id: string
  carrier_user_id?: string
  visit_id?: string | null
  direction?: string
  status?: string
  notes?: string | null
  opened_at?: string
  closed_at?: string | null
}

export interface AssetMovement {
  id: string
  asset_id: string
  carrier_user_id: string
  visit_id?: string | null
  direction: AssetMovementDirection
  status: string
  notes?: string | null
  opened_at?: string
  closed_at?: string | null
}

export interface SystemUser {
  id: string
  full_name: string
  person_id: string
  role?: string
  email?: string | null
}

function unwrapList<T>(raw: T[] | { data?: T[] } | null | undefined): T[] {
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.data)) return raw.data
  return []
}

export function assetPhotoUrl(photoObjectKey?: string | null): string | null {
  if (!photoObjectKey) return null
  if (/^https?:\/\//i.test(photoObjectKey)) return photoObjectKey
  return `${getApiBaseUrl()}/api/v1/files/${photoObjectKey.replace(/^\/+/, '')}`
}

export async function listAssets(filters: {
  status?: AssetStatus | ''
  q?: string
} = {}): Promise<SeniatAsset[]> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.q?.trim()) params.set('q', filters.q.trim())
  const query = params.toString()
  const raw = await apiRequest<SeniatAsset[] | { data?: SeniatAsset[] }>(
    `/api/v1/assets/${query ? `?${query}` : ''}`,
  )
  return unwrapList(raw)
}

export async function findAssetByInventoryCode(code: string): Promise<SeniatAsset | null> {
  const needle = code.trim().toLowerCase()
  if (!needle) return null
  const assets = await listAssets({ q: code.trim() })
  return assets.find((item) => item.inventory_code.trim().toLowerCase() === needle) ?? null
}

export async function getAsset(assetId: string): Promise<SeniatAsset> {
  return apiRequest<SeniatAsset>(`/api/v1/assets/${assetId}`)
}

export async function createAsset(payload: SeniatAssetCreate): Promise<SeniatAsset> {
  return apiRequest<SeniatAsset>('/api/v1/assets/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function assignAsset(
  assetId: string,
  payload: { user_id: string; workstation?: string },
): Promise<SeniatAsset> {
  return apiRequest<SeniatAsset>(`/api/v1/assets/${assetId}/assign`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function releaseAsset(assetId: string): Promise<SeniatAsset> {
  return apiRequest<SeniatAsset>(`/api/v1/assets/${assetId}/release`, {
    method: 'POST',
  })
}

export async function recordAssetMovement(
  assetId: string,
  payload: {
    direction: AssetMovementDirection
    carrier_user_id: string
    visit_id?: string | null
    notes?: string | null
  },
): Promise<AssetMovement> {
  return apiRequest<AssetMovement>(`/api/v1/assets/${assetId}/movements`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function uploadAssetPhoto(assetId: string, file: File): Promise<SeniatAsset> {
  const formData = new FormData()
  formData.append('photo', file)

  const token = await getAccessToken()
  const headers = new Headers()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${getApiBaseUrl()}/api/v1/assets/${assetId}/photo`, {
    method: 'POST',
    body: formData,
    headers,
    cache: 'no-store',
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
      detail || `La solicitud a la API falló con código ${response.status}.`,
      response.status,
      detail,
    )
  }

  return response.json() as Promise<SeniatAsset>
}

export async function exportAssetsCsv(): Promise<void> {
  const token = await getAccessToken()
  if (!token) {
    throw new ApiError('Se requiere un token de sesión para exportar.', 401)
  }

  const response = await fetch(`${getApiBaseUrl()}/api/v1/assets/export.csv`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'text/csv',
    },
    cache: 'no-store',
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
      detail || `La solicitud a la API falló con código ${response.status}.`,
      response.status,
      detail,
    )
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = 'seniat-assets.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

export async function getOpenOutAlerts(visitId: string): Promise<AssetOpenOutAlert[]> {
  const params = new URLSearchParams({ visit_id: visitId })
  const raw = await apiRequest<AssetOpenOutAlert[] | { data?: AssetOpenOutAlert[] }>(
    `/api/v1/assets/alerts/open-out?${params.toString()}`,
  )
  return unwrapList(raw)
}

export async function listSystemUsers(): Promise<SystemUser[] | 'forbidden'> {
  try {
    const raw = await apiRequest<SystemUser[] | { data?: SystemUser[] }>('/api/v1/users/')
    return unwrapList(raw)
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) return 'forbidden'
    throw error
  }
}

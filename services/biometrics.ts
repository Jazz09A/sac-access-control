import { apiRequest } from '@/lib/api/client'
import type { LandmarkPoint } from '@/lib/gate/types'

export type RecognizeResult =
  | 'recognized'
  | 'unknown'
  | 'no_face'
  | 'bad_pose'
  | 'no_gallery'
  | 'needs_document'
  | 'calibration_required'

export interface RecognizeResponse {
  result: RecognizeResult | string
  message?: string
  contributor_id?: number | null
  rif?: string | null
  cedula?: string | null
  confidence?: number
  fallback?: string | null
}

export interface EnrollResponse {
  result: string
  contributor_id?: number
  rif?: string
  cedula?: string | null
  message?: string
}

export const DOCUMENT_RESULTS = new Set(['unknown', 'needs_document', 'no_gallery'])
export const RETRY_SCAN_RESULTS = new Set(['no_face', 'bad_pose', 'calibration_required'])

export async function recognizeFace(payload: {
  image: string
  landmarks: LandmarkPoint[]
  glasses?: boolean
}): Promise<RecognizeResponse> {
  return apiRequest<RecognizeResponse>('/api/v1/biometrics/recognize', {
    method: 'POST',
    body: JSON.stringify({
      image: payload.image,
      landmarks: payload.landmarks,
      glasses: payload.glasses ?? false,
    }),
  })
}

export async function enrollFace(payload: {
  image: string
  landmarks: LandmarkPoint[]
  cedula: string
  glasses?: boolean
}): Promise<EnrollResponse> {
  return apiRequest<EnrollResponse>('/api/v1/biometrics/enroll', {
    method: 'POST',
    body: JSON.stringify({
      image: payload.image,
      landmarks: payload.landmarks,
      cedula: payload.cedula,
      glasses: payload.glasses ?? false,
    }),
  })
}

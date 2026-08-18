export type GateMode = 'entry' | 'exit'

export type LandmarkPoint = {
  x: number
  y: number
  z: number
}

export type FacePose = {
  yaw: number
  pitch: number
  roll: number
}

export type FaceCenter = {
  x: number
  y: number
}

export type MeshQualityLevel = 'loading' | 'ok' | 'warn' | 'error'

export type MeshQuality = {
  ready: boolean
  message: string
  level: MeshQualityLevel
  faceCount: number
  pose: FacePose | null
  fallback?: boolean
}

export type FaceCapture = {
  imageDataUrl: string
  photoFile: File
  landmarks: LandmarkPoint[]
}

export type GateIdentity = {
  contributorId?: number | string | null
  cedula: string
  rif?: string | null
  name?: string | null
}

export type StabilitySample = {
  faceCount: number
  pose?: FacePose | null
  center?: FaceCenter | null
  valid: boolean
  at?: number
}

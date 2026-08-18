import type { LandmarkPoint } from './types'

export function captureJpegDataUrl(video: HTMLVideoElement, canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('No se pudo capturar la imagen')
  }
  const srcW = video.videoWidth || 640
  const srcH = video.videoHeight || 480
  const scale = Math.min(1, 640 / srcW, 480 / srcH)
  canvas.width = Math.max(1, Math.round(srcW * scale))
  canvas.height = Math.max(1, Math.round(srcH * scale))
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.72)
}

export async function dataUrlToJpegFile(dataUrl: string, name = 'gate.jpg'): Promise<File> {
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  return new File([blob], name, { type: 'image/jpeg' })
}

export function clampLandmarks(landmarks: LandmarkPoint[]): LandmarkPoint[] {
  return landmarks.map((point) => ({
    x: Math.min(1, Math.max(0, Number(point.x) || 0)),
    y: Math.min(1, Math.max(0, Number(point.y) || 0)),
    z: Math.min(1, Math.max(-1, Number(point.z) || 0)),
  }))
}

export function getOperatorName(): string {
  if (typeof document === 'undefined') return 'Garita'
  const match = document.cookie.match(/(?:^|; )sac_user_name=([^;]*)/)
  const raw = match?.[1] ? decodeURIComponent(match[1]) : ''
  return raw.trim() || 'Garita'
}

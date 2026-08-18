'use client'

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { captureJpegDataUrl, clampLandmarks, dataUrlToJpegFile } from '@/lib/gate/capture'
import {
  getLatestFaceCount,
  getLatestLandmarks,
  isMeshFallback,
  isMeshReady,
  startFaceMesh,
  stopFaceMesh,
} from '@/lib/gate/face-mesh'
import { faceCenterOffset, isGrantPose, poseFromLandmarks } from '@/lib/gate/pose-utils'
import { StabilityTracker, STABILITY_COOLDOWN_MS } from '@/lib/gate/stability'
import type { FaceCapture, MeshQuality } from '@/lib/gate/types'

export type GateCameraHandle = {
  captureNow: () => Promise<FaceCapture | null>
}

type CameraStatus = 'requesting' | 'ready' | 'denied' | 'mesh-error'

interface GateCameraProps {
  paused: boolean
  overlayMessage?: string
  overlayLevel?: MeshQuality['level'] | 'verifying'
  onStableCapture: (capture: FaceCapture) => void
  onStatusChange?: (status: CameraStatus, quality?: MeshQuality) => void
}

export const GateCamera = forwardRef<GateCameraHandle, GateCameraProps>(function GateCamera({
  paused,
  overlayMessage,
  overlayLevel,
  onStableCapture,
  onStatusChange,
}, ref) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const meshRef = useRef<HTMLCanvasElement>(null)
  const captureRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const stabilityRef = useRef(new StabilityTracker())
  const cooldownUntilRef = useRef(0)
  const busyRef = useRef(false)
  const pausedRef = useRef(paused)
  const onStableRef = useRef(onStableCapture)
  const onStatusRef = useRef(onStatusChange)
  const [status, setStatus] = useState<CameraStatus>('requesting')
  const [quality, setQuality] = useState<MeshQuality | null>(null)

  pausedRef.current = paused
  onStableRef.current = onStableCapture
  onStatusRef.current = onStatusChange

  useImperativeHandle(ref, () => ({
    async captureNow() {
      const video = videoRef.current
      const canvas = captureRef.current
      if (!video || !canvas || !video.videoWidth) return null
      const imageDataUrl = captureJpegDataUrl(video, canvas)
      const photoFile = await dataUrlToJpegFile(imageDataUrl)
      const landmarks = getLatestLandmarks()
      return {
        imageDataUrl,
        photoFile,
        landmarks: landmarks ? clampLandmarks(landmarks) : [],
      }
    },
  }))

  const updateStatus = useCallback((next: CameraStatus, nextQuality?: MeshQuality) => {
    setStatus(next)
    onStatusRef.current?.(next, nextQuality)
  }, [])

  const handleQuality = useCallback(
    (next: MeshQuality) => {
      setQuality(next)
      if (next.fallback) {
        updateStatus('mesh-error', next)
        return
      }
      if (pausedRef.current || busyRef.current || isMeshFallback()) {
        return
      }
      if (performance.now() < cooldownUntilRef.current) {
        return
      }
      if (!isMeshReady()) {
        stabilityRef.current.reset()
        return
      }
      const landmarks = getLatestLandmarks()
      const faceCount = getLatestFaceCount()
      if (!landmarks || faceCount !== 1) {
        stabilityRef.current.reset()
        return
      }
      const pose = poseFromLandmarks(landmarks)
      const center = faceCenterOffset(landmarks)
      const sample = stabilityRef.current.buildSample(
        landmarks,
        faceCount,
        pose,
        center,
        isGrantPose,
      )
      const stable = stabilityRef.current.push(sample)
      if (!stable) return

      const video = videoRef.current
      const canvas = captureRef.current
      if (!video || !canvas) return

      busyRef.current = true
      cooldownUntilRef.current = performance.now() + STABILITY_COOLDOWN_MS
      stabilityRef.current.reset()

      try {
        const imageDataUrl = captureJpegDataUrl(video, canvas)
        const clamped = clampLandmarks(landmarks)
        void dataUrlToJpegFile(imageDataUrl).then((photoFile) => {
          onStableRef.current({ imageDataUrl, photoFile, landmarks: clamped })
        })
      } catch (error) {
        console.error(error)
        busyRef.current = false
      }
    },
    [updateStatus],
  )

  useEffect(() => {
    if (!paused) {
      busyRef.current = false
    }
  }, [paused])

  useEffect(() => {
    const video = videoRef.current
    const meshCanvas = meshRef.current
    if (!video || !meshCanvas) return

    let cancelled = false

    async function start() {
      try {
        updateStatus('requesting')
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        video.srcObject = stream
        video.muted = true
        video.playsInline = true
        await video.play().catch(() => {})
        updateStatus('ready')
        await startFaceMesh({
          video,
          canvas: meshCanvas,
          onQuality: handleQuality,
        })
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          updateStatus('denied')
        }
      }
    }

    void start()

    return () => {
      cancelled = true
      stopFaceMesh()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [handleQuality, updateStatus])

  const liveMessage =
    overlayMessage ||
    (status === 'requesting'
      ? 'Solicitando acceso a la cámara...'
      : status === 'denied'
        ? 'No se pudo acceder a la cámara'
        : quality?.message || 'Colócate frente a la cámara')

  const level = overlayLevel || (status === 'denied' || status === 'mesh-error' ? 'error' : quality?.level)

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-border bg-card">
      <div className="relative aspect-[4/3] bg-black">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          playsInline
          muted
          autoPlay
          aria-label="Vista de la cámara de garita"
        />
        <canvas ref={meshRef} className="pointer-events-none absolute inset-0 h-full w-full" />
        <canvas ref={captureRef} className="hidden" />

        {status === 'requesting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="size-10 animate-spin text-primary-foreground" aria-hidden />
          </div>
        )}

        <div
          className={cn(
            'absolute inset-x-0 bottom-0 px-4 py-3 text-center text-lg font-medium text-white',
            level === 'ok' && 'bg-emerald-700/85',
            level === 'warn' && 'bg-amber-700/90',
            level === 'error' && 'bg-destructive/90',
            (level === 'loading' || level === 'verifying') && 'bg-primary/90',
            !level && 'bg-black/70',
          )}
          role="status"
          aria-live="polite"
        >
          {liveMessage}
        </div>
      </div>
    </div>
  )
})

GateCamera.displayName = 'GateCamera'

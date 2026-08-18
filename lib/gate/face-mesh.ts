/**
 * Malla facial en vivo con MediaPipe Face Landmarker (archivos locales on-prem).
 * Puerto de FACE-R app/static/js/face-mesh.js — no reescribe la detección.
 */

import {
  GRANT_PITCH_ROLL_ABS,
  GRANT_YAW_ABS,
  poseFromLandmarks as poseFromLandmarksUtil,
} from './pose-utils'
import type { LandmarkPoint, MeshQuality } from './types'

const MP_BASE = '/vendor/mediapipe'
const MODEL_URL = `${MP_BASE}/face_landmarker.task`
const WASM_URL = `${MP_BASE}/wasm/`
const BUNDLE_URL = `${MP_BASE}/vision_bundle.mjs`
const LOAD_TIMEOUT_MS = 15000

type ConnectorSet = unknown

type DrawingUtilsInstance = {
  drawConnectors: (
    landmarks: LandmarkPoint[],
    connectors: ConnectorSet,
    style: { color: string; lineWidth: number },
  ) => void
}

type FaceLandmarkerInstance = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestamp: number,
  ) => { faceLandmarks?: LandmarkPoint[][] }
  close: () => void
}

type MediaPipeVisionModule = {
  FaceLandmarker: {
    createFromOptions: (
      vision: unknown,
      options: Record<string, unknown>,
    ) => Promise<FaceLandmarkerInstance>
    FACE_LANDMARKS_TESSELATION: ConnectorSet
    FACE_LANDMARKS_CONTOURS: ConnectorSet
    FACE_LANDMARKS_RIGHT_EYE: ConnectorSet
    FACE_LANDMARKS_LEFT_EYE: ConnectorSet
    FACE_LANDMARKS_LIPS: ConnectorSet
  }
  FilesetResolver: {
    forVisionTasks: (wasmUrl: string) => Promise<unknown>
  }
  DrawingUtils: new (ctx: CanvasRenderingContext2D) => DrawingUtilsInstance
}

let FaceLandmarker: MediaPipeVisionModule['FaceLandmarker'] | null = null
let FilesetResolver: MediaPipeVisionModule['FilesetResolver'] | null = null
let DrawingUtils: MediaPipeVisionModule['DrawingUtils'] | null = null
let landmarker: FaceLandmarkerInstance | null = null
let animationId = 0
let lastTimestamp = 0
let latestLandmarks: LandmarkPoint[] | null = null
let latestQuality: MeshQuality = {
  ready: false,
  message: 'Cargando malla facial...',
  level: 'loading',
  faceCount: 0,
  pose: null,
}

/** MediaPipe/TFLite escribe INFO en console.error; Next lo muestra como overlay. */
const TFLITE_INFO_NOISE = /Created TensorFlow Lite XNNPACK delegate for CPU/i

let restoreConsoleError: (() => void) | null = null

function silenceTfLiteInfoLogs() {
  if (restoreConsoleError) return
  const previous = console.error
  console.error = (...args: Parameters<typeof console.error>) => {
    if (args.some((arg) => typeof arg === 'string' && TFLITE_INFO_NOISE.test(arg))) {
      return
    }
    previous.apply(console, args)
  }
  restoreConsoleError = () => {
    console.error = previous
    restoreConsoleError = null
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms)
    }),
  ])
}

function evaluateQuality(landmarks: LandmarkPoint[] | null, faceCount = 1): MeshQuality {
  const pose = landmarks ? poseFromLandmarksUtil(landmarks) : null
  if (faceCount >= 2) {
    return {
      ready: false,
      level: 'warn',
      message: 'Más de un rostro',
      faceCount,
      pose,
    }
  }
  if (!landmarks || faceCount !== 1) {
    return {
      ready: false,
      level: 'warn',
      message: 'Colócate frente a la cámara',
      faceCount: faceCount || 0,
      pose,
    }
  }

  let minX = 1
  let minY = 1
  let maxX = 0
  let maxY = 0
  for (const p of landmarks) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  const faceW = maxX - minX
  const faceH = maxY - minY
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2

  if (faceW < 0.22 || faceH < 0.28) {
    return { ready: false, level: 'warn', message: 'Acércate un poco a la cámara', faceCount, pose }
  }
  if (faceW > 0.82 || faceH > 0.92) {
    return { ready: false, level: 'warn', message: 'Aléjate un poco de la cámara', faceCount, pose }
  }
  if (Math.abs(cx - 0.5) > 0.22 || Math.abs(cy - 0.48) > 0.22) {
    return { ready: false, level: 'warn', message: 'Centra tu rostro en el recuadro', faceCount, pose }
  }
  if (
    !pose ||
    Math.abs(pose.yaw) > GRANT_YAW_ABS ||
    Math.abs(pose.pitch) > GRANT_PITCH_ROLL_ABS ||
    Math.abs(pose.roll) > GRANT_PITCH_ROLL_ABS
  ) {
    return { ready: false, level: 'warn', message: 'Mira de frente a la cámara', faceCount, pose }
  }
  return {
    ready: true,
    level: 'ok',
    message: 'Malla lista. Rostro frontal detectado',
    faceCount,
    pose,
  }
}

async function loadMediaPipe() {
  const url = new URL(BUNDLE_URL, window.location.origin).href
  const loader = new Function('u', 'return import(u)') as (u: string) => Promise<MediaPipeVisionModule>
  const mod = await loader(url)
  FaceLandmarker = mod.FaceLandmarker
  FilesetResolver = mod.FilesetResolver
  DrawingUtils = mod.DrawingUtils
}

async function createLandmarker(delegate: 'GPU' | 'CPU') {
  if (!FilesetResolver || !FaceLandmarker) {
    throw new Error('MediaPipe no está cargado')
  }
  const vision = await FilesetResolver.forVisionTasks(WASM_URL)
  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_URL,
      delegate,
    },
    runningMode: 'VIDEO',
    numFaces: 2,
    minFaceDetectionConfidence: 0.5,
    minFacePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  })
}

function nextTimestamp() {
  const now = performance.now()
  if (now <= lastTimestamp) {
    lastTimestamp += 1
  } else {
    lastTimestamp = now
  }
  return lastTimestamp
}

function drawMesh(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkPoint[],
  quality: MeshQuality,
) {
  if (!DrawingUtils || !FaceLandmarker) return
  const drawingUtils = new DrawingUtils(ctx)
  const tessColor = quality.ready ? '#22d3ee55' : '#94a3b855'
  const contourColor = quality.ready ? '#22c55e' : '#f59e0b'
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
    color: tessColor,
    lineWidth: 0.6,
  })
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_CONTOURS, {
    color: contourColor,
    lineWidth: 1.4,
  })
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, {
    color: '#38bdf8',
    lineWidth: 1.6,
  })
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, {
    color: '#38bdf8',
    lineWidth: 1.6,
  })
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
    color: '#fb7185',
    lineWidth: 1.6,
  })
}

function setFallback(onQuality: ((quality: MeshQuality) => void) | undefined, error: unknown) {
  console.error('No se pudo iniciar MediaPipe Face Landmarker', error)
  latestQuality = {
    ready: false,
    message: 'No se pudo cargar la malla facial.',
    level: 'error',
    fallback: true,
    faceCount: 0,
    pose: null,
  }
  onQuality?.(latestQuality)
}

export async function startFaceMesh({
  video,
  canvas,
  onQuality,
}: {
  video: HTMLVideoElement
  canvas: HTMLCanvasElement
  onQuality?: (quality: MeshQuality) => void
}) {
  stopFaceMesh()
  silenceTfLiteInfoLogs()
  latestLandmarks = null
  latestQuality = {
    ready: false,
    message: 'Cargando malla facial...',
    level: 'loading',
    faceCount: 0,
    pose: null,
  }
  onQuality?.(latestQuality)

  try {
    await withTimeout(loadMediaPipe(), LOAD_TIMEOUT_MS, 'Timeout cargando MediaPipe')
    try {
      landmarker = await withTimeout(
        createLandmarker('GPU'),
        LOAD_TIMEOUT_MS,
        'Timeout iniciando malla GPU',
      )
    } catch (gpuError) {
      console.warn('GPU no disponible para la malla, usando CPU', gpuError)
      landmarker = await withTimeout(
        createLandmarker('CPU'),
        LOAD_TIMEOUT_MS,
        'Timeout iniciando malla CPU',
      )
    }
  } catch (error) {
    setFallback(onQuality, error)
    return
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    setFallback(onQuality, new Error('Canvas 2D no disponible'))
    return
  }

  const loop = () => {
    if (!landmarker || video.readyState < 2) {
      animationId = requestAnimationFrame(loop)
      return
    }

    if (video.videoWidth) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let result: { faceLandmarks?: LandmarkPoint[][] }
    try {
      result = landmarker.detectForVideo(video, nextTimestamp())
    } catch (error) {
      console.warn('detectForVideo falló', error)
      animationId = requestAnimationFrame(loop)
      return
    }

    const faceCount = result.faceLandmarks ? result.faceLandmarks.length : 0
    if (faceCount >= 1 && result.faceLandmarks) {
      const landmarks = result.faceLandmarks[0]
      latestQuality = evaluateQuality(landmarks, faceCount)
      latestLandmarks = landmarks.map((p) => ({ x: p.x, y: p.y, z: p.z || 0 }))
      drawMesh(ctx, landmarks, latestQuality)
    } else {
      latestLandmarks = null
      latestQuality = evaluateQuality(null, 0)
    }
    onQuality?.(latestQuality)
    animationId = requestAnimationFrame(loop)
  }

  animationId = requestAnimationFrame(loop)
}

export function stopFaceMesh() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = 0
  }
  if (landmarker) {
    try {
      landmarker.close()
    } catch {
      /* ignore */
    }
    landmarker = null
  }
  latestLandmarks = null
  restoreConsoleError?.()
}

export function getLatestLandmarks() {
  return latestLandmarks
}

export function isMeshReady() {
  return Boolean(latestQuality.ready && latestLandmarks && latestQuality.faceCount === 1)
}

export function isMeshFallback() {
  return Boolean(latestQuality.fallback)
}

export function getLatestFaceCount() {
  return Number(latestQuality.faceCount || 0)
}

export function getLatestPose() {
  return latestQuality.pose || null
}

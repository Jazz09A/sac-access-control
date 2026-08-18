/**
 * Seguimiento de estabilidad: ventana corta, umbrales tolerantes para webcam real.
 * Puerto fiel de FACE-R app/static/js/stability.js
 */

import type { FaceCenter, FacePose, StabilitySample } from './types'

const WINDOW = 10
const NEED = 6
const STABILITY_MS = 500
const CENTER_MAX = 0.12
const POSE_MAX = 8

type TrackerOptions = {
  window?: number
  need?: number
  stabilityMs?: number
  centerMax?: number
  poseMax?: number
}

type BufferedSample = StabilitySample & { at: number }

export class StabilityTracker {
  private window: number
  private need: number
  private stabilityMs: number
  private centerMax: number
  private poseMax: number
  private buffer: BufferedSample[] = []
  private stableSince: number | null = null

  constructor(options: TrackerOptions = {}) {
    this.window = options.window ?? WINDOW
    this.need = options.need ?? NEED
    this.stabilityMs = options.stabilityMs ?? STABILITY_MS
    this.centerMax = options.centerMax ?? CENTER_MAX
    this.poseMax = options.poseMax ?? POSE_MAX
  }

  reset() {
    this.buffer = []
    this.stableSince = null
  }

  progress() {
    const validCount = this.buffer.filter((f) => f.valid).length
    const elapsed = this.stableSince === null ? 0 : performance.now() - this.stableSince
    return {
      validCount,
      need: this.need,
      elapsedMs: Math.round(elapsed),
      requiredMs: this.stabilityMs,
    }
  }

  push(sample: StabilitySample) {
    const centerOk =
      Boolean(sample.center) &&
      Math.abs(sample.center!.x) <= this.centerMax &&
      Math.abs(sample.center!.y) <= this.centerMax
    const frameValid =
      sample.faceCount === 1 &&
      sample.valid &&
      Boolean(sample.pose) &&
      centerOk &&
      this._poseStable(sample)

    this.buffer.push({ ...sample, valid: frameValid, at: performance.now() })
    if (this.buffer.length > this.window) {
      this.buffer.shift()
    }
    if (!frameValid) {
      this.stableSince = null
      return false
    }
    const validCount = this.buffer.filter((f) => f.valid).length
    if (validCount < this.need) {
      this.stableSince = null
      return false
    }
    const now = performance.now()
    if (this.stableSince === null) {
      this.stableSince = now
    }
    return now - this.stableSince >= this.stabilityMs
  }

  private _poseStable(frame: StabilitySample) {
    const recent = this.buffer.filter((f) => f.valid && f.pose)
    if (recent.length === 0) {
      return true
    }
    const avgYaw = recent.reduce((sum, item) => sum + item.pose!.yaw, 0) / recent.length
    const avgPitch = recent.reduce((sum, item) => sum + item.pose!.pitch, 0) / recent.length
    const avgRoll = recent.reduce((sum, item) => sum + item.pose!.roll, 0) / recent.length
    if (!frame.pose) return false
    return (
      Math.abs(frame.pose.yaw - avgYaw) <= this.poseMax &&
      Math.abs(frame.pose.pitch - avgPitch) <= this.poseMax &&
      Math.abs(frame.pose.roll - avgRoll) <= this.poseMax
    )
  }

  buildSample(
    landmarks: unknown,
    faceCount: number,
    pose: FacePose | null,
    center: FaceCenter | null,
    validFn?: (pose: FacePose) => boolean,
  ): StabilitySample {
    const valid =
      faceCount === 1 &&
      Boolean(landmarks) &&
      Boolean(pose) &&
      Boolean(center) &&
      (validFn && pose ? validFn(pose) : true)
    return { faceCount, pose, center, valid }
  }
}

export const STABILITY_COOLDOWN_MS = 1500

/**
 * Pose frontal y centro facial — mismas fórmulas que FACE-R pose-utils.js.
 */

import type { FaceCenter, FacePose, LandmarkPoint } from './types'

const LEFT_EYE = [33, 133, 160, 159, 158, 157, 173, 246]
const RIGHT_EYE = [362, 263, 387, 386, 385, 384, 398, 466]
const NOSE_TIP = 1
const CHIN = 152
const LEFT_CHEEK = 234
const RIGHT_CHEEK = 454
export const YAW_SCALE = 50
const YAW_Z_SCALE = 140
const YAW_BLEND_Z = 0.45
export const GRANT_YAW_ABS = 15
export const GRANT_PITCH_ROLL_ABS = 10

function meanPoint(landmarks: LandmarkPoint[], indices: number[]) {
  let x = 0
  let y = 0
  for (const i of indices) {
    x += landmarks[i].x
    y += landmarks[i].y
  }
  return { x: x / indices.length, y: y / indices.length }
}

export function poseFromLandmarks(landmarks: LandmarkPoint[]): FacePose {
  const left = meanPoint(landmarks, LEFT_EYE)
  const right = meanPoint(landmarks, RIGHT_EYE)
  const nose = landmarks[NOSE_TIP]
  const chin = landmarks[CHIN]
  const cheekL = landmarks[LEFT_CHEEK]
  const cheekR = landmarks[RIGHT_CHEEK]
  const dLeft = Math.abs(nose.x - cheekL.x)
  const dRight = Math.abs(cheekR.x - nose.x)
  const yawXy = (YAW_SCALE * (dLeft - dRight)) / (dLeft + dRight + 1e-6)
  const zL = Number(cheekL.z || 0)
  const zR = Number(cheekR.z || 0)
  const yawZ = (zR - zL) * YAW_Z_SCALE
  const yaw =
    Math.abs(zL) + Math.abs(zR) > 1e-6
      ? (1 - YAW_BLEND_Z) * yawXy + YAW_BLEND_Z * yawZ
      : yawXy
  const roll = (Math.atan2(right.y - left.y, right.x - left.x) * 180) / Math.PI
  const eyeMid = { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 }
  const pitch = ((nose.y - eyeMid.y) / (chin.y - eyeMid.y + 1e-6) - 0.4) * 80
  return { yaw, pitch, roll }
}

export function faceCenterOffset(landmarks: LandmarkPoint[]): FaceCenter {
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
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  return { x: cx - 0.5, y: cy - 0.48 }
}

export function isGrantPose(pose: FacePose) {
  return (
    Math.abs(pose.yaw) <= GRANT_YAW_ABS &&
    Math.abs(pose.pitch) <= GRANT_PITCH_ROLL_ABS &&
    Math.abs(pose.roll) <= GRANT_PITCH_ROLL_ABS
  )
}

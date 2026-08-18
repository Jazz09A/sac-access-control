import { Visit, VisitStatus } from '@/types'

export function visitQueueLabel(visit: Pick<Visit, 'contributor_name' | 'contributor_cedula' | 'ticket_no'>): string {
  const name = visit.contributor_name?.trim()
  if (name) return name
  const cedula = visit.contributor_cedula?.trim()
  if (cedula) return cedula
  return visit.ticket_no?.trim() ?? ''
}

export function usableRifValue(rif: string | null | undefined): string {
  const trimmed = rif?.trim() ?? ''
  if (!trimmed || trimmed.toUpperCase().startsWith('TEMP-')) return ''
  return trimmed
}

export function visitInitials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 2)
  const letters = parts.map((part) => part[0]?.toUpperCase() ?? '').join('')
  return letters || '?'
}

export function visitWaitSeconds(visit: Visit, nowMs: number): number {
  if (typeof visit.wait_seconds === 'number' && Number.isFinite(visit.wait_seconds)) {
    return Math.max(0, Math.floor(visit.wait_seconds))
  }

  const created = visit.created_at ? Date.parse(visit.created_at) : Number.NaN
  if (!Number.isNaN(created)) {
    return Math.max(0, Math.floor((nowMs - created) / 1000))
  }

  if (visit.entry_date && visit.entry_time) {
    const entry = Date.parse(`${visit.entry_date}T${visit.entry_time}`)
    if (!Number.isNaN(entry)) {
      return Math.max(0, Math.floor((nowMs - entry) / 1000))
    }
  }

  return 0
}

export function attentionElapsedSeconds(visit: Visit, nowMs: number, fallbackStartedAt: number): number {
  if (visit.called_at) {
    const called = Date.parse(visit.called_at)
    if (!Number.isNaN(called)) {
      return Math.max(0, Math.floor((nowMs - called) / 1000))
    }
  }
  return Math.max(0, Math.floor((nowMs - fallbackStartedAt) / 1000))
}

export function sortQueueFifo(queue: Visit[]): Visit[] {
  return [...queue].sort((left, right) => {
    const leftAt = Date.parse(left.created_at || `${left.entry_date}T${left.entry_time}`)
    const rightAt = Date.parse(right.created_at || `${right.entry_date}T${right.entry_time}`)
    const leftSafe = Number.isNaN(leftAt) ? Number.POSITIVE_INFINITY : leftAt
    const rightSafe = Number.isNaN(rightAt) ? Number.POSITIVE_INFINITY : rightAt
    return leftSafe - rightSafe
  })
}

export function nextWaitingVisit(queue: Visit[]): Visit | undefined {
  return sortQueueFifo(queue).find((visit) => visit.status === VisitStatus.WAITING)
}

export function inServiceVisit(queue: Visit[]): Visit | undefined {
  return sortQueueFifo(queue).find((visit) => visit.status === VisitStatus.IN_SERVICE)
}

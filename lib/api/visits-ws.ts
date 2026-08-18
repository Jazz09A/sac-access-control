import { getApiBaseUrl } from '@/lib/api/client'

export function buildVisitsWebSocketUrl(accessToken: string): string {
  const httpUrl = new URL('/api/v1/ws/visits', getApiBaseUrl())
  httpUrl.searchParams.set('access_token', accessToken)
  httpUrl.protocol = httpUrl.protocol === 'https:' ? 'wss:' : 'ws:'
  return httpUrl.toString()
}

export const VISIT_LIVE_EVENTS = new Set([
  'visit.created',
  'visit.called',
  'visit.closed',
  'visit.exited',
  'visit.updated',
  'visit.attended',
  'visit.deleted',
])

export function isVisitLiveEvent(eventType: unknown): boolean {
  return typeof eventType === 'string' && VISIT_LIVE_EVENTS.has(eventType)
}

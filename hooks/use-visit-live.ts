'use client'

import { useEffect, useRef } from 'react'
import { getAccessToken } from '@/lib/api/auth-token'
import { buildVisitsWebSocketUrl, isVisitLiveEvent } from '@/lib/api/visits-ws'

const POLL_MS = 9000
const RECONNECT_MS = 12000

type LiveMessage = {
  event_type?: string
  type?: string
  event?: string
}

function eventTypeFromPayload(raw: string): string | null {
  try {
    const payload = JSON.parse(raw) as LiveMessage
    const eventType = payload.event_type ?? payload.type ?? payload.event
    return typeof eventType === 'string' ? eventType : null
  } catch {
    return null
  }
}

/**
 * Keeps visit lists/metrics fresh via WebSocket. Falls back to polling if the
 * socket cannot stay open so the queue is never silent.
 */
export function useVisitLiveRefresh(onRefresh: () => void, enabled = true) {
  const onRefreshRef = useRef(onRefresh)
  onRefreshRef.current = onRefresh

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    let cancelled = false
    let socket: WebSocket | null = null
    let pollId: number | null = null
    let reconnectId: number | null = null

    const refresh = () => {
      if (!cancelled) onRefreshRef.current()
    }

    const stopPolling = () => {
      if (pollId != null) {
        window.clearInterval(pollId)
        pollId = null
      }
    }

    const startPolling = () => {
      if (cancelled || pollId != null) return
      pollId = window.setInterval(refresh, POLL_MS)
    }

    const disconnectSocket = () => {
      if (!socket) return
      socket.onopen = null
      socket.onmessage = null
      socket.onerror = null
      socket.onclose = null
      socket.close()
      socket = null
    }

    const connect = async () => {
      if (cancelled) return
      const token = await getAccessToken()
      if (cancelled) return

      if (!token) {
        startPolling()
        return
      }

      try {
        socket = new WebSocket(buildVisitsWebSocketUrl(token))
      } catch {
        startPolling()
        return
      }

      socket.onopen = () => {
        stopPolling()
      }

      socket.onmessage = (event) => {
        if (typeof event.data !== 'string') {
          refresh()
          return
        }
        const eventType = eventTypeFromPayload(event.data)
        if (!eventType || isVisitLiveEvent(eventType)) {
          refresh()
        }
      }

      socket.onerror = () => {
        // onclose handles fallback
      }

      socket.onclose = () => {
        socket = null
        if (cancelled) return
        startPolling()
        reconnectId = window.setTimeout(() => {
          reconnectId = null
          void connect()
        }, RECONNECT_MS)
      }
    }

    void connect()

    return () => {
      cancelled = true
      stopPolling()
      if (reconnectId != null) window.clearTimeout(reconnectId)
      disconnectSocket()
    }
  }, [enabled])
}

'use client'

import { useEffect, useState } from 'react'

interface DebugInfo {
  timestamp: string
  userAgent: string
  url: string
  cookies: string
  isSecure: boolean
  isLocalhost: boolean
  localStorage: Record<string, string>
}

export function LoginDebug() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [envInfo, setEnvInfo] = useState<unknown>(null)
  const [cookieInfo, setCookieInfo] = useState<unknown>(null)

  useEffect(() => {
    // Recopilar información del cliente
    const info: DebugInfo = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      cookies: document.cookie,
      isSecure: window.location.protocol === 'https:',
      isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
      localStorage: {},
    }

    // Intentar leer localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          info.localStorage[key] = localStorage.getItem(key) ?? ''
        }
      }
    } catch (e) {
      info.localStorage['error'] = 'No se pudo leer localStorage'
    }

    setDebugInfo(info)

    // Consultar endpoints de debug
    fetch('/api/debug/env')
      .then(r => r.json())
      .then(data => {
        console.log('[LoginDebug] Env info:', data)
        setEnvInfo(data)
      })
      .catch(err => {
        console.error('[LoginDebug] Error fetching env:', err)
        setEnvInfo({ error: err.message })
      })

    fetch('/api/debug/cookies')
      .then(r => r.json())
      .then(data => {
        console.log('[LoginDebug] Cookie info:', data)
        setCookieInfo(data)
      })
      .catch(err => {
        console.error('[LoginDebug] Error fetching cookies:', err)
        setCookieInfo({ error: err.message })
      })
  }, [])

  // Solo mostrar en desarrollo o si hay un parámetro debug en la URL
  const showDebug = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
     window.location.search.includes('debug=true'))

  if (!showDebug) return null

  return (
    <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-xs">
      <h4 className="mb-2 font-semibold text-yellow-600">Debug Info</h4>

      <div className="space-y-2">
        <div>
          <strong>URL:</strong> {debugInfo?.url}
        </div>
        <div>
          <strong>Secure (HTTPS):</strong> {debugInfo?.isSecure ? 'Sí' : 'No'}
        </div>
        <div>
          <strong>Cookies en navegador:</strong> {debugInfo?.cookies || 'Ninguna'}
        </div>
        <div>
          <strong>User Agent:</strong> {debugInfo?.userAgent}
        </div>

        <div className="mt-3 border-t border-yellow-500/20 pt-2">
          <strong>Server Env (from /api/debug/env):</strong>
          <pre className="mt-1 max-h-40 overflow-auto rounded bg-black/10 p-2">
            {JSON.stringify(envInfo, null, 2)}
          </pre>
        </div>

        <div className="mt-3 border-t border-yellow-500/20 pt-2">
          <strong>Server Cookies (from /api/debug/cookies):</strong>
          <pre className="mt-1 max-h-40 overflow-auto rounded bg-black/10 p-2">
            {JSON.stringify(cookieInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Loader2, Lock, ShieldCheck, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Debug: log when component mounts
  useEffect(() => {
    console.log('[LoginForm] Component mounted, JS is working')
  }, [])

  // Clear credentials from URL immediately on mount (security)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    const hasCredentials = url.searchParams.has('username') || url.searchParams.has('password')
    if (hasCredentials) {
      url.searchParams.delete('username')
      url.searchParams.delete('password')
      window.history.replaceState({}, '', url.toString())
      // Show error since credentials were exposed in URL
      setError('Error de seguridad: las credenciales no deben enviarse por URL. Por favor intente de nuevo.')
    }
  }, [])

  async function doLogin() {
    if (!username.trim() || !password) {
      setError('Por favor ingrese cédula y contraseña')
      return
    }

    setError(null)
    setLoading(true)

    try {
      console.log('[LoginForm] Intentando login...')
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })

      console.log('[LoginForm] Response status:', res.status)

      let data: { ok?: boolean; detail?: string } = {}
      try {
        data = await res.json()
      } catch {
        // Ignore parse error, will handle below
      }

      console.log('[LoginForm] Response data:', data)

      if (!res.ok) {
        setError(data.detail || 'Credenciales incorrectas')
        return
      }

      if (data.ok === true) {
        console.log('[LoginForm] Login exitoso, redirigiendo...')
        // Force full page reload to trigger middleware cookie check
        window.location.href = '/'
      } else {
        setError('Respuesta inesperada del servidor')
      }
    } catch (err) {
      console.error('[LoginForm] Error:', err)
      setError('No se pudo conectar. ¿Está el backend en marcha?')
    } finally {
      setLoading(false)
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    void doLogin()
  }

  return (
    <Card className="w-full max-w-[400px] border-white/10 bg-card/80 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <CardHeader className="space-y-3 pb-2 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_28px_rgba(59,130,246,0.35)]">
          <ShieldCheck className="size-7" />
        </div>
        <CardTitle className="font-display text-2xl tracking-tight">Ingreso al sistema</CardTitle>
        <CardDescription className="text-balance text-sm">
          Control de ingresos — Introduce tus credenciales.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
        <form
          onSubmit={onSubmit}
          className="space-y-5"
          noValidate
          action="javascript:void(0)"
          role="form"
        >
          {/* Fallback for users without JavaScript - prevents credential exposure */}
          <noscript>
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive text-center">
              <strong>Error:</strong> JavaScript es requerido para iniciar sesión de forma segura.
              Sin JavaScript, las credenciales podrían exponerse en la URL.
              Por favor habilite JavaScript o contacte al administrador.
            </div>
            {/* Disable the form when JS is not available */}
            <style>{`
              form[role="form"] button[type="submit"] {
                display: none !important;
              }
            `}</style>
          </noscript>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-xs uppercase tracking-wider text-muted-foreground">
              Cédula
            </Label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 rounded-xl border-white/10 bg-background/50 pl-10"
                placeholder="Ej. 19344555"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl border-white/10 bg-background/50 pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          {error ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl text-base font-medium shadow-[0_0_24px_rgba(59,130,246,0.22)]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Entrando…
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

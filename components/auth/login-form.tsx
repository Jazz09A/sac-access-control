'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, ShieldCheck, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    console.log('[LoginForm] Intentando login...')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      console.log('[LoginForm] Response status:', res.status)
      const data = await res.json().catch(() => ({}))
      console.log('[LoginForm] Response data:', data)
      if (!res.ok) {
        setError(typeof data.detail === 'string' ? data.detail : 'Credenciales incorrectas')
        return
      }
      console.log('[LoginForm] Login exitoso, redirigiendo...')
      // Usar window.location para forzar un full reload y que el middleware detecte la cookie
      window.location.href = '/'
    } catch (err) {
      console.error('[LoginForm] Error:', err)
      setError('No se pudo conectar. ¿Está el backend en marcha?')
    } finally {
      setLoading(false)
    }
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
        <form onSubmit={onSubmit} className="space-y-5">
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

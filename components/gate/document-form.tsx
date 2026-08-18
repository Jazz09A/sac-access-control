'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLocale } from '@/components/providers/locale-provider'
import type { GateIdentity } from '@/lib/gate/types'

interface DocumentFormProps {
  initial?: Partial<Pick<GateIdentity, 'cedula'>>
  loading?: boolean
  error?: string | null
  onSubmit: (values: { cedula: string }) => void
}

export function DocumentForm({ initial, loading, error, onSubmit }: DocumentFormProps) {
  const { t } = useLocale()
  const cedulaRef = useRef<HTMLInputElement>(null)
  const [cedula, setCedula] = useState(initial?.cedula ?? '')
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    cedulaRef.current?.focus()
  }, [])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const cleanCedula = cedula.replace(/[^0-9]/g, '')
    if (cleanCedula.length < 6) {
      setLocalError(t('gate.document.cedulaInvalid'))
      cedulaRef.current?.focus()
      return
    }
    setLocalError(null)
    onSubmit({ cedula: cleanCedula })
  }

  return (
    <Card>
      <CardHeader>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {t('gate.document.label')}
        </p>
        <CardTitle className="text-2xl">{t('gate.document.title')}</CardTitle>
        <CardDescription className="text-base">{t('gate.document.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="gate-cedula">{t('gate.document.cedula')}</Label>
            <Input
              ref={cedulaRef}
              id="gate-cedula"
              inputMode="numeric"
              autoComplete="off"
              className="h-14 text-lg"
              autoFocus
              value={cedula}
              onChange={(event) => setCedula(event.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
              disabled={loading}
            />
          </div>
          {(localError || error) && (
            <p className="text-sm text-destructive" role="alert">
              {localError || error}
            </p>
          )}
          <Button type="submit" size="lg" className="h-14 w-full text-lg" disabled={loading}>
            {loading ? <Loader2 className="size-5 animate-spin" /> : t('gate.document.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

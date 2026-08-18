'use client'

import { FormEvent, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLocale } from '@/components/providers/locale-provider'
import { DEPARTMENTS } from '@/utils/constants'
import type { GateIdentity } from '@/lib/gate/types'

interface DestinationFormProps {
  identity: GateIdentity
  loading?: boolean
  error?: string | null
  onSubmit: (values: { department: string }) => void
}

export function DestinationForm({ identity, loading, error, onSubmit }: DestinationFormProps) {
  const { t } = useLocale()
  const [department, setDepartment] = useState(DEPARTMENTS[0] ?? '')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!department) {
      setLocalError(t('gate.destination.departmentRequired'))
      return
    }
    setLocalError(null)
    onSubmit({ department })
  }

  return (
    <Card>
      <CardHeader>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {t('gate.destination.label')}
        </p>
        <CardTitle className="text-2xl">{t('gate.destination.title')}</CardTitle>
        <CardDescription className="text-base">{t('gate.destination.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <p className="text-lg">
            <span className="text-muted-foreground">{t('gate.identity.cedula')}: </span>
            <span className="font-medium">{identity.cedula}</span>
          </p>
          <div className="space-y-2">
            <Label htmlFor="gate-department">{t('gate.destination.department')}</Label>
            <Select value={department} onValueChange={setDepartment} disabled={loading}>
              <SelectTrigger id="gate-department" className="h-14 w-full text-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(localError || error) && (
            <p className="text-sm text-destructive" role="alert">
              {localError || error}
            </p>
          )}
          <Button type="submit" size="lg" className="h-14 w-full text-lg" disabled={loading}>
            {loading ? <Loader2 className="size-5 animate-spin" /> : t('gate.destination.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

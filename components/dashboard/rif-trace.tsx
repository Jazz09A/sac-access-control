'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLocale } from '@/components/providers/locale-provider'
import { getVisitsHistory } from '@/services/visits'
import { getVenezuelaDate } from '@/utils/formatters'
import { VisitHistory } from '@/types'

export function RifTrace() {
  const { t } = useLocale()
  const [rif, setRif] = useState('')
  const [items, setItems] = useState<VisitHistory[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    const query = rif.trim()
    if (!query) return
    setIsLoading(true)
    setError(null)
    setSearched(true)
    try {
      const today = getVenezuelaDate()
      const result = await getVisitsHistory({
        rif: query,
        fecha_desde: today,
        fecha_hasta: today,
        limit: 8,
      })
      setItems(result.items)
    } catch (err) {
      setItems(null)
      setError(err instanceof Error ? err.message : t('dashboard.rifError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="gap-3 rounded-lg bg-white/[0.03] py-3">
      <CardHeader className="px-4 pb-0">
        <p className="text-xs text-muted-foreground">{t('dashboard.rifLabel')}</p>
        <CardTitle className="text-sm font-medium">{t('dashboard.rifTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pt-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="min-w-0 flex-1">
            <Label htmlFor="dashboard-rif" className="sr-only">
              {t('dashboard.rifTitle')}
            </Label>
            <Input
              id="dashboard-rif"
              value={rif}
              onChange={(event) => setRif(event.target.value)}
              placeholder={t('dashboard.rifPlaceholder')}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void handleSearch()
              }}
            />
          </div>
          <Button onClick={() => void handleSearch()} disabled={isLoading || !rif.trim()}>
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            {t('dashboard.rifSearch')}
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2" aria-busy="true">
            <div className="h-8 animate-pulse rounded-md bg-muted/40" />
            <div className="h-8 animate-pulse rounded-md bg-muted/40" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-300">{error}</p>
        ) : !searched ? (
          <p className="text-sm text-muted-foreground">{t('dashboard.rifIdle')}</p>
        ) : !items || items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('dashboard.rifEmptyHint')}</p>
        ) : (
          <ul>
            {items.map((visit) => (
              <li key={visit.id} className="flex items-center justify-between gap-3 py-1.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{visit.contribuyente}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {visit.depto || '—'} · {visit.motivo}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {t(`dashboard.status.${visit.estado}`)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

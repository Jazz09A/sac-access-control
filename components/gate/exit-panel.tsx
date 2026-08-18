'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocale } from '@/components/providers/locale-provider'
import { Visit } from '@/types'
import { cn } from '@/lib/utils'

interface ExitPanelProps {
  visits: Visit[]
  selectedId: string | null
  loading?: boolean
  error?: string | null
  onSelect: (visitId: string) => void
  onConfirm: () => void
  onSwitchToEntry: () => void
  onAskDocument: () => void
}

export function ExitPanel({
  visits,
  selectedId,
  loading,
  error,
  onSelect,
  onConfirm,
  onSwitchToEntry,
  onAskDocument,
}: ExitPanelProps) {
  const { t } = useLocale()

  if (loading && visits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('gate.exit.loadingTitle')}</CardTitle>
          <CardDescription className="text-base">{t('gate.exit.loadingBody')}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" aria-hidden />
          <p>{t('gate.exit.loadingBody')}</p>
        </CardContent>
      </Card>
    )
  }

  if (error && visits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('gate.error.title')}</CardTitle>
          <CardDescription className="text-base" role="alert">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button type="button" size="lg" className="h-14 text-lg" onClick={onSwitchToEntry}>
            {t('gate.exit.backToEntry')}
          </Button>
          <Button type="button" size="lg" variant="outline" className="h-14 text-lg" onClick={onAskDocument}>
            {t('gate.exit.askDocument')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (visits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('gate.exit.emptyTitle')}</CardTitle>
          <CardDescription className="text-base">{t('gate.exit.emptyBody')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button type="button" size="lg" className="h-14 text-lg" onClick={onSwitchToEntry}>
            {t('gate.exit.backToEntry')}
          </Button>
          <Button type="button" size="lg" variant="outline" className="h-14 text-lg" onClick={onAskDocument}>
            {t('gate.exit.askDocument')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {t('gate.exit.label')}
        </p>
        <CardTitle className="text-2xl">{t('gate.exit.title')}</CardTitle>
        <CardDescription className="text-base">{t('gate.exit.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {visits.map((visit) => {
            const selected = visit.id === selectedId
            const cedula = visit.contributor_cedula
            return (
              <li key={visit.id}>
                <button
                  type="button"
                  onClick={() => onSelect(visit.id)}
                  className={cn(
                    'w-full rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    selected
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:bg-muted/40',
                  )}
                >
                  <p className="text-lg font-medium">
                    {visit.ticket_no || visit.id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {cedula ? `${t('gate.identity.cedula')} ${cedula} · ` : ''}
                    {visit.department || '—'} · {visit.entry_time}
                  </p>
                </button>
              </li>
            )
          })}
        </ul>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button
          type="button"
          size="lg"
          className="h-14 w-full text-lg"
          disabled={!selectedId || loading}
          onClick={onConfirm}
        >
          {loading ? <Loader2 className="size-5 animate-spin" /> : t('gate.exit.confirm')}
        </Button>
      </CardContent>
    </Card>
  )
}

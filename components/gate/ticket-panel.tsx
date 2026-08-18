'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocale } from '@/components/providers/locale-provider'

interface TicketPanelProps {
  ticketNo: string
  cedula: string
  department?: string
  stayLabel?: string
  onNext: () => void
}

export function TicketPanel({ ticketNo, cedula, department, stayLabel, onNext }: TicketPanelProps) {
  const { t } = useLocale()

  return (
    <Card className="border-primary/40">
      <CardHeader className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {t('gate.ticket.label')}
        </p>
        <CardTitle className="font-mono text-5xl tracking-tight sm:text-6xl">{ticketNo}</CardTitle>
        <CardDescription className="space-y-1 text-lg text-foreground">
          <span className="block">
            {t('gate.identity.cedula')}: {cedula}
            {department ? ` · ${department}` : ''}
          </span>
          {stayLabel ? (
            <span className="block">
              {t('gate.ticket.stay')}: {stayLabel}
            </span>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button type="button" size="lg" className="h-14 w-full text-lg" onClick={onNext}>
          {t('gate.ticket.next')}
        </Button>
      </CardContent>
    </Card>
  )
}

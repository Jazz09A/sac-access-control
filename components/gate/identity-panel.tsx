'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocale } from '@/components/providers/locale-provider'
import type { GateIdentity } from '@/lib/gate/types'

interface IdentityPanelProps {
  identity: GateIdentity
}

export function IdentityPanel({ identity }: IdentityPanelProps) {
  const { t } = useLocale()

  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {t('gate.identity.label')}
        </p>
        <CardTitle className="text-3xl font-medium tracking-tight">
          {identity.cedula || t('gate.identity.unknownName')}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-lg text-muted-foreground">
        {t('gate.identity.cedula')}
      </CardContent>
    </Card>
  )
}

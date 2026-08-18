'use client'

import { Badge } from '@/components/ui/badge'
import { useLocale } from '@/components/providers/locale-provider'
import { cn } from '@/lib/utils'
import type { AssetStatus } from '@/services/assets'

const statusClasses: Record<AssetStatus, string> = {
  in_sede: 'border-emerald-400/15 bg-emerald-400/10 text-emerald-200',
  assigned: 'border-sky-400/15 bg-sky-400/10 text-sky-200',
  in_transit_out: 'border-orange-400/15 bg-orange-400/10 text-orange-200',
}

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  const { t } = useLocale()
  return (
    <Badge variant="outline" className={cn('border', statusClasses[status])}>
      {t(`assets.status.${status}`)}
    </Badge>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    label: string
  }
}

export function MetricsCard({
  title,
  value,
  icon: Icon,
  description,
  trend
}: MetricsCardProps) {
  return (
    <Card className="gap-3 bg-white/[0.03] py-4">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0">
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </span>
        <div className="flex size-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03]">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-semibold tracking-[-0.03em] text-foreground xl:text-[2rem]">{value}</div>
        {description && (
          <p className="text-xs leading-5 text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className={cn(
            'w-fit rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em]',
            trend.value > 0
              ? 'border-primary/25 bg-primary/10 text-primary'
              : 'border-red-400/20 bg-red-500/10 text-red-300'
          )}>
            {trend.value > 0 && '+'}
            {trend.value}% {trend.label}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

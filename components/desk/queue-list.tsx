'use client'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useLocale } from '@/components/providers/locale-provider'
import { cn } from '@/lib/utils'
import { visitInitials, visitQueueLabel, visitWaitSeconds } from '@/lib/desk/queue'
import { formatClockSeconds } from '@/utils/formatters'
import { Visit, VisitStatus } from '@/types'

const statusClasses: Record<VisitStatus, string> = {
  [VisitStatus.WAITING]: 'border-yellow-400/15 bg-yellow-400/10 text-yellow-200',
  [VisitStatus.IN_SERVICE]: 'border-sky-400/15 bg-sky-400/10 text-sky-200',
  [VisitStatus.ATTENDED]: 'border-emerald-400/15 bg-emerald-400/10 text-emerald-200',
  [VisitStatus.INCOMPLETE]: 'border-orange-400/15 bg-orange-400/10 text-orange-200',
  [VisitStatus.REFERRED]: 'border-violet-400/15 bg-violet-400/10 text-violet-200',
  [VisitStatus.FINISHED]: 'border-green-400/15 bg-green-400/10 text-green-200',
}

interface QueueListProps {
  department: string
  queue: Visit[]
  nowMs: number
  isLoading: boolean
}

export function QueueList({ department, queue, nowMs, isLoading }: QueueListProps) {
  const { t } = useLocale()

  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-live="polite">
        <p className="text-sm font-medium text-foreground">{t('desk.loadingTitle')}</p>
        <p className="text-xs text-muted-foreground">{t('desk.loadingBody')}</p>
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-2xl border border-border/60 p-3">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (queue.length === 0) {
    return (
      <p className="py-10 text-center text-sm leading-6 text-muted-foreground">
        {t('desk.emptyQueue').replace('{depto}', department)}
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {queue.map((visit) => {
        const wait = visit.status === VisitStatus.WAITING
          ? visitWaitSeconds(visit, nowMs)
          : (visit.wait_seconds ?? visitWaitSeconds(visit, nowMs))
        const label = visitQueueLabel(visit)
        const ticket = visit.ticket_no?.trim()

        return (
          <li
            key={visit.id}
            className={cn(
              'flex items-center gap-3 rounded-2xl border p-3',
              visit.status === VisitStatus.IN_SERVICE
                ? 'border-primary/30 bg-primary/[0.06]'
                : 'border-border/60 bg-white/[0.03]',
            )}
          >
            <Avatar className="size-12 rounded-2xl">
              <AvatarImage src={visit.signature_image_url || undefined} alt="" />
              <AvatarFallback className="rounded-2xl bg-muted text-xs font-medium">
                {visitInitials(visit.contributor_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-foreground">
                  {label}
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    'h-5 border px-2 py-0 text-[10px] font-medium uppercase tracking-[0.14em]',
                    statusClasses[visit.status],
                  )}
                >
                  {t(`dashboard.status.${visit.status}`)}
                </Badge>
              </div>
              {ticket && ticket !== label ? (
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {t('desk.ticket')} {ticket}
                </p>
              ) : null}
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {t('desk.wait')}
              </p>
              <p className="mt-1 font-mono text-sm tabular-nums text-foreground">
                {formatClockSeconds(wait)}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

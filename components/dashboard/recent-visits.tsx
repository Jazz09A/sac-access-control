import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Visit, VisitStatus } from '@/types'
import { formatDateTime, formatTimeAgo } from '@/utils/formatters'
import { Eye, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecentVisitsProps {
  visits: Visit[]
  title?: string
}

export function RecentVisits({ visits, title = 'Visitas Recientes' }: RecentVisitsProps) {
  const statusLabel: Record<VisitStatus, string> = {
    [VisitStatus.ACTIVE]: 'Activa',
    [VisitStatus.CLOSED]: 'Cerrada',
    [VisitStatus.PENDING]: 'Pendiente'
  }

  const statusClasses: Record<VisitStatus, string> = {
    [VisitStatus.ACTIVE]: 'border-primary/20 bg-primary/10 text-primary',
    [VisitStatus.CLOSED]: 'border-white/8 bg-white/[0.04] text-foreground/80',
    [VisitStatus.PENDING]: 'border-amber-400/15 bg-amber-400/10 text-amber-200'
  }

  return (
    <Card className="h-full gap-4 bg-white/[0.03] py-5">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Seguimiento
            </p>
            <CardTitle className="mt-2 text-xl font-medium tracking-tight">{title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="size-9 rounded-full border border-white/8 bg-white/[0.03] text-muted-foreground hover:text-foreground">
            <ArrowUpRight className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay visitas registradas
            </p>
          ) : (
            visits.map((visit) => (
              <div
                key={visit.id}
                className="flex items-center justify-between p-4 border border-border/60 rounded-xl hover:border-primary/30 transition-all hover:bg-primary/[0.02] group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {visit.contributor.name}
                    </h4>
                    <Badge variant="outline" className={cn('h-5 border px-2 py-0 text-[10px] font-medium uppercase tracking-[0.14em]', statusClasses[visit.status])}>
                      {statusLabel[visit.status]}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-0.5 mt-2">
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {formatTimeAgo(visit.entryDateTime)}
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {visit.reason}
                    </p>
                    <p className="text-[11px] text-foreground/70">
                      {visit.department} · {formatDateTime(visit.entryDateTime)}
                    </p>
                  </div>
                </div>
                <Link href={`/${visit.id}`}>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-white/8 bg-white/[0.03] opacity-0 transition-opacity group-hover:opacity-100">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

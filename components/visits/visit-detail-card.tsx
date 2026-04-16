import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Visit, VisitStatus } from '@/types'
import { formatDateTime, formatDuration } from '@/utils/formatters'
import { Clock, User, Briefcase, MapPin, FileText } from 'lucide-react'

interface VisitDetailCardProps {
  visit: Visit
}

export function VisitDetailCard({ visit }: VisitDetailCardProps) {
  const statusLabel: Record<VisitStatus, string> = {
    [VisitStatus.ACTIVE]: 'Activa',
    [VisitStatus.CLOSED]: 'Cerrada',
    [VisitStatus.PENDING]: 'Pendiente'
  }

  const statusClassName: Record<VisitStatus, string> = {
    [VisitStatus.ACTIVE]: 'border-sky-200 bg-sky-50 text-sky-700',
    [VisitStatus.CLOSED]: 'border-border bg-muted text-foreground/80',
    [VisitStatus.PENDING]: 'border-amber-200 bg-amber-50 text-amber-700'
  }

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="gap-4 border-b border-border/70 pb-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Expediente de visita
            </div>
            <div>
              <CardTitle className="text-xl font-medium tracking-tight">{visit.reason}</CardTitle>
              <CardDescription className="mt-1 text-sm">
                Registro administrativo asociado a {visit.contributor.name}
              </CardDescription>
            </div>
          </div>
          <Badge className={statusClassName[visit.status]}>
            {statusLabel[visit.status]}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
          <div className="rounded-[18px] border border-border/60 bg-muted/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Contribuyente
            </p>
            <p className="mt-2 font-medium text-foreground">
              {visit.contributor.name}
            </p>
          </div>
          <div className="rounded-[18px] border border-border/60 bg-muted/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Entrada
            </p>
            <p className="mt-2 font-medium text-foreground">
              {formatDateTime(visit.entryDateTime)}
            </p>
          </div>
          <div className="rounded-[18px] border border-border/60 bg-muted/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Fiscal responsable
            </p>
            <p className="mt-2 font-medium text-foreground">
              {visit.officer}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3 rounded-[18px] border border-border/60 bg-muted/20 p-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="flex size-8 items-center justify-center rounded-full bg-background text-muted-foreground">
              <Briefcase className="size-4" />
            </span>
            Informacion del contribuyente
          </h4>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <p className="text-muted-foreground">RIF</p>
              <p className="font-medium">{visit.contributor.rif}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tipo</p>
              <p className="font-medium capitalize">
                {visit.contributor.type.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Ocupación</p>
              <p className="font-medium">{visit.contributor.occupation}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Teléfono</p>
              <p className="font-medium">{visit.contributor.phone}</p>
            </div>
            {visit.contributor.email && (
              <div className="col-span-2">
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium text-sm break-all">{visit.contributor.email}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 rounded-[18px] border border-border/60 bg-muted/20 p-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="flex size-8 items-center justify-center rounded-full bg-background text-muted-foreground">
              <Clock className="size-4" />
            </span>
            Cronograma
          </h4>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div className="rounded-[16px] border border-border/50 bg-background p-4">
              <p className="text-muted-foreground">Entrada</p>
              <p className="font-medium">{formatDateTime(visit.entryDateTime)}</p>
            </div>
            {visit.exitDateTime && (
              <div className="rounded-[16px] border border-border/50 bg-background p-4">
                <p className="text-muted-foreground">Salida</p>
                <p className="font-medium">{formatDateTime(visit.exitDateTime)}</p>
              </div>
            )}
            {visit.exitDateTime && (
              <div className="rounded-[16px] border border-border/50 bg-background p-4 md:col-span-2">
                <p className="text-muted-foreground">Duración</p>
                <p className="font-medium">
                  {formatDuration(visit.entryDateTime, visit.exitDateTime)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 rounded-[18px] border border-border/60 bg-muted/20 p-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="flex size-8 items-center justify-center rounded-full bg-background text-muted-foreground">
              <MapPin className="size-4" />
            </span>
            Detalles de la visita
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Departamento</p>
                <p className="font-medium">{visit.department}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Fiscal Responsable</p>
                <p className="font-medium">{visit.officer}</p>
              </div>
            </div>
            {visit.fileNumber && (
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground">Número de Expediente</p>
                  <p className="font-medium">{visit.fileNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {visit.observations && (
          <div className="space-y-3 rounded-[18px] border border-border/60 bg-muted/20 p-4">
            <h4 className="text-sm font-medium text-foreground">Observaciones</h4>
            <div className="rounded-[16px] border border-border/50 bg-background p-4">
              <p className="text-sm whitespace-pre-wrap">{visit.observations}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

'use client'

import { Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { VisitHistory, VisitStatus } from '@/types'
import { formatDateTime } from '@/utils/formatters'
import { STATUS_COLORS } from '@/utils/constants'

interface ResultsTableProps {
  visits: VisitHistory[]
  isLoading?: boolean
  totalCount?: number
  onPageChange?: (page: number) => void
  currentPage?: number
}

export function ResultsTable({
  visits,
  isLoading = false,
  totalCount = 0,
  currentPage = 1
}: ResultsTableProps) {
  const statusLabel: Record<VisitStatus, string> = {
    [VisitStatus.ACTIVE]: 'Activa',
    [VisitStatus.CLOSED]: 'Cerrada',
    [VisitStatus.PENDING]: 'Pendiente',
    [VisitStatus.WAITING]: 'En Espera',
    [VisitStatus.FINISHED]: 'Finalizado',
    [VisitStatus.ATTENDED]: 'Atendida',
    [VisitStatus.REJECTED]: 'Rechazada',
    [VisitStatus.RESCHEDULED]: 'Reprogramada'
  }

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando resultados...</p>
        </div>
      </Card>
    )
  }

  if (visits.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-muted-foreground">
            No se encontraron resultados. Intente con otros parámetros de búsqueda.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-border/50">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/20">
              <TableHead className="w-32 font-mono text-[10px] uppercase tracking-wider px-6">RIF</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">Contribuyente</TableHead>
              <TableHead className="hidden md:table-cell font-mono text-[10px] uppercase tracking-wider">Registro</TableHead>
              <TableHead className="hidden lg:table-cell font-mono text-[10px] uppercase tracking-wider">Depto.</TableHead>
              <TableHead className="hidden sm:table-cell font-mono text-[10px] uppercase tracking-wider">Motivo</TableHead>
              <TableHead className="w-24 font-mono text-[10px] uppercase tracking-wider">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visits.map((visit, index) => (
              <TableRow key={`${visit.rif}-${index}`} className="hover:bg-primary/[0.02] transition-colors">
                <TableCell className="font-mono text-xs font-semibold px-6">
                  {visit.rif}
                </TableCell>
                <TableCell>
                  <div className="py-1">
                    <p className="font-semibold text-sm">{visit.contribuyente}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs font-medium text-muted-foreground">
                  {visit.registro || '-'}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-xs font-medium">
                  <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">{visit.depto}</span>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-xs text-muted-foreground truncate max-w-xs font-medium">
                  {visit.motivo}
                </TableCell>
                <TableCell>
                  <Badge variant={visit.estado === VisitStatus.WAITING ? 'outline' : 'default'}>
                    {statusLabel[visit.estado]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Info */}
      <div className="px-6 py-4 border-t text-sm text-muted-foreground">
        <p>
          Mostrando {visits.length} de {totalCount} resultados{' '}
          {totalCount > 10 && `(Página ${currentPage})`}
        </p>
      </div>
    </Card>
  )
}

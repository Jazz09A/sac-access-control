'use client'

import { useRouter } from 'next/navigation'
import { Eye, MoreHorizontal, CheckCircle, LogOut, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { VisitHistory, VisitStatus } from '@/types'
import { formatDateTime } from '@/utils/formatters'
import { STATUS_COLORS } from '@/utils/constants'

interface ResultsTableProps {
  visits: VisitHistory[]
  isLoading?: boolean
  totalCount?: number
  onPageChange?: (page: number) => void
  currentPage?: number
  onMarkAsAttended?: (visitId: string) => void
  onRegisterExit?: (visitId: string) => void
  onEditVisit?: (visit: VisitHistory) => void
  processingVisitId?: string | null
}

export function ResultsTable({
  visits,
  isLoading = false,
  totalCount = 0,
  currentPage = 1,
  onMarkAsAttended,
  onRegisterExit,
  onEditVisit,
  processingVisitId = null,
}: ResultsTableProps) {
  const router = useRouter()
  const safeVisits = Array.isArray(visits) ? visits : []

  const statusLabel: Record<VisitStatus, string> = {
    [VisitStatus.WAITING]: 'En Espera',
    [VisitStatus.ATTENDED]: 'Atendida',
    [VisitStatus.FINISHED]: 'Finalizado'
  }

  const handleViewDetails = (visitId: string) => {
    router.push(`/${visitId}`)
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-3">
              <Skeleton className="col-span-2 h-8" />
              <Skeleton className="col-span-3 h-8" />
              <Skeleton className="col-span-2 h-8" />
              <Skeleton className="col-span-2 h-8" />
              <Skeleton className="col-span-2 h-8" />
              <Skeleton className="col-span-1 h-8" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (safeVisits.length === 0) {
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
              <TableHead className="w-24 font-mono text-[10px] uppercase tracking-wider text-right px-6">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeVisits.map((visit) => (
              <TableRow key={visit.id} className="hover:bg-primary/[0.02] transition-colors">
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
                <TableCell className="text-right px-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={processingVisitId === visit.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(visit.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>

                      {onEditVisit && (
                        <DropdownMenuItem
                          onClick={() => onEditVisit(visit)}
                          disabled={processingVisitId === visit.id}
                        >
                          <Pencil className="mr-2 h-4 w-4 text-amber-600" />
                          Editar visita
                        </DropdownMenuItem>
                      )}
                      
                      {visit.estado === VisitStatus.WAITING && onMarkAsAttended && (
                        <DropdownMenuItem
                          onClick={() => onMarkAsAttended(visit.id)}
                          disabled={processingVisitId === visit.id}
                        >
                          <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                          Marcar como Atendido
                        </DropdownMenuItem>
                      )}
                      
                      {(visit.estado === VisitStatus.WAITING || visit.estado === VisitStatus.ATTENDED) && onRegisterExit && (
                        <DropdownMenuItem
                          onClick={() => onRegisterExit(visit.id)}
                          disabled={processingVisitId === visit.id}
                        >
                          <LogOut className="mr-2 h-4 w-4 text-green-600" />
                          Registrar Salida
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Info */}
      <div className="px-6 py-4 border-t text-sm text-muted-foreground">
        <p>
          Mostrando {safeVisits.length} de {totalCount} resultados{' '}
          {totalCount > 10 && `(Página ${currentPage})`}
        </p>
      </div>
    </Card>
  )
}

'use client'

import Link from 'next/link'
import { Mail, Phone, Edit2, Trash2 } from 'lucide-react'
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
import { Contributor } from '@/types'
import { CONTRIBUTOR_TYPE_OPTIONS } from '@/utils/constants'
import { formatDate } from '@/utils/formatters'

interface ContributorsTableProps {
  contributors: Contributor[]
  isLoading?: boolean
  onEdit?: (contributor: Contributor) => void
  onDelete?: (id: string) => void
}

export function ContributorsTable({
  contributors,
  isLoading = false,
  onEdit,
  onDelete
}: ContributorsTableProps) {
  const getTypeName = (type: string): string => {
    return CONTRIBUTOR_TYPE_OPTIONS.find((opt) => opt.value === type)?.label || type
  }

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando contribuyentes...</p>
        </div>
      </Card>
    )
  }

  if (contributors.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            No hay contribuyentes registrados aún
          </p>
          <Link href="/contributors/new">
            <Button>Crear Nuevo Contribuyente</Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="w-24">RIF</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead className="hidden lg:table-cell">Ocupación</TableHead>
              <TableHead className="hidden sm:table-cell">Contacto</TableHead>
              <TableHead className="hidden lg:table-cell">Registrado</TableHead>
              <TableHead className="w-20">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contributors.map((contributor) => (
              <TableRow
                key={contributor.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-mono text-sm font-medium">
                  {contributor.rif}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{contributor.name}</p>
                    <p className="text-xs text-muted-foreground md:hidden">
                      {getTypeName(contributor.type)}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline">
                    {getTypeName(contributor.type)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm">
                  {contributor.occupation}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="space-y-1">
                    {contributor.phone && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{contributor.phone}</span>
                      </div>
                    )}
                    {contributor.email && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{contributor.email}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {formatDate(contributor.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(contributor)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm('¿Está seguro de eliminar este contribuyente?')) {
                            onDelete(contributor.id)
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

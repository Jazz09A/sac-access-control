'use client'

import { useState } from 'react'
import { Search, Calendar, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { SearchFilters } from '@/types'
import { VISIT_STATUS_OPTIONS } from '@/utils/constants'

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void
  isLoading?: boolean
}

export function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
  const ALL_STATUS_VALUE = 'all'
  const [rif, setRif] = useState('')
  const [contribuyente, setContribuyente] = useState('')
  const [registro, setRegistro] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [status, setStatus] = useState<string>(ALL_STATUS_VALUE)
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = () => {
    onSearch({
      rif: rif || undefined,
      contribuyente: contribuyente || undefined,
      registro: registro || undefined,
      departamento: departamento || undefined,
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
      skip: 0,
      limit: 100
    })
  }

  const handleReset = () => {
    setRif('')
    setContribuyente('')
    setRegistro('')
    setDepartamento('')
    setStatus(ALL_STATUS_VALUE)
    setFechaDesde('')
    setFechaHasta('')
    onSearch({})
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Card className="p-8 border-border/50">
      <div className="space-y-6">
        {/* Main Search Inputs */}
        <div className="space-y-4">
          <Label className="text-[10px] font-mono font-bold uppercase tracking-[0.05em] text-muted-foreground block px-1">
            Búsqueda Principal
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rif" className="text-[10px] font-mono font-bold uppercase tracking-[0.05em] text-muted-foreground block px-1">
                RIF
              </Label>
              <Input
                id="rif"
                placeholder="ej: J-12345678-9"
                value={rif}
                onChange={(e) => setRif(e.target.value)}
                className="h-10 bg-muted/20 border-transparent focus-visible:bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contribuyente" className="text-[10px] font-mono font-bold uppercase tracking-[0.05em] text-muted-foreground block px-1">
                Contribuyente
              </Label>
              <Input
                id="contribuyente"
                placeholder="Nombre del contribuyente"
                value={contribuyente}
                onChange={(e) => setContribuyente(e.target.value)}
                className="h-10 bg-muted/20 border-transparent focus-visible:bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registro" className="text-[10px] font-mono font-bold uppercase tracking-[0.05em] text-muted-foreground block px-1">
                Número de Registro
              </Label>
              <Input
                id="registro"
                placeholder="ej: EXP-2026-00045"
                value={registro}
                onChange={(e) => setRegistro(e.target.value)}
                className="h-10 bg-muted/20 border-transparent focus-visible:bg-transparent"
              />
            </div>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-8 h-10 text-sm font-semibold"
            >
              Buscar
            </Button>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary"
          >
            <Filter className="w-3 h-3 mr-2" />
            {showFilters ? 'Ocultar Filtros' : 'Filtros Avanzados'}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="pt-6 border-t border-border/50 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Department Filter */}
              {/* <div className="space-y-2">
                <Label htmlFor="departamento" className="text-[10px] font-mono font-bold uppercase tracking-[0.05em] text-muted-foreground block px-1">
                  Departamento
                </Label>
                <Input
                  id="departamento"
                  placeholder="ej: Fiscalizacion"
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                  className="h-10 bg-muted/20 border-transparent"
                />
              </div> */}

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-[10px] font-mono font-bold uppercase tracking-[0.05em] text-muted-foreground block px-1">
                Estado
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="h-10 bg-muted/20 border-transparent">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_STATUS_VALUE}>Todos los estados</SelectItem>
                  {VISIT_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Start */}
            <div className="space-y-2">
              <Label htmlFor="fechaDesde" className="text-[10px] font-mono font-bold uppercase tracking-[0.05em] text-muted-foreground block px-1">
                Fecha Desde
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fechaDesde"
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="pl-10 h-10 bg-muted/20 border-transparent"
                />
              </div>
            </div>

            {/* Date Range End */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fechaHasta" className="text-[10px] font-mono font-bold uppercase tracking-[0.05em] text-muted-foreground block px-1">
                Fecha Hasta
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fechaHasta"
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="pl-10 h-10 bg-muted/20 border-transparent"
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="md:col-span-3 flex gap-3 pt-2">
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="flex-1 h-10 font-bold"
              >
                Aplicar Filtros
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={isLoading}
                className="h-10 border-border/50 font-bold"
              >
                Limpiar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

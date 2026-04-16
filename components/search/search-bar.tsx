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
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = () => {
    onSearch({
      searchTerm: searchTerm || undefined,
      status: status ? (status as any) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: 1
    })
  }

  const handleReset = () => {
    setSearchTerm('')
    setStatus('')
    setStartDate('')
    setEndDate('')
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
        {/* Main Search Input */}
        <div className="space-y-3">
          <Label className="text-[10px] font-mono font-bold uppercase tracking-[0.05em] text-muted-foreground block px-1">
            Buscar por RIF, Nombre o Número de Expediente
          </Label>
          <div className="flex gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="ej: V-12345678 o Juan Pérez"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-12 h-12 bg-muted/20 border-transparent focus-visible:bg-transparent"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-8 h-12 text-base font-semibold"
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
                  <SelectItem value="">Todos los estados</SelectItem>
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
              <Label htmlFor="startDate" className="text-[10px] font-mono font-bold uppercase tracking-[0.05em] text-muted-foreground block px-1">
                Desde
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10 h-10 bg-muted/20 border-transparent"
                />
              </div>
            </div>

            {/* Date Range End */}
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-[10px] font-mono font-bold uppercase tracking-[0.05em] text-muted-foreground block px-1">
                Hasta
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
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

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Check, ChevronsUpDown, Search, Loader2, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { searchFiscals } from '@/services/fiscals'
import { Fiscal } from '@/types'

const PAGE_SIZE = 20

interface FiscalSelectorProps {
  value?: number
  onSelect: (fiscal: Fiscal) => void
  disabled?: boolean
  placeholder?: string
}

export function FiscalSelector({
  value,
  onSelect,
  disabled = false,
  placeholder = 'Buscar fiscal...'
}: FiscalSelectorProps) {
  const [open, setOpen] = useState(false)
  const [fiscals, setFiscals] = useState<Fiscal[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [selectedFiscal, setSelectedFiscal] = useState<Fiscal | null>(null)

  // Refs — own div so scroll events work reliably
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)
  const skipRef = useRef(0)
  const fiscalsRef = useRef<Fiscal[]>([])

  // Keep fiscalsRef in sync
  useEffect(() => {
    fiscalsRef.current = fiscals
  }, [fiscals])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Load fiscals from API
  const loadFiscals = useCallback(async (reset: boolean, query: string) => {
    if (loadingRef.current) return

    loadingRef.current = true
    setIsLoading(true)

    const currentSkip = reset ? 0 : skipRef.current

    try {
      const results = await searchFiscals({
        query: query || undefined,
        skip: currentSkip,
        limit: PAGE_SIZE
      })

      if (reset) {
        setFiscals(results)
        skipRef.current = results.length
        setHasMore(results.length === PAGE_SIZE)
      } else {
        const existingIds = new Set(fiscalsRef.current.map(f => f.id))
        const newFiscals = results.filter(f => !existingIds.has(f.id))

        if (newFiscals.length === 0 || results.length < PAGE_SIZE) {
          setHasMore(false)
        }

        if (newFiscals.length > 0) {
          setFiscals(prev => [...prev, ...newFiscals])
          skipRef.current = skipRef.current + results.length
        }
      }
    } catch (error) {
      console.error('Error loading fiscals:', error)
      setHasMore(false)
    } finally {
      loadingRef.current = false
      setIsLoading(false)
    }
  }, [])

  // Reload when popover opens or search changes
  useEffect(() => {
    if (!open) return
    skipRef.current = 0
    setHasMore(true)
    loadFiscals(true, debouncedQuery)
  }, [open, debouncedQuery, loadFiscals])

  // Infinite scroll via onScroll on the scrollable div
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el || !hasMore || loadingRef.current) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    if (nearBottom) {
      loadFiscals(false, debouncedQuery)
    }
  }, [hasMore, debouncedQuery, loadFiscals])

  // Find selected fiscal by ID when value is set externally
  useEffect(() => {
    if (value && !selectedFiscal) {
      const found = fiscals.find(f => f.id === value)
      if (found) setSelectedFiscal(found)
    }
  }, [value, fiscals, selectedFiscal])

  const handleSelect = (fiscal: Fiscal) => {
    setSelectedFiscal(fiscal)
    onSelect(fiscal)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            !value && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          {selectedFiscal ? (
            <span className="flex items-center gap-2 truncate">
              <User className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{selectedFiscal.name}</span>
              <Badge variant="secondary" className="ml-2 shrink-0 text-xs">
                ID: {selectedFiscal.id}
              </Badge>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Escriba para buscar fiscales..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {/* Own scrollable div so onScroll is reliable */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="max-h-[300px] overflow-y-auto"
            >
              {fiscals.length === 0 && !isLoading && (
                <CommandEmpty>
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No se encontraron fiscales
                  </div>
                </CommandEmpty>
              )}

              {fiscals.length === 0 && isLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
                </div>
              )}

              {fiscals.length > 0 && (
                <CommandGroup heading={`${fiscals.length} fiscales${hasMore ? '+' : ''}`}>
                  {fiscals.map((fiscal, index) => (
                    <CommandItem
                      key={`${fiscal.id}-${index}`}
                      value={`${fiscal.id}-${fiscal.name}`}
                      onSelect={() => handleSelect(fiscal)}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{fiscal.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ID: {fiscal.id} • {fiscal.email}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {value === fiscal.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                        <Badge
                          variant={fiscal.status ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {fiscal.status ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {hasMore && fiscals.length > 0 && (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-xs text-muted-foreground">Cargando más...</span>
                </div>
              )}

              {!hasMore && fiscals.length > 0 && (
                <div className="py-3 text-center text-xs text-muted-foreground">
                  No hay más fiscales
                </div>
              )}
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

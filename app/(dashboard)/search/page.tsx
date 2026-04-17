'use client'

import { useState } from 'react'
import { SearchBar } from '@/components/search/search-bar'
import { ResultsTable } from '@/components/search/results-table'
import { SearchFilters } from '@/types'
import { mockVisits } from '@/services/mock-data'

export default function SearchPage() {
  const [filteredVisits, setFilteredVisits] = useState(mockVisits)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = (filters: SearchFilters) => {
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      let results = [...mockVisits]

      // Filter by search term (RIF or Name)
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase()
        results = results.filter(
          (visit) =>
            visit.contributor.rif.toLowerCase().includes(term) ||
            visit.contributor.name.toLowerCase().includes(term) ||
            visit.fileNumber?.toLowerCase().includes(term)
        )
      }

      // Filter by status
      if (filters.status) {
        results = results.filter((visit) => visit.status === filters.status)
      }

      // Filter by date range
      if (filters.startDate) {
        results = results.filter(
          (visit) => new Date(visit.entryDateTime) >= filters.startDate!
        )
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate)
        endDate.setHours(23, 59, 59, 999)
        results = results.filter(
          (visit) => new Date(visit.entryDateTime) <= endDate
        )
      }

      setFilteredVisits(results)
      setIsLoading(false)
    }, 600)
  }

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12">
      <div className="space-y-4">
        <h1 className="text-7xl font-display font-medium text-foreground tracking-[-0.03em] leading-[0.9]">Historial de Visitas</h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed font-light italic">
          Búsqueda avanzada y análisis de registros de contribuyentes
        </p>
      </div>

      <SearchBar onSearch={handleSearch} isLoading={isLoading} />

      <ResultsTable
        visits={filteredVisits}
        isLoading={isLoading}
        totalCount={filteredVisits.length}
      />
    </div>
  )
}

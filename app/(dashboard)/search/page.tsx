'use client'

import { useState } from 'react'
import { SearchBar } from '@/components/search/search-bar'
import { ResultsTable } from '@/components/search/results-table'
import { SearchFilters, VisitHistory } from '@/types'
import { getVisitsHistory } from '@/services/visits'

export default function SearchPage() {
  const [visitHistory, setVisitHistory] = useState<VisitHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  const handleSearch = async (filters: SearchFilters) => {
    setIsLoading(true)
    try {
      const data = await getVisitsHistory(filters)
      setVisitHistory(data || [])
      setTotalCount(data?.length || 0)
    } catch (error) {
      console.error('Error fetching visit history:', error)
      // For now, show empty results on error
      setVisitHistory([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
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
        visits={visitHistory}
        isLoading={isLoading}
        totalCount={totalCount}
      />
    </div>
  )
}

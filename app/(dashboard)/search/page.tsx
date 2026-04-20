'use client'

import { useState } from 'react'
import { SearchBar } from '@/components/search/search-bar'
import { ResultsTable } from '@/components/search/results-table'
import { SearchFilters, VisitHistory, VisitStatus } from '@/types'
import { getVisitsHistory, markVisitAsAttended, registerVisitExit } from '@/services/visits'
import { toast } from 'sonner'

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

  const handleMarkAsAttended = async (visitId: string) => {
    try {
      await markVisitAsAttended(visitId)
      toast.success('Visita marcada como atendida')
      // Refresh the search results
      setVisitHistory(prev => prev.map(visit => 
        visit.id === visitId 
          ? { ...visit, estado: VisitStatus.ATTENDED }
          : visit
      ))
    } catch (error) {
      console.error('Error marking as attended:', error)
      toast.error('Error al marcar como atendido')
    }
  }

  const handleRegisterExit = async (visitId: string) => {
    try {
      const now = new Date()
      const exitDate = now.toISOString().split('T')[0]
      const exitTime = now.toTimeString().slice(0, 8)

      await registerVisitExit(visitId, {
        exit_date: exitDate,
        exit_time: exitTime,
        status: VisitStatus.FINISHED
      })
      toast.success('Salida registrada correctamente')
      // Refresh the search results
      setVisitHistory(prev => prev.filter(visit => visit.id !== visitId))
    } catch (error) {
      console.error('Error registering exit:', error)
      toast.error('Error al registrar la salida')
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
        onMarkAsAttended={handleMarkAsAttended}
        onRegisterExit={handleRegisterExit}
      />
    </div>
  )
}

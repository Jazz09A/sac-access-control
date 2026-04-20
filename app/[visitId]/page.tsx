'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, LogOut, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { VisitDetailCard } from '@/components/visits/visit-detail-card'
import { VisitPhoto } from '@/components/visits/visit-photo'
import { getVisit, registerVisitExit, markVisitAsAttended } from '@/services/visits'
import { Visit, VisitStatus } from '@/types'
import { toast } from 'sonner'

export default function VisitDetailPage() {
  const params = useParams()
  const visitId = params.visitId as string
  const [visit, setVisit] = useState<Visit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const [isAttending, setIsAttending] = useState(false)

  // Load visit from API
  useEffect(() => {
    async function loadVisit() {
      try {
        setIsLoading(true)
        const data = await getVisit(visitId)
        setVisit(data)
      } catch (error) {
        console.error('Error loading visit:', error)
        toast.error('Error al cargar los detalles de la visita')
      } finally {
        setIsLoading(false)
      }
    }

    loadVisit()
  }, [visitId])

  const handleRegisterExit = async () => {
    if (!visit) return

    setIsExiting(true)
    try {
      // Get current date and time in Venezuela timezone
      const now = new Date()
      const exitDate = now.toISOString().split('T')[0]
      const exitTime = now.toTimeString().slice(0, 8)

      await registerVisitExit(visitId, {
        exit_date: exitDate,
        exit_time: exitTime,
        status: VisitStatus.FINISHED
      })

      // Refresh visit data
      const updatedVisit = await getVisit(visitId)
      setVisit(updatedVisit)

      toast.success('¡Salida registrada correctamente!')
    } catch (error) {
      console.error('Error registering exit:', error)
      toast.error('Error al registrar la salida. Por favor intente nuevamente.')
    } finally {
      setIsExiting(false)
    }
  }

  const handleMarkAsAttended = async () => {
    if (!visit) return

    setIsAttending(true)
    try {
      await markVisitAsAttended(visitId)

      // Refresh visit data
      const updatedVisit = await getVisit(visitId)
      setVisit(updatedVisit)

      toast.success('¡Visita marcada como atendida!')
    } catch (error) {
      console.error('Error marking as attended:', error)
      toast.error('Error al marcar como atendido. Por favor intente nuevamente.')
    } finally {
      setIsAttending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link href="/search">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver a Búsqueda
            </Button>
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!visit) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/search">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Búsqueda
            </Button>
          </Link>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Visita no encontrada</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <Link href="/search">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver a Búsqueda
            </Button>
          </Link>
          
          {/* Single action button based on status */}
          {visit.status === VisitStatus.WAITING && (
            <Button
              onClick={handleMarkAsAttended}
              disabled={isAttending}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isAttending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Marcando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Marcar como Atendido
                </>
              )}
            </Button>
          )}
          
          {visit.status === VisitStatus.ATTENDED && (
            <Button
              onClick={handleRegisterExit}
              disabled={isExiting}
              className="gap-2 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isExiting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registrando Salida...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  Registrar Salida
                </>
              )}
            </Button>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns on desktop */}
          <div className="lg:col-span-2 space-y-6">
            <VisitDetailCard visit={visit} />
          </div>

          {/* Sidebar - 1 column on desktop */}
          <div className="space-y-6">
            <VisitPhoto
              photoUrl={visit.signature_image_url || undefined}
              contributorName={visit.contributor_name || visit.received_by || 'Contribuyente'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

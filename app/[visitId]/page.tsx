'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VisitDetailCard } from '@/components/visits/visit-detail-card'
import { VisitPhoto } from '@/components/visits/visit-photo'
import { mockVisits } from '@/services/mock-data'
import { Visit } from '@/types'
import { toast } from 'sonner'

export default function VisitDetailPage() {
  const params = useParams()
  const visitId = params.visitId as string
  const [isExiting, setIsExiting] = useState(false)

  // Find the visit in mock data
  const visit = mockVisits.find((v) => v.id === visitId)

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

  const handleRegisterExit = async () => {
    setIsExiting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      console.log('[v0] Exit registered for visit:', visitId)
      toast.success('¡Salida registrada correctamente!')

      // Update visit status would happen here
    } catch (error) {
      console.error('[v0] Error registering exit:', error)
      toast.error('Error al registrar la salida. Por favor intente nuevamente.')
    } finally {
      setIsExiting(false)
    }
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
          
          {visit.status === 'activa' && (
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
              photoUrl={visit.photoUrl}
              contributorName={visit.contributor.name}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

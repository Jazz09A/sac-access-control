'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContributorsTable } from '@/components/contributors/contributors-table'
import { mockContributors } from '@/services/mock-data'
import { toast } from 'sonner'

export default function ContributorsPage() {
  const [contributors, setContributors] = useState(mockContributors)

  const handleDelete = (id: string) => {
    setContributors(contributors.filter((c) => c.id !== id))
    toast.success('Contribuyente eliminado correctamente')
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Contribuyentes</h1>
          <p className="text-muted-foreground mt-2">
            Administre la información de contribuyentes registrados en el sistema
          </p>
        </div>
        <Link href="/contributors/new">
          <Button className="gap-2" size="lg">
            <Plus className="w-4 h-4" />
            Nuevo Contribuyente
          </Button>
        </Link>
      </div>

      <ContributorsTable
        contributors={contributors}
        onDelete={handleDelete}
      />
    </div>
  )
}

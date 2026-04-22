'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { ContributorForm } from '@/components/forms/contributor-form'
import { contributorSchema } from '@/schemas/contributor'
import { toast } from 'sonner'

const newContributorSchema = z.object({
  contributor: contributorSchema
})

type NewContributorInput = z.infer<typeof newContributorSchema>

export default function NewContributorPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, control, formState, handleSubmit } = useForm<NewContributorInput>({
    resolver: zodResolver(newContributorSchema),
    mode: 'onBlur'
  })

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // console.log('[v0] New contributor created:', data)  
      toast.success('¡Contribuyente creado correctamente!')

      router.push('/contributors')
    } catch (error) {
      console.error('[v0] Error creating contributor:', error)
      toast.error('Error al crear el contribuyente. Por favor intente nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <Link href="/contributors">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver a Contribuyentes
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-foreground">Crear Nuevo Contribuyente</h1>
        <p className="text-muted-foreground mt-2">
          Registre un nuevo contribuyente en el sistema
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <ContributorForm
          register={register}
          control={control}
          formState={formState}
        />

        <div className="flex flex-col gap-4 border-t border-border/70 pt-6 sm:flex-row">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="min-w-[220px] flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Contribuyente'
            )}
          </Button>
          <Link href="/contributors" className="sm:min-w-[160px] sm:flex-1">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isSubmitting}
              className="w-full"
            >
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}

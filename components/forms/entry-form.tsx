'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ContributorForm } from './contributor-form'
import { VisitForm } from './visit-form'
import { PhotoUpload } from './photo-upload'
import { entrySchema, type EntryInput } from '@/schemas/entry'

interface EntryFormProps {
  onSuccess?: (data: EntryInput) => void
}

export function EntryForm({ onSuccess }: EntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    control,
    formState,
    handleSubmit,
    setValue
  } = useForm<EntryInput>({
    resolver: zodResolver(entrySchema),
    mode: 'onBlur',
    defaultValues: {
      contributor: {
        rif: '',
        name: '',
        type: undefined,
        occupation: '',
        phone: '',
        email: ''
      },
      visit: {
        entryDateTime: new Date(),
        reason: '',
        observations: '',
        officer: '',
        department: '',
        fileNumber: ''
      },
      photoUrl: ''
    }
  })

  const handlePhotoSelect = (photoUrl: string) => {
    setValue('photoUrl', photoUrl)
  }

  const onSubmit = async (data: EntryInput) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      console.log('[v0] Entry form submitted:', data)
      toast.success('¡Entrada registrada correctamente!')

      if (onSuccess) {
        onSuccess(data)
      }

      // Reset form would go here
    } catch (error) {
      console.error('[v0] Error submitting entry form:', error)
      toast.error('Error al registrar la entrada. Por favor intente nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Contributor Section */}
      <ContributorForm
        register={register}
        control={control}
        formState={formState}
      />

      {/* Visit Section */}
      <VisitForm register={register} control={control} formState={formState} />

      {/* Photo Upload Section */}
      <div className="space-y-6">
        <PhotoUpload
          onPhotoSelect={handlePhotoSelect}
          label="Foto del Contribuyente"
          required={false}
        />
      </div>

      {/* Form Actions */}
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
              Registrando...
            </>
          ) : (
            'Registrar Entrada'
          )}
        </Button>
        <Button
          type="reset"
          variant="outline"
          size="lg"
          disabled={isSubmitting}
          className="sm:min-w-[160px]"
        >
          Limpiar
        </Button>
      </div>

      {/* Validation Summary */}
      {Object.keys(formState.errors).length > 0 && (
        <div className="rounded-[18px] border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">
            Por favor corrija los errores en el formulario antes de continuar.
          </p>
        </div>
      )}
    </form>
  )
}

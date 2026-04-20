'use client'

import { useState, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ContributorForm } from './contributor-form'
import { VisitForm } from './visit-form'
import { PhotoUpload } from './photo-upload'
import { entrySchema, type EntryInput } from '@/schemas/entry'
import { buildVenezuelaDateTime, getVenezuelaDateTimeInput, formatDateForAPI, formatTimeForAPI } from '@/utils/formatters'
import { createVisitWithPhoto } from '@/services/visits'
import { getVenezuelaDate, getVenezuelaTime } from '@/utils/formatters'

interface EntryFormProps {
  onSuccess?: (data: EntryInput) => void
}

export function EntryForm({ onSuccess }: EntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoKey, setPhotoKey] = useState(0)
  const nowInVenezuela = getVenezuelaDateTimeInput()

  const {
    register,
    control,
    formState,
    handleSubmit,
    setValue,
    reset,
    trigger
  } = useForm<EntryInput>({
    resolver: zodResolver(entrySchema),
    mode: 'onChange',
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
        entryDateTime: buildVenezuelaDateTime(nowInVenezuela.date, nowInVenezuela.time),
        reason: '',
        observations: '',
        fiscalId: undefined as unknown as number, // Will be set by FiscalSelector
        department: 'Fiscalización', // Auto-set department
        fileNumber: ''
      },
      photoUrl: ''
    }
  })

  // Watch all field values to validate in real time
  const watchedValues = useWatch({ control })

  const handlePhotoSelect = (photoUrl: string) => {
    setValue('photoUrl', photoUrl)
  }

  const handleFileSelect = (file: File | null) => {
    setPhotoFile(file)
  }

  // Get validation status for form
  const validationStatus = useMemo(() => {
    const errors = formState.errors
    const values = watchedValues
    const contributor = values?.contributor
    const visit = values?.visit

    const incompleteFields: string[] = []
    const errorFields: string[] = []

    // Helper: a field is incomplete if empty/undefined AND no error (error takes priority)
    const checkField = (hasError: boolean, isEmpty: boolean, label: string) => {
      if (hasError) {
        errorFields.push(label)
      } else if (isEmpty) {
        incompleteFields.push(label)
      }
    }

    checkField(
      Boolean(errors.contributor?.rif),
      !contributor?.rif || contributor.rif.trim() === '' || !contributor.rif.includes('-'),
      'RIF'
    )
    checkField(
      Boolean(errors.contributor?.name),
      !contributor?.name || contributor.name.trim() === '',
      'Nombre'
    )
    checkField(
      Boolean(errors.contributor?.type),
      !contributor?.type,
      'Tipo'
    )
    checkField(
      Boolean(errors.contributor?.occupation),
      !contributor?.occupation || contributor.occupation.trim() === '',
      'Ocupación'
    )
    checkField(
      Boolean(errors.contributor?.phone),
      !contributor?.phone || contributor.phone.trim() === '',
      'Teléfono'
    )
    checkField(
      Boolean(errors.visit?.entryDateTime),
      !visit?.entryDateTime,
      'Fecha y hora'
    )
    checkField(
      Boolean(errors.visit?.reason),
      !visit?.reason || visit.reason.trim() === '',
      'Motivo'
    )
    checkField(
      Boolean(errors.visit?.fiscalId),
      !visit?.fiscalId,
      'Fiscal'
    )

    // Photo is always "incomplete" if not provided
    if (!photoFile) {
      incompleteFields.push('Foto del contribuyente')
    }

    const totalFields = 9
    const invalidCount = incompleteFields.length + errorFields.length
    const validFields = totalFields - invalidCount
    const isComplete = invalidCount === 0 && photoFile !== null

    return {
      validFields,
      totalFields,
      missingCount: incompleteFields.length,
      errorCount: errorFields.length,
      isComplete,
      missingFields: incompleteFields,
      errorFields
    }
  }, [formState.errors, watchedValues, photoFile])

  const resetForm = () => {
    const freshNow = getVenezuelaDateTimeInput()
    reset({
      contributor: {
        rif: '',
        name: '',
        type: undefined,
        occupation: '',
        phone: '',
        email: ''
      },
      visit: {
        entryDateTime: buildVenezuelaDateTime(freshNow.date, freshNow.time),
        reason: '',
        observations: '',
        fiscalId: undefined as unknown as number,
        department: 'Fiscalización',
        fileNumber: ''
      },
      photoUrl: ''
    })
    setPhotoFile(null)
    setPhotoKey((prev) => prev + 1)
  }

  const onSubmit = async (data: EntryInput) => {
    setIsSubmitting(true)
    try {
      const entryDate = new Date(data.visit.entryDateTime)
      const entryDateStr = formatDateForAPI(entryDate)
      const entryTimeStr = formatTimeForAPI(entryDate)

      // Prepare request data - department is always "Fiscalización"
      const visitRequest = {
        contributor_name: data.contributor.name,
        responsible_person: data.contributor.name, // Using contributor name as responsible person
        fiscal_id: data.visit.fiscalId,
        reason: data.visit.reason,
        observations: data.visit.observations || undefined,
        department: 'Fiscalización', // Always send Fiscalización
        file_number: data.visit.fileNumber || undefined,
        entry_date: entryDateStr,
        entry_time: entryTimeStr,
        photo: photoFile!
      }

      // Send to backend with photo
      await createVisitWithPhoto(visitRequest)

      toast.success('¡Entrada registrada correctamente!')

      if (onSuccess) {
        onSuccess(data)
      }

      // Reset all form fields and photo
      resetForm()
    } catch (error) {
      console.error('Error submitting entry form:', error)
      toast.error(error instanceof Error ? error.message : 'Error al registrar la entrada. Por favor intente nuevamente.')
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
        setValue={setValue}
      />

      {/* Visit Section */}
      <VisitForm register={register} control={control} formState={formState} setValue={setValue} />

      {/* Photo Upload Section */}
      <div className="space-y-6">
        <PhotoUpload
          key={photoKey}
          onPhotoSelect={handlePhotoSelect}
          onFileSelect={handleFileSelect}
          label="Foto del Contribuyente"
          required={true}
        />
      </div>

      {/* Validation Status Summary - Before buttons */}
      <div className={`rounded-[18px] border border-border/60 p-4 ${
        validationStatus.isComplete
          ? 'bg-muted/30'
          : validationStatus.errorCount > 0
            ? 'bg-destructive/5'
            : 'bg-muted/20'
      }`}>
        <div className="flex items-start gap-3">
          {validationStatus.isComplete ? (
            <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
          ) : validationStatus.errorCount > 0 ? (
            <XCircle className="w-5 h-5 text-destructive mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              validationStatus.isComplete
                ? 'text-foreground'
                : validationStatus.errorCount > 0
                  ? 'text-destructive'
                  : 'text-muted-foreground'
            }`}>
              {validationStatus.isComplete
                ? '✓ Todo listo para registrar la entrada'
                : validationStatus.errorCount > 0
                  ? `Hay ${validationStatus.errorCount} campo(s) con errores que deben corregirse`
                  : `Faltan ${validationStatus.missingCount} campo(s) por completar`
              }
            </p>

            {/* Show missing/error fields */}
            {!validationStatus.isComplete && (
              <div className="mt-3 space-y-2">
                {validationStatus.errorCount > 0 && (
                  <div className="text-sm">
                    <p className="text-destructive/80 font-medium mb-1">Campos con errores:</p>
                    <ul className="list-disc list-inside text-destructive/70">
                      {validationStatus.errorFields.map((field, idx) => (
                        <li key={idx}>{field}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {validationStatus.missingCount > 0 && (
                  <div className="text-sm">
                    <p className="text-muted-foreground/80 font-medium mb-1">Campos pendientes:</p>
                    <ul className="list-disc list-inside text-muted-foreground/70">
                      {validationStatus.missingFields.map((field, idx) => (
                        <li key={idx}>{field}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Progress indicator */}
            <div className="mt-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Progreso:</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      validationStatus.isComplete ? 'bg-primary' : 'bg-muted-foreground/50'
                    }`}
                    style={{
                      width: `${Math.round((validationStatus.validFields / validationStatus.totalFields) * 100)}%`
                    }}
                  />
                </div>
                <span>
                  {validationStatus.validFields}/{validationStatus.totalFields}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col gap-4 border-t border-border/70 pt-6 sm:flex-row">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || !validationStatus.isComplete}
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
    </form>
  )
}

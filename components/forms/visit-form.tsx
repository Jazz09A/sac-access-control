'use client'

import { useState } from 'react'
import { UseFormRegister, FormState, Controller, Control, FieldValues, Path } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { FiscalSelector } from '@/components/fiscals/fiscal-selector'
import { DEPARTMENTS, VISIT_REASONS } from '@/utils/constants'
import { buildVenezuelaDateTime, getVenezuelaDateTimeInput } from '@/utils/formatters'
import { Fiscal } from '@/types'

interface VisitFormProps<T extends FieldValues> {
  register: UseFormRegister<T>
  control: Control<T>
  formState: FormState<T>
  setValue?: any
}

export function VisitForm<T extends FieldValues>({
  register,
  control,
  formState: { errors },
  setValue
}: VisitFormProps<T>) {
  const [selectedFiscal, setSelectedFiscal] = useState<Fiscal | null>(null)

  const getFieldError = (fieldName: string): string | undefined => {
    const keys = fieldName.split('.')
    let error: any = errors
    for (const key of keys) {
      error = error?.[key]
    }
    return error?.message as string | undefined
  }

  const handleFiscalSelect = (fiscal: Fiscal) => {
    setSelectedFiscal(fiscal)
    if (setValue) {
      setValue('visit.fiscalId', fiscal.id, { shouldValidate: true })
    }
  }

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="gap-3 border-b border-border/70 pb-5">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Registro
          </p>
          <CardTitle className="text-xl font-medium tracking-tight">
            Informacion de la visita
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-6">
            Organiza la captura del acceso con un orden documental: cronologia,
            clasificacion y notas operativas en una sola lectura.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            name={'visit.entryDateTime' as Path<T>}
            control={control}
            render={({ field }) => {
              const rawValue = field.value as unknown
              const parsedDate =
                rawValue && (typeof rawValue === 'string' || typeof rawValue === 'number' || rawValue instanceof Date)
                  ? new Date(rawValue)
                  : new Date()
              const safeDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate
              const venezuelaDateTime = getVenezuelaDateTimeInput(safeDate)

              return (
                <>
                  <div className="space-y-2 rounded-[18px] border border-border/60 bg-muted/20 p-4">
                    <Label htmlFor="date" className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Fecha de entrada <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={venezuelaDateTime.date}
                      aria-invalid={Boolean(getFieldError('visit.entryDateTime'))}
                      onChange={(event) => {
                        const nextDate = buildVenezuelaDateTime(
                          event.target.value,
                          venezuelaDateTime.time
                        )
                        field.onChange(nextDate)
                      }}
                      className="bg-background"
                    />
                    {getFieldError('visit.entryDateTime') && (
                      <p className="text-xs text-destructive">
                        {getFieldError('visit.entryDateTime')}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 rounded-[18px] border border-border/60 bg-muted/20 p-4">
                    <Label htmlFor="time" className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Hora de entrada <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={venezuelaDateTime.time}
                      aria-invalid={Boolean(getFieldError('visit.entryDateTime'))}
                      onChange={(event) => {
                        const nextDate = buildVenezuelaDateTime(
                          venezuelaDateTime.date,
                          event.target.value
                        )
                        field.onChange(nextDate)
                      }}
                      className="bg-background"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Se autocompleta con la hora actual de Venezuela y puedes editarla.
                    </p>
                  </div>
                </>
              )
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-[18px] border border-border/60 bg-muted/20 p-4">
            <Label htmlFor="reason" className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Motivo de visita <span className="text-destructive">*</span>
            </Label>
            <Controller
              name={'visit.reason' as Path<T>}
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="reason"
                    aria-invalid={Boolean(getFieldError('visit.reason'))}
                    className="w-full bg-background"
                  >
                    <SelectValue placeholder="Seleccionar motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIT_REASONS.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {getFieldError('visit.reason') && (
              <p className="text-xs text-destructive">
                {getFieldError('visit.reason')}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-[18px] border border-border/60 bg-muted/20 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_1fr]">
            <div className="space-y-2">
              <Label htmlFor="fiscalId" className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Fiscal responsable <span className="text-destructive">*</span>
              </Label>
              <Controller
                name={'visit.fiscalId' as Path<T>}
                control={control}
                render={({ field }) => (
                  <FiscalSelector
                    value={field.value}
                    onSelect={handleFiscalSelect}
                    placeholder="Buscar y seleccionar fiscal..."
                  />
                )}
              />
              {getFieldError('visit.fiscalId') && (
                <p className="text-xs text-destructive">
                  {getFieldError('visit.fiscalId')}
                </p>
              )}
              {selectedFiscal && (
                <p className="text-xs text-muted-foreground">
                  Seleccionado: {selectedFiscal.name} (ID: {selectedFiscal.id})
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations" className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Observaciones
            </Label>
            <Textarea
              id="observations"
              placeholder="Notas adicionales sobre la visita..."
              rows={4}
              aria-invalid={Boolean(getFieldError('visit.observations'))}
              {...register('visit.observations' as Path<T>)}
              className="bg-background"
            />
            {getFieldError('visit.observations') && (
              <p className="text-xs text-destructive">
                {getFieldError('visit.observations')}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

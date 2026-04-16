'use client'

import { UseFormRegister, FormState, FieldValues, Path, Control, Controller } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { CONTRIBUTOR_TYPE_OPTIONS } from '@/utils/constants'

interface ContributorFormProps<T extends FieldValues> {
  register: UseFormRegister<T>
  control: Control<T>
  formState: FormState<T>
}

export function ContributorForm<T extends FieldValues>({
  register,
  control,
  formState: { errors }
}: ContributorFormProps<T>) {
  const getFieldError = (fieldName: string): string | undefined => {
    const keys = fieldName.split('.')
    let error: any = errors
    for (const key of keys) {
      error = error?.[key]
    }
    return error?.message as string | undefined
  }

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="gap-3 border-b border-border/70 pb-5">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Identificacion
          </p>
          <CardTitle className="text-xl font-medium tracking-tight">
            Informacion del contribuyente
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-6">
            Registra los datos base de la persona o entidad para que el expediente conserve
            una lectura clara y uniforme.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-[18px] border border-border/60 bg-muted/20 p-4">
            <Label htmlFor="rif" className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              RIF <span className="text-destructive">*</span>
            </Label>
            <Input
              id="rif"
              placeholder="ej: V-12345678"
              aria-invalid={Boolean(getFieldError('contributor.rif'))}
              {...register('contributor.rif' as Path<T>)}
              className="bg-background"
            />
            {getFieldError('contributor.rif') && (
              <p className="text-xs text-destructive">
                {getFieldError('contributor.rif')}
              </p>
            )}
          </div>

          <div className="space-y-2 rounded-[18px] border border-border/60 bg-muted/20 p-4">
            <Label htmlFor="type" className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Tipo <span className="text-destructive">*</span>
            </Label>
            <Controller
              name={'contributor.type' as Path<T>}
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="type"
                    aria-invalid={Boolean(getFieldError('contributor.type'))}
                    className="w-full bg-background"
                  >
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRIBUTOR_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {getFieldError('contributor.type') && (
              <p className="text-xs text-destructive">
                {getFieldError('contributor.type')}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-[18px] border border-border/60 bg-muted/20 p-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Nombre o razon social <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="ej: Juan Carlos Perez"
              aria-invalid={Boolean(getFieldError('contributor.name'))}
              {...register('contributor.name' as Path<T>)}
              className="bg-background"
            />
            {getFieldError('contributor.name') && (
              <p className="text-xs text-destructive">
                {getFieldError('contributor.name')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="occupation" className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Ocupacion o actividad <span className="text-destructive">*</span>
              </Label>
              <Input
                id="occupation"
                placeholder="ej: Consultor"
                aria-invalid={Boolean(getFieldError('contributor.occupation'))}
                {...register('contributor.occupation' as Path<T>)}
                className="bg-background"
              />
              {getFieldError('contributor.occupation') && (
                <p className="text-xs text-destructive">
                  {getFieldError('contributor.occupation')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Telefono <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="ej: (0212) 123-4567"
                aria-invalid={Boolean(getFieldError('contributor.phone'))}
                {...register('contributor.phone' as Path<T>)}
                className="bg-background"
              />
              {getFieldError('contributor.phone') && (
                <p className="text-xs text-destructive">
                  {getFieldError('contributor.phone')}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="ej: juan@example.com"
              aria-invalid={Boolean(getFieldError('contributor.email'))}
              {...register('contributor.email' as Path<T>)}
              className="bg-background"
            />
            {getFieldError('contributor.email') && (
              <p className="text-xs text-destructive">
                {getFieldError('contributor.email')}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

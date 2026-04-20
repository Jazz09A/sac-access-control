import { z } from 'zod'
import { VisitStatus } from '@/types'

/**
 * Zod Schema for Visit Validation
 */

export const visitSchema = z.object({
  entryDateTime: z.coerce.date().refine(
    (date) => date <= new Date(),
    'Fecha de entrada no puede ser en el futuro'
  ),
  reason: z
    .string()
    .min(1, 'Motivo de visita es requerido')
    .max(200, 'Motivo no puede exceder 200 caracteres'),
  observations: z
    .string()
    .max(500, 'Observaciones no pueden exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  fiscalId: z
    .number({
      required_error: 'Fiscal responsable es requerido',
      invalid_type_error: 'Fiscal responsable debe ser seleccionado de la lista'
    })
    .int('ID de fiscal debe ser un número entero')
    .positive('ID de fiscal debe ser positivo'),
  department: z
    .string()
    .optional()
    .default('Fiscalización'),
  fileNumber: z
    .string()
    .max(50, 'Número de expediente no puede exceder 50 caracteres')
    .optional()
    .or(z.literal(''))
})

export const exitSchema = z.object({
  exitDateTime: z.coerce.date().refine(
    (date) => date <= new Date(),
    'Fecha de salida no puede ser en el futuro'
  ),
  observations: z
    .string()
    .max(500, 'Observaciones no pueden exceder 500 caracteres')
    .optional()
    .or(z.literal(''))
})

export type VisitInput = z.infer<typeof visitSchema>
export type ExitInput = z.infer<typeof exitSchema>

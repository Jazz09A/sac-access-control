import { z } from 'zod'
import { VisitStatus } from '@/types'

/**
 * Zod Schema for Visit Validation
 */

export const visitSchema = z.object({
  entryDateTime: z.date().refine(
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
  officer: z
    .string()
    .min(1, 'Fiscal responsable es requerido')
    .max(100, 'Nombre del fiscal responsable no puede exceder 100 caracteres'),
  department: z
    .string()
    .min(1, 'Departamento es requerido'),
  fileNumber: z
    .string()
    .max(50, 'Número de expediente no puede exceder 50 caracteres')
    .optional()
    .or(z.literal(''))
})

export const exitSchema = z.object({
  exitDateTime: z.date().refine(
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

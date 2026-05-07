import { z } from 'zod'
import { ContributorType } from '@/types'

/**
 * Zod Schema for Contributor Validation
 */

export const contributorSchema = z.object({
  rif: z
    .string()
    .min(1, 'RIF es requerido')
    .regex(/^[VJGEPC]-\d{7,9}$/, 'RIF debe estar en formato válido (ej: J-98765432)'),
  name: z
    .string()
    .min(1, 'Nombre es requerido')
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(100, 'Nombre no puede exceder 100 caracteres'),
  type: z.enum([
    ContributorType.NATURAL,
    ContributorType.LEGAL,
    ContributorType.REPRESENTATIVE,
    ContributorType.MANAGER
  ], {
    required_error: 'Tipo de contribuyente es requerido',
    invalid_type_error: 'Debe seleccionar un tipo de contribuyente válido'
  }),
  occupation: z
    .string()
    .min(1, 'Ocupación es requerida')
    .max(50, 'Ocupación no puede exceder 50 caracteres'),
  phone: z
    .string()
    .regex(/^[\d\-\(\)\s]*$/, 'Formato de teléfono inválido')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal(''))
})

export type ContributorInput = z.infer<typeof contributorSchema>

import { z } from 'zod'
import { contributorSchema } from './contributor'
import { visitSchema } from './visit'

/**
 * Combined Entry Registration Schema
 */

export const entrySchema = z.object({
  contributor: contributorSchema,
  visit: visitSchema,
  photoUrl: z
    .string()
    .url('URL de foto inválida')
    .optional()
    .or(z.literal(''))
})

export type EntryInput = z.infer<typeof entrySchema>

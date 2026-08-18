import { apiRequest } from '@/lib/api/client'
import { ContributorType } from '@/types'
export interface Contributor {
  id: number | string
  rif: string
  cedula?: string | null
  name: string
  type: ContributorType
  occupation: string
  phone: string
  email?: string
  last_fiscal_id?: number | string
  last_reason?: string
  created_at?: string
  updated_at?: string
}

/**
 * Busca un contribuyente exacto por su RIF.
 * @param rif RIF del contribuyente (ej. J-12345678-9)
 * @returns Contributor si existe, rechaza la promesa si no (404)
 */
export async function getContributorByRif(rif: string): Promise<Contributor> {
  try {
    const response = await apiRequest<Contributor>(`/api/v1/contributors/search/${rif}`)
    console.log('getContributorByRif raw response:', response)

    // Map backend types to frontend types
    let mappedType = response.type
    if (response.type === 'natural' as any || response.type === 'persona natural' as any) {
      mappedType = 'persona_natural' as any
    } else if (response.type === 'juridica' as any || response.type === 'persona juridica' as any) {
      mappedType = 'persona_juridica' as any
    }

    return {
      ...response,
      type: mappedType
    }
  } catch (error: any) {
    if (error?.status !== 404 && !error?.message?.includes('404')) {
      console.error('getContributorByRif error:', error)
    }
    throw error
  }
}

import { createVisitWithPhoto, getVisits, registerVisitExit } from '@/services/visits'
import { Visit } from '@/types'

export async function listOpenVisits(params: {
  cedula?: string | null
  contributorId?: number | string | null
}): Promise<Visit[]> {
  const cedula = params.cedula?.trim() || undefined
  let contributor_id: number | undefined
  if (params.contributorId != null && params.contributorId !== '') {
    const numeric = Number(params.contributorId)
    if (Number.isFinite(numeric)) contributor_id = numeric
  }
  if (!cedula && contributor_id == null) return []

  const response = await getVisits({
    cedula,
    contributor_id,
    open: true,
    limit: 50,
  })
  return response.data
}

export async function createGateVisit(data: {
  contributor_cedula: string
  department: string
  photo: File
}): Promise<Visit> {
  return createVisitWithPhoto({
    contributor_cedula: data.contributor_cedula,
    department: data.department,
    photo: data.photo,
  })
}

export async function exitGateVisit(visitId: string): Promise<Visit> {
  return registerVisitExit(visitId)
}


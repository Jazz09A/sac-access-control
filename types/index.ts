/**
 * Core Type Definitions for Taxpayer Entry/Exit Management System
 */

export enum ContributorType {
  NATURAL = 'persona_natural',
  LEGAL = 'persona_juridica',
  REPRESENTATIVE = 'representante',
  MANAGER = 'gestor'
}

export enum VisitStatus {
  WAITING = 'espera',
  IN_SERVICE = 'en_atencion',
  ATTENDED = 'atendido',
  INCOMPLETE = 'incompleto',
  REFERRED = 'remitido',
  FINISHED = 'finalizado'
}

export const VISIT_CLOSE_STATUSES = [
  VisitStatus.ATTENDED,
  VisitStatus.INCOMPLETE,
  VisitStatus.REFERRED,
] as const

export type VisitCloseStatus = (typeof VISIT_CLOSE_STATUSES)[number]

export interface Contributor {
  id: string
  rif: string
  name: string
  type: ContributorType
  occupation: string
  phone: string
  email: string
  createdAt: Date
}

export interface VisitPhoto {
  id: number
  visit_id: string
  photo_url: string
  created_at: string
}

export interface Visit {
  id: string
  contributor_id: number
  contributor_name?: string | null
  contributor_cedula?: string | null
  contributor_rif?: string | null
  ticket_no?: string | null
  fiscal_id: number
  fiscal_name?: string
  reason?: string | null
  observations?: string
  received_by: string
  responsible_person: string
  department: string
  file_number?: string
  entry_date: string
  entry_time: string
  exit_date?: string
  exit_time?: string
  signature_image_url?: string
  status: VisitStatus
  created_at: string
  called_at?: string | null
  closed_at?: string | null
  wait_seconds?: number | null
  attention_seconds?: number | null
  stay_seconds?: number | null
  photos?: VisitPhoto[]
}

export interface VisitHistory {
  id: string
  rif: string
  contribuyente: string
  registro?: string | null
  depto: string
  motivo: string
  estado: VisitStatus
}

export interface DashboardMetrics {
  totalEntriesToday: number
  currentlyInside: number
  attendedVisits: number
  pendingVisits: number
}

export interface HourlyData {
  hour: string
  visits: number
}

export interface SearchFilters {
  rif?: string
  contribuyente?: string
  registro?: string
  departamento?: string
  fecha_desde?: string
  fecha_hasta?: string
  skip?: number
  limit?: number
}

export interface Fiscal {
  id: number
  external_id: string
  name: string
  person_id: number
  email: string
  group_id: string
  supervisor_id: string
  status: boolean
}

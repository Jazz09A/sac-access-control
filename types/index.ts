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
  FINISHED = 'finalizado',
  CLOSED = 'cerrada',
  ACTIVE = 'activa',
  PENDING = 'pendiente',
  ATTENDED = 'atendido',
  REJECTED = 'rechazado',
  RESCHEDULED = 'reprogramado'
}

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

export interface Visit {
  id: string
  contributor_id: number
  fiscal_id: number
  reason: string
  observations?: string
  received_by: string
  department: string
  file_number?: string
  entry_date: string
  entry_time: string
  signature_image_url?: string
  fiscal_name?: string
  exit_date?: string
  exit_time?: string
  status: VisitStatus
  created_at: string
}

export interface VisitHistory {
  rif: string
  contribuyente: string
  registro?: string
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

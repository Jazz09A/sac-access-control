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
  ACTIVE = 'activa',
  CLOSED = 'cerrada',
  PENDING = 'pendiente'
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
  contributorId: string
  contributor: Contributor
  entryDateTime: Date
  exitDateTime?: Date
  reason: string
  observations?: string
  officer: string
  department: string
  fileNumber?: string
  photoUrl?: string
  signatureUrl?: string
  status: VisitStatus
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
  searchTerm?: string
  startDate?: Date
  endDate?: Date
  status?: VisitStatus
  page?: number
  limit?: number
}

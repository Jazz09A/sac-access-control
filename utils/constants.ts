import { ContributorType, VisitStatus } from '@/types'

/**
 * Application Constants
 */

export const CONTRIBUTOR_TYPE_OPTIONS = [
  { value: ContributorType.NATURAL, label: 'Persona Natural' },
  { value: ContributorType.LEGAL, label: 'Persona Jurídica' },
  { value: ContributorType.REPRESENTATIVE, label: 'Representante' },
  { value: ContributorType.MANAGER, label: 'Gestor' }
]

export const VISIT_STATUS_OPTIONS = [
  { value: VisitStatus.WAITING, label: 'En Espera' },
  { value: VisitStatus.FINISHED, label: 'Finalizado' },
  { value: VisitStatus.ACTIVE, label: 'Activa' },
  { value: VisitStatus.CLOSED, label: 'Cerrada' },
  { value: VisitStatus.PENDING, label: 'Pendiente' },
  { value: VisitStatus.ATTENDED, label: 'Atendida' },
  { value: VisitStatus.REJECTED, label: 'Rechazada' },
  { value: VisitStatus.RESCHEDULED, label: 'Reprogramada' }
]

export const STATUS_COLORS: Record<VisitStatus, string> = {
  [VisitStatus.WAITING]: 'bg-yellow-100 text-yellow-800',
  [VisitStatus.FINISHED]: 'bg-green-100 text-green-800',
  [VisitStatus.ACTIVE]: 'bg-blue-100 text-blue-800',
  [VisitStatus.CLOSED]: 'bg-gray-100 text-gray-800',
  [VisitStatus.PENDING]: 'bg-amber-100 text-amber-800',
  [VisitStatus.ATTENDED]: 'bg-emerald-100 text-emerald-800',
  [VisitStatus.REJECTED]: 'bg-red-100 text-red-800',
  [VisitStatus.RESCHEDULED]: 'bg-purple-100 text-purple-800'
}

export const DEPARTMENTS = [
  'Administración',
  'Finanzas',
  'Operaciones',
  'Recursos Humanos',
  'Legal',
  'Tecnología',
  'Ventas',
  'Otro'
]

export const VISIT_REASONS = [
  'Atención o consulta comercial',
  'Consultoría',
  'Servicio Técnico',
  'Entrega de Documentos',
  'Solicitud de Información',
  'Trámite Administrativo',
  'Otro'
]

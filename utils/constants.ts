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
  { value: VisitStatus.ACTIVE, label: 'Activa' },
  { value: VisitStatus.CLOSED, label: 'Cerrada' },
  { value: VisitStatus.PENDING, label: 'Pendiente' }
]

export const STATUS_COLORS: Record<VisitStatus, string> = {
  [VisitStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [VisitStatus.CLOSED]: 'bg-gray-100 text-gray-800',
  [VisitStatus.PENDING]: 'bg-yellow-100 text-yellow-800'
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

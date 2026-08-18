import { ContributorType, VisitStatus } from '@/types'

/**
 * Application Constants
 */

/** API backend si no hay `NEXT_PUBLIC_BACKEND_URL` / `BACKEND_URL` (dev local, típico FastAPI). */
export const DEFAULT_LOCAL_BACKEND_URL = 'http://localhost:8000'

export const RIF_PREFIX_OPTIONS = [
  { value: 'V', label: 'V - Venezolano' },
  { value: 'J', label: 'J - Jurídico' },
  { value: 'G', label: 'G - Gobierno' },
  { value: 'E', label: 'E - Extranjero' },
  // { value: 'P', label: 'P - Pasaporte' },
  // { value: 'C', label: 'C - Comunitario' }
]

export const CONTRIBUTOR_TYPE_OPTIONS = [
  { value: ContributorType.NATURAL, label: 'Persona Natural' },
  { value: ContributorType.LEGAL, label: 'Persona Jurídica' },
  { value: ContributorType.REPRESENTATIVE, label: 'Representante' },
  { value: ContributorType.MANAGER, label: 'Gestor' }
]

export const VISIT_STATUS_OPTIONS = [
  { value: VisitStatus.WAITING, label: 'En Espera' },
  { value: VisitStatus.IN_SERVICE, label: 'En atención' },
  { value: VisitStatus.ATTENDED, label: 'Atendida' },
  { value: VisitStatus.INCOMPLETE, label: 'Incompleto' },
  { value: VisitStatus.REFERRED, label: 'Remitido' },
  { value: VisitStatus.FINISHED, label: 'Finalizado' }
]

export const STATUS_COLORS: Record<VisitStatus, string> = {
  [VisitStatus.WAITING]: 'bg-yellow-100 text-yellow-800',
  [VisitStatus.IN_SERVICE]: 'bg-sky-100 text-sky-800',
  [VisitStatus.ATTENDED]: 'bg-emerald-100 text-emerald-800',
  [VisitStatus.INCOMPLETE]: 'bg-orange-100 text-orange-800',
  [VisitStatus.REFERRED]: 'bg-violet-100 text-violet-800',
  [VisitStatus.FINISHED]: 'bg-green-100 text-green-800'
}

export const DESK_DEPARTMENT_STORAGE_KEY = 'sac_desk_department'

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
  'VDF ',
  'Auditoría',
  'Recepcion de documentos',
  'Informacion',
  'Divulgacion',
  'Presencia Fiscal',
  'Boleta de comparecencia por correo',
  'Boleta de comparecencia fisica',
  'Destruccion de facturas',
  'Comunicado',
  'Consulta',
  'Otro',
]

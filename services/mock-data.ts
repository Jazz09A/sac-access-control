/**
 * Mock Data Service - For Development/Testing
 */

import { Contributor, Visit, VisitStatus, ContributorType, DashboardMetrics, HourlyData } from '@/types'

export const mockContributors: Contributor[] = [
  {
    id: '1',
    rif: 'V-12345678',
    name: 'Juan Carlos Pérez',
    type: ContributorType.NATURAL,
    occupation: 'Consultor de Negocios',
    phone: '(0212) 123-4567',
    email: 'juan@example.com',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    rif: 'J-98765432',
    name: 'Empresa Global Solutions',
    type: ContributorType.LEGAL,
    occupation: 'Servicios Técnicos',
    phone: '(0212) 987-6543',
    email: 'info@globalsolutions.com',
    createdAt: new Date('2024-02-10')
  },
  {
    id: '3',
    rif: 'V-55555555',
    name: 'María González López',
    type: ContributorType.REPRESENTATIVE,
    occupation: 'Abogada',
    phone: '(0414) 555-5555',
    email: 'maria@legal.com',
    createdAt: new Date('2024-01-20')
  }
]

// Mock visits aligned with API response format
export const mockVisits: Visit[] = [
  {
    id: '49a5f2a5-889f-4739-bf38-b295d2df07ef',
    contributor_id: 1,
    contributor_name: 'Juan Carlos Pérez',
    fiscal_id: 7,
    fiscal_name: 'Carlos Mendez',
    reason: 'Atención o consulta comercial',
    observations: 'Discusión sobre nuevo proyecto',
    received_by: 'Carlos Mendez',
    responsible_person: 'Maria Fernanda Ruiz',
    department: 'Administración',
    file_number: 'EXP-2024-001',
    entry_date: '2026-04-17',
    entry_time: '08:30:00',
    exit_date: '2026-04-17',
    exit_time: '10:15:00',
    signature_image_url: null,
    status: VisitStatus.FINISHED,
    created_at: '2026-04-17T08:30:00.000000'
  },
  {
    id: '58b6g3b6-990g-5840-cg49-c406e3eg18fg',
    contributor_id: 2,
    contributor_name: 'Empresa Global Solutions',
    fiscal_id: 8,
    fiscal_name: 'Roberto Flores',
    reason: 'Servicio Técnico',
    observations: 'Mantenimiento de sistemas',
    received_by: 'Roberto Flores',
    responsible_person: 'Ana María López',
    department: 'Tecnología',
    file_number: 'EXP-2024-002',
    entry_date: '2026-04-17',
    entry_time: '09:00:00',
    exit_date: null,
    exit_time: null,
    signature_image_url: null,
    status: VisitStatus.WAITING,
    created_at: '2026-04-17T09:00:00.000000'
  },
  {
    id: '69c7h4c7-001h-6951-dh50-d517f4fh29gh',
    contributor_id: 3,
    contributor_name: 'María González López',
    fiscal_id: 9,
    fiscal_name: 'Patricia Silva',
    reason: 'Consultoría Legal',
    observations: 'Revisión de contratos',
    received_by: 'Patricia Silva',
    responsible_person: 'Luis Eduardo Ramírez',
    department: 'Legal',
    file_number: 'EXP-2024-003',
    entry_date: '2026-04-17',
    entry_time: '11:30:00',
    exit_date: '2026-04-17',
    exit_time: '12:45:00',
    signature_image_url: null,
    status: VisitStatus.FINISHED,
    created_at: '2026-04-17T11:30:00.000000'
  },
  {
    id: '70d8i5d8-112i-7062-ei61-e628g5gi30hi',
    contributor_id: 1,
    contributor_name: 'Juan Carlos Pérez',
    fiscal_id: 7,
    fiscal_name: 'Carlos Mendez',
    reason: 'Entrega de Documentos',
    observations: '',
    received_by: 'Carlos Mendez',
    responsible_person: 'Pedro José Martínez',
    department: 'Finanzas',
    file_number: 'EXP-2024-004',
    entry_date: '2026-04-17',
    entry_time: '13:00:00',
    exit_date: null,
    exit_time: null,
    signature_image_url: null,
    status: VisitStatus.ATTENDED,
    created_at: '2026-04-17T13:00:00.000000'
  },
  {
    id: '81e9j6e9-223j-8173-fj72-f739h6hj41ij',
    contributor_id: 2,
    contributor_name: 'Empresa Global Solutions',
    fiscal_id: 8,
    fiscal_name: 'Roberto Flores',
    reason: 'Atención o consulta comercial',
    observations: 'Presentación de propuesta',
    received_by: 'Roberto Flores',
    responsible_person: 'Carmen Beatriz Silva',
    department: 'Ventas',
    file_number: 'EXP-2024-005',
    entry_date: '2026-04-17',
    entry_time: '14:30:00',
    exit_date: '2026-04-17',
    exit_time: '15:20:00',
    signature_image_url: null,
    status: VisitStatus.FINISHED,
    created_at: '2026-04-17T14:30:00.000000'
  }
]

export const mockDashboardMetrics: DashboardMetrics = {
  totalEntriesToday: 8,
  currentlyInside: 2,
  attendedVisits: 5,
  pendingVisits: 1
}

export const mockHourlyData: HourlyData[] = [
  { hour: '08:00', visits: 2 },
  { hour: '09:00', visits: 3 },
  { hour: '10:00', visits: 1 },
  { hour: '11:00', visits: 2 },
  { hour: '12:00', visits: 1 },
  { hour: '13:00', visits: 2 },
  { hour: '14:00', visits: 3 },
  { hour: '15:00', visits: 2 },
  { hour: '16:00', visits: 1 },
  { hour: '17:00', visits: 1 }
]

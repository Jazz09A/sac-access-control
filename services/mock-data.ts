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

export const mockVisits: Visit[] = [
  {
    id: 'V001',
    contributorId: '1',
    contributor: mockContributors[0],
    entryDateTime: new Date(new Date().setHours(8, 30, 0)),
    exitDateTime: new Date(new Date().setHours(10, 15, 0)),
    reason: 'Reunión de Negocios',
    observations: 'Discusión sobre nuevo proyecto',
    officer: 'Carlos Mendez',
    department: 'Administración',
    fileNumber: 'EXP-2024-001',
    photoUrl: '',
    status: VisitStatus.CLOSED
  },
  {
    id: 'V002',
    contributorId: '2',
    contributor: mockContributors[1],
    entryDateTime: new Date(new Date().setHours(9, 0, 0)),
    reason: 'Servicio Técnico',
    observations: 'Mantenimiento de sistemas',
    officer: 'Roberto Flores',
    department: 'Tecnología',
    photoUrl: '',
    status: VisitStatus.ACTIVE
  },
  {
    id: 'V003',
    contributorId: '3',
    contributor: mockContributors[2],
    entryDateTime: new Date(new Date().setHours(11, 30, 0)),
    exitDateTime: new Date(new Date().setHours(12, 45, 0)),
    reason: 'Consultoría Legal',
    observations: 'Revisión de contratos',
    officer: 'Patricia Silva',
    department: 'Legal',
    photoUrl: '',
    status: VisitStatus.CLOSED
  },
  {
    id: 'V004',
    contributorId: '1',
    contributor: mockContributors[0],
    entryDateTime: new Date(new Date().setHours(13, 0, 0)),
    reason: 'Entrega de Documentos',
    officer: 'Carlos Mendez',
    department: 'Finanzas',
    photoUrl: '',
    status: VisitStatus.ACTIVE
  },
  {
    id: 'V005',
    contributorId: '2',
    contributor: mockContributors[1],
    entryDateTime: new Date(new Date().setHours(14, 30, 0)),
    exitDateTime: new Date(new Date().setHours(15, 20, 0)),
    reason: 'Reunión de Negocios',
    observations: 'Presentación de propuesta',
    officer: 'Roberto Flores',
    department: 'Ventas',
    photoUrl: '',
    status: VisitStatus.CLOSED
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

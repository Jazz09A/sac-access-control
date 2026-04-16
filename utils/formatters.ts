import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Date and time formatting utilities
 */

export const getVenezuelaTime = (date: Date = new Date()): Date => {
  // Venezuela is UTC-4
  // We can use Intl.DateTimeFormat to get the time in Venezuela
  const vzDateStr = date.toLocaleString('en-US', { timeZone: 'America/Caracas' })
  return new Date(vzDateStr)
}

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy HH:mm', { locale: es })
}

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy', { locale: es })
}

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'HH:mm', { locale: es })
}

export const formatTimeAgo = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: es })
}

export const formatDuration = (startDate: Date | string, endDate: Date | string): string => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  
  const diffMs = end.getTime() - start.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 60) {
    return `${diffMins} min`
  }
  
  const hours = Math.floor(diffMins / 60)
  const minutes = diffMins % 60
  return `${hours}h ${minutes}m`
}

export const formatRIF = (rif: string): string => {
  // Format RIF as V-12345678 or J-12345678
  const cleaned = rif.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (cleaned.length === 0) return ''
  
  const prefix = cleaned[0]
  const numbers = cleaned.slice(1)
  
  if (numbers.length === 0) return prefix
  return `${prefix}-${numbers}`
}

export const formatPhone = (phone: string): string => {
  // Format phone as (0212) 123-4567
  const cleaned = phone.replace(/[^0-9]/g, '')
  if (cleaned.length < 10) return cleaned
  
  const area = cleaned.slice(0, 4)
  const prefix = cleaned.slice(4, 7)
  const line = cleaned.slice(7, 11)
  
  return `(${area}) ${prefix}-${line}`
}

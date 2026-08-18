import { format, formatDistanceToNow } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import type { AppLocale } from '@/lib/i18n-messages'

/**
 * Date and time formatting utilities
 */

export const getVenezuelaTime = (date: Date = new Date()): Date => {
  // Venezuela is UTC-4
  // We can use Intl.DateTimeFormat to get the time in Venezuela
  const vzDateStr = date.toLocaleString('en-US', { timeZone: 'America/Caracas' })
  return new Date(vzDateStr)
}

const VENEZUELA_TIMEZONE = 'America/Caracas'
const VENEZUELA_OFFSET = '-04:00'

export const getVenezuelaDateTimeInput = (
  date: Date = new Date()
): { date: string; time: string } => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: VENEZUELA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return {
    date: `${map.year}-${map.month}-${map.day}`,
    time: `${map.hour}:${map.minute}`,
  }
}

export const buildVenezuelaDateTime = (
  dateInput: string,
  timeInput: string
): Date => {
  return new Date(`${dateInput}T${timeInput}:00${VENEZUELA_OFFSET}`)
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

/** Relative time (“hace X minutos” / “X minutes ago”) según idioma de la consola. */
export function formatTimeAgoLocale(date: Date | string, locale: AppLocale): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, {
    addSuffix: true,
    locale: locale === 'en' ? enUS : es,
  })
}

/** Permanencia de garita: mm:ss si es < 1 h; si no, “Xh Ym”. */
export const formatStaySeconds = (seconds: number | null | undefined): string => {
  if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) {
    return '—'
  }

  const total = Math.max(0, Math.floor(Number(seconds)))
  if (total >= 3600) {
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const minutes = Math.floor(total / 60)
  const secs = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/** Format seconds as mm:ss (or h:mm:ss). Nullish values render as an em dash. */
export const formatClockSeconds = (seconds: number | null | undefined): string => {
  if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) {
    return '—'
  }

  const total = Math.max(0, Math.floor(Number(seconds)))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
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

/** Format duration from date and time strings (e.g., "2026-04-17" and "10:35:00") */
export const formatDurationFromStrings = (
  startDateStr: string,
  startTimeStr: string,
  endDateStr?: string,
  endTimeStr?: string
): string => {
  const start = new Date(`${startDateStr}T${startTimeStr}`)

  if (!endDateStr || !endTimeStr) {
    return '-'
  }

  const end = new Date(`${endDateStr}T${endTimeStr}`)
  return formatDuration(start, end)
}

/** Format relative time from date and time strings */
export function formatTimeAgoLocaleFromStrings(
  dateStr: string,
  timeStr: string,
  locale: AppLocale
): string {
  const dateTime = new Date(`${dateStr}T${timeStr}`)
  return formatTimeAgoLocale(dateTime, locale)
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

/**
 * Get current date in Venezuela timezone formatted as YYYY-MM-DD
 */
export const getVenezuelaDate = (): string => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: VENEZUELA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date())
}

/**
 * Get current time in Venezuela timezone formatted as HH:MM:SS
 */
export const getVenezuelaTimeString = (): string => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: VENEZUELA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date())
}

/**
 * Format a Date object as YYYY-MM-DD for API
 */
export const formatDateForAPI = (date: Date): string => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: VENEZUELA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

/**
 * Format a Date object as HH:MM:SS for API
 */
export const formatTimeForAPI = (date: Date): string => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: VENEZUELA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date)
}

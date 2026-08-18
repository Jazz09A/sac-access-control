'use client'

import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useLocale } from '@/components/providers/locale-provider'
import { attentionElapsedSeconds, usableRifValue, visitInitials, visitQueueLabel } from '@/lib/desk/queue'
import { formatClockSeconds } from '@/utils/formatters'
import { VISIT_REASONS } from '@/utils/constants'
import { Visit, VisitCloseStatus, VisitStatus } from '@/types'
import type { IntakeVisitRequest } from '@/services/visits'
import { Loader2 } from 'lucide-react'

const REASON_OPTIONS = [...new Set(VISIT_REASONS.map((reason) => reason.trim()).filter(Boolean))]

export interface DeskClosePayload extends IntakeVisitRequest {
  status: VisitCloseStatus
  observations?: string
}

interface AttentionPanelProps {
  visit: Visit | null
  nowMs: number
  fallbackStartedAt: number
  isSaving: boolean
  isClosing: boolean
  error?: string | null
  onSave: (values: IntakeVisitRequest) => void
  onClose: (values: DeskClosePayload) => void
}

function buildIntakeValues(name: string, rif: string, reason: string): IntakeVisitRequest | null {
  const cleanName = name.trim()
  const cleanReason = reason.trim()
  if (!cleanName || !cleanReason) return null
  const payload: IntakeVisitRequest = { name: cleanName, reason: cleanReason }
  const cleanRif = usableRifValue(rif)
  if (cleanRif) payload.rif = cleanRif
  return payload
}

export function AttentionPanel({
  visit,
  nowMs,
  fallbackStartedAt,
  isSaving,
  isClosing,
  error,
  onSave,
  onClose,
}: AttentionPanelProps) {
  const { t } = useLocale()
  const [name, setName] = useState('')
  const [rif, setRif] = useState('')
  const [reason, setReason] = useState('')
  const [closeStatus, setCloseStatus] = useState<VisitCloseStatus>(VisitStatus.ATTENDED)
  const [notes, setNotes] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const visitId = visit?.id
  const prefillName = visit?.contributor_name
  const prefillRif = visit?.contributor_rif
  const prefillReason = visit?.reason

  useEffect(() => {
    if (!visitId) return
    setName(prefillName?.trim() ?? '')
    setRif(usableRifValue(prefillRif))
    setReason(prefillReason?.trim() ?? '')
    setCloseStatus(VisitStatus.ATTENDED)
    setNotes('')
    setLocalError(null)
    // Reset the form only when the called visit changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- visitId is the reset key
  }, [visitId])

  const reasonOptions = useMemo(() => {
    const existing = visit?.reason?.trim()
    if (existing && !REASON_OPTIONS.includes(existing)) {
      return [existing, ...REASON_OPTIONS]
    }
    return REASON_OPTIONS
  }, [visit?.reason])

  if (!visit) {
    return (
      <div className="flex min-h-[220px] flex-col justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center">
        <p className="text-sm font-medium text-foreground">{t('desk.currentEmptyTitle')}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('desk.currentEmptyBody')}</p>
      </div>
    )
  }

  const elapsed = attentionElapsedSeconds(visit, nowMs, fallbackStartedAt)
  const cedula = visit.contributor_cedula?.trim() || visitQueueLabel(visit)
  const busy = isSaving || isClosing
  const formError = localError || error || null

  const requireIntake = (): IntakeVisitRequest | null => {
    const values = buildIntakeValues(name, rif, reason)
    if (!values) {
      setLocalError(t('desk.intakeRequired'))
      return null
    }
    setLocalError(null)
    return values
  }

  const handleSave = () => {
    const values = requireIntake()
    if (!values) return
    onSave(values)
  }

  const handleClose = () => {
    const values = requireIntake()
    if (!values) return
    const notesValue = notes.trim()
    onClose({
      ...values,
      status: closeStatus,
      ...(notesValue ? { observations: notesValue } : {}),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Avatar className="size-14 rounded-2xl">
          <AvatarImage src={visit.signature_image_url || undefined} alt="" />
          <AvatarFallback className="rounded-2xl bg-muted text-sm font-medium">
            {visitInitials(visit.contributor_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {t('desk.cedula')}
          </p>
          <p className="truncate text-lg font-medium text-foreground">{cedula}</p>
          {visit.ticket_no?.trim() ? (
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {t('desk.ticket')} {visit.ticket_no.trim()}
            </p>
          ) : null}
          <Badge variant="outline" className="mt-2 border-sky-400/20 bg-sky-400/10 text-[10px] uppercase tracking-[0.14em] text-sky-200">
            {t(`dashboard.status.${VisitStatus.IN_SERVICE}`)}
          </Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-center">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {t('desk.chronometer')}
        </p>
        <p className="mt-2 font-mono text-4xl font-semibold tracking-[-0.04em] tabular-nums text-foreground" aria-live="polite">
          {formatClockSeconds(elapsed)}
        </p>
      </div>

      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          handleClose()
        }}
      >
        <p className="text-xs text-muted-foreground">{t('desk.intakeHint')}</p>

        <div className="space-y-1.5">
          <Label htmlFor="desk-intake-name" className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {t('desk.name')}
          </Label>
          <Input
            id="desk-intake-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              if (localError) setLocalError(null)
            }}
            autoComplete="name"
            aria-invalid={Boolean(localError) && !name.trim()}
            aria-describedby={formError ? 'desk-intake-error' : undefined}
            disabled={busy}
            maxLength={255}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="desk-intake-rif" className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {t('desk.rif')} ({t('desk.rifOptional')})
          </Label>
          <Input
            id="desk-intake-rif"
            value={rif}
            onChange={(event) => setRif(event.target.value)}
            placeholder={t('desk.rifPlaceholder')}
            autoComplete="off"
            disabled={busy}
            maxLength={20}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="desk-intake-reason" className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {t('desk.reason')}
          </Label>
          <Select
            value={reason || undefined}
            onValueChange={(value) => {
              setReason(value)
              if (localError) setLocalError(null)
            }}
            disabled={busy}
          >
            <SelectTrigger
              id="desk-intake-reason"
              className="h-10 w-full rounded-xl"
              aria-invalid={Boolean(localError) && !reason.trim()}
            >
              <SelectValue placeholder={t('desk.reasonPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {reasonOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={closeStatus}
          onValueChange={(value) => {
            if (value === VisitStatus.ATTENDED || value === VisitStatus.INCOMPLETE || value === VisitStatus.REFERRED) {
              setCloseStatus(value)
            }
          }}
          className="grid w-full grid-cols-3"
          aria-label={t('desk.close')}
        >
          <ToggleGroupItem value={VisitStatus.ATTENDED} className="text-xs" disabled={busy}>
            {t('desk.closeAttended')}
          </ToggleGroupItem>
          <ToggleGroupItem value={VisitStatus.INCOMPLETE} className="text-xs" disabled={busy}>
            {t('desk.closeIncomplete')}
          </ToggleGroupItem>
          <ToggleGroupItem value={VisitStatus.REFERRED} className="text-xs" disabled={busy}>
            {t('desk.closeReferred')}
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="space-y-1.5">
          <Label htmlFor="desk-close-notes" className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {t('desk.notes')}
          </Label>
          <Input
            id="desk-close-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={t('desk.notesPlaceholder')}
            maxLength={1000}
            disabled={busy}
          />
        </div>

        {formError ? (
          <p id="desk-intake-error" className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
          <Button type="button" variant="outline" onClick={handleSave} disabled={busy}>
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
            {t('desk.save')}
          </Button>
          <Button type="submit" disabled={busy}>
            {isClosing ? <Loader2 className="size-4 animate-spin" /> : null}
            {t('desk.close')}
          </Button>
        </div>
      </form>
    </div>
  )
}

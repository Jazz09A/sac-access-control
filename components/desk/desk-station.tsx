'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Ticket, ShieldCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLocale } from '@/components/providers/locale-provider'
import { QueueList } from '@/components/desk/queue-list'
import { AttentionPanel, type DeskClosePayload } from '@/components/desk/attention-panel'
import { useVisitLiveRefresh } from '@/hooks/use-visit-live'
import { inServiceVisit, nextWaitingVisit, sortQueueFifo } from '@/lib/desk/queue'
import { callVisit, closeVisit, getVisitQueue, intakeVisit, type IntakeVisitRequest } from '@/services/visits'
import { DEPARTMENTS, DESK_DEPARTMENT_STORAGE_KEY } from '@/utils/constants'
import { Visit } from '@/types'

export function DeskStation() {
  const { t } = useLocale()
  const [department, setDepartment] = useState(DEPARTMENTS[0] ?? '')
  const [departmentReady, setDepartmentReady] = useState(false)
  const [queue, setQueue] = useState<Visit[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [isCalling, setIsCalling] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [attentionStartedAt, setAttentionStartedAt] = useState(() => Date.now())
  const hasLoadedRef = useRef(false)
  const requestIdRef = useRef(0)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DESK_DEPARTMENT_STORAGE_KEY)
      if (stored && DEPARTMENTS.includes(stored)) {
        setDepartment(stored)
      }
    } catch {
      // localStorage may be blocked; keep default department
    } finally {
      setDepartmentReady(true)
    }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const persistDepartment = (value: string) => {
    setDepartment(value)
    hasLoadedRef.current = false
    setLoadState('loading')
    setQueue([])
    try {
      window.localStorage.setItem(DESK_DEPARTMENT_STORAGE_KEY, value)
    } catch {
      // ignore quota / privacy errors
    }
  }

  const fetchQueue = useCallback(async () => {
    if (!department || !departmentReady) return
    const requestId = ++requestIdRef.current
    const silent = hasLoadedRef.current
    if (!silent) setLoadState('loading')

    try {
      const data = await getVisitQueue(department)
      if (requestId !== requestIdRef.current) return
      setQueue(sortQueueFifo(data))
      setErrorMessage(null)
      setLoadState('ready')
      hasLoadedRef.current = true
    } catch (error) {
      if (requestId !== requestIdRef.current) return
      const message = error instanceof Error ? error.message : t('desk.errorTitle')
      if (!hasLoadedRef.current) {
        setErrorMessage(message)
        setLoadState('error')
      } else {
        toast.error(message)
      }
    }
  }, [department, departmentReady, t])

  useEffect(() => {
    if (!departmentReady) return
    void fetchQueue()
  }, [departmentReady, fetchQueue])

  useVisitLiveRefresh(fetchQueue, departmentReady)

  const current = useMemo(() => inServiceVisit(queue) ?? null, [queue])
  const nextWaiting = useMemo(() => nextWaitingVisit(queue), [queue])

  useEffect(() => {
    if (!current?.id || current.called_at) return
    setAttentionStartedAt(Date.now())
  }, [current?.id, current?.called_at])

  useEffect(() => {
    setActionError(null)
  }, [current?.id])

  const callDisabledReason = current
    ? t('desk.callDisabledBusy')
    : !nextWaiting
      ? t('desk.callDisabledEmpty')
      : undefined

  const handleCall = async () => {
    if (!nextWaiting || current) return
    setIsCalling(true)
    setActionError(null)
    try {
      await callVisit(nextWaiting.id)
      toast.success(t('desk.called'))
      await fetchQueue()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('desk.callError'))
    } finally {
      setIsCalling(false)
    }
  }

  const handleSave = async (values: IntakeVisitRequest) => {
    if (!current) return
    setIsSaving(true)
    setActionError(null)
    try {
      await intakeVisit(current.id, values)
      toast.success(t('desk.saved'))
      await fetchQueue()
    } catch (error) {
      const message = error instanceof Error ? error.message : t('desk.intakeError')
      setActionError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = async (values: DeskClosePayload) => {
    if (!current) return
    setIsClosing(true)
    setActionError(null)
    try {
      await intakeVisit(current.id, {
        name: values.name,
        reason: values.reason,
        rif: values.rif,
      })
      await closeVisit(current.id, {
        status: values.status,
        observations: values.observations,
      })
      toast.success(t('desk.closed'))
      await fetchQueue()
    } catch (error) {
      const message = error instanceof Error ? error.message : t('desk.closeError')
      setActionError(message)
      toast.error(message)
    } finally {
      setIsClosing(false)
    }
  }

  const isLoading = loadState === 'loading'

  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 p-4 sm:p-5 lg:gap-6 lg:p-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
            <ShieldCheck className="size-3.5" />
            {t('desk.badge')}
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
              {t('desk.heading')}
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              {t('desk.intro')}
            </p>
          </div>
        </div>

        <Card className="bg-white/[0.03] py-4">
          <CardHeader className="pb-0">
            <Label htmlFor="desk-department" className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {t('desk.department')}
            </Label>
            <CardTitle className="text-lg font-medium">{department}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            <Select value={department} onValueChange={persistDepartment}>
              <SelectTrigger id="desk-department" className="h-11 w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t('desk.departmentHint')}</p>
          </CardContent>
        </Card>
      </div>

      {loadState === 'error' ? (
        <Card className="border-red-400/20 bg-red-500/10 py-6">
          <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{t('desk.errorTitle')}</p>
              <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
            </div>
            <Button variant="outline" onClick={() => void fetchQueue()}>
              {t('desk.errorRetry')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
          <Card className="bg-white/[0.03] py-4">
            <CardHeader className="pb-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {t('desk.queueLabel')}
                  </p>
                  <CardTitle className="mt-2 text-lg font-medium">{t('desk.queueTitle')}</CardTitle>
                </div>
                <Button
                  onClick={() => void handleCall()}
                  disabled={Boolean(callDisabledReason) || isCalling || isLoading}
                  title={callDisabledReason}
                >
                  {isCalling ? <Loader2 className="size-4 animate-spin" /> : <Ticket className="size-4" />}
                  {t('desk.call')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <QueueList
                department={department}
                queue={queue}
                nowMs={nowMs}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03] py-4">
            <CardHeader className="pb-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {t('desk.currentLabel')}
              </p>
              <CardTitle className="text-lg font-medium">{t('desk.currentTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="space-y-3" aria-busy="true">
                  <p className="text-sm text-muted-foreground">{t('desk.loadingBody')}</p>
                  <div className="h-24 animate-pulse rounded-2xl bg-muted/40" />
                  <div className="h-20 animate-pulse rounded-2xl bg-muted/40" />
                </div>
              ) : (
                <AttentionPanel
                  visit={current}
                  nowMs={nowMs}
                  fallbackStartedAt={attentionStartedAt}
                  isSaving={isSaving}
                  isClosing={isClosing}
                  error={actionError}
                  onSave={(values) => void handleSave(values)}
                  onClose={(values) => void handleClose(values)}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

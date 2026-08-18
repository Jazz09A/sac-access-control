'use client'

import Link from 'next/link'
import { useCallback, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DestinationForm } from '@/components/gate/destination-form'
import { DocumentForm } from '@/components/gate/document-form'
import { ExitPanel } from '@/components/gate/exit-panel'
import { GateCamera, type GateCameraHandle } from '@/components/gate/gate-camera'
import { IdentityPanel } from '@/components/gate/identity-panel'
import { GateModeToggle } from '@/components/gate/mode-toggle'
import { TicketPanel } from '@/components/gate/ticket-panel'
import { useLocale } from '@/components/providers/locale-provider'
import { ApiError } from '@/lib/api/client'
import type { FaceCapture, GateIdentity, GateMode, MeshQuality } from '@/lib/gate/types'
import { createGateVisit, exitGateVisit, listOpenVisits } from '@/lib/gate/visits'
import { DOCUMENT_RESULTS, RETRY_SCAN_RESULTS, enrollFace, recognizeFace } from '@/services/biometrics'
import { Visit } from '@/types'
import { formatStaySeconds } from '@/utils/formatters'

type GateStep =
  | 'scan'
  | 'verifying'
  | 'document'
  | 'destination'
  | 'creating'
  | 'ticket'
  | 'exit-list'
  | 'exiting'
  | 'exit-done'
  | 'exit-already-closed'
  | 'error'

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.detail || error.message || fallback
  if (error instanceof Error) return error.message || fallback
  return fallback
}

function isAlreadyFinalized(error: unknown) {
  if (!(error instanceof ApiError) || error.status !== 400) return false
  const detail = `${error.detail || ''} ${error.message || ''}`.toLowerCase()
  return detail.includes('finalizada') || detail.includes('finalizado')
}

function identityFromRecognize(result: {
  contributor_id?: number | null
  rif?: string | null
  cedula?: string | null
}): GateIdentity {
  return {
    contributorId: result.contributor_id,
    cedula: result.cedula?.trim() || '',
    rif: result.rif || null,
  }
}

export function GateKiosk() {
  const { t } = useLocale()
  const [mode, setMode] = useState<GateMode>('entry')
  const [cameraKey, setCameraKey] = useState(0)
  const [paused, setPaused] = useState(false)
  const [step, setStep] = useState<GateStep>('scan')
  const [overlay, setOverlay] = useState<{ message?: string; level?: MeshQuality['level'] | 'verifying' }>({})
  const [capture, setCapture] = useState<FaceCapture | null>(null)
  const [identity, setIdentity] = useState<GateIdentity | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ticketNo, setTicketNo] = useState<string | null>(null)
  const [department, setDepartment] = useState<string>('')
  const [visits, setVisits] = useState<Visit[]>([])
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null)
  const [closedVisit, setClosedVisit] = useState<Visit | null>(null)
  const [cameraFailed, setCameraFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const cameraRef = useRef<GateCameraHandle>(null)

  const ensureCapture = useCallback(async () => {
    if (capture && capture.photoFile) return capture
    const snapshot = await cameraRef.current?.captureNow()
    if (snapshot) {
      setCapture(snapshot)
      return snapshot
    }
    return null
  }, [capture])

  const resetSession = useCallback((nextMode: GateMode = mode) => {
    setMode(nextMode)
    setPaused(false)
    setStep('scan')
    setOverlay({})
    setCapture(null)
    setIdentity(null)
    setError(null)
    setTicketNo(null)
    setDepartment('')
    setVisits([])
    setSelectedVisitId(null)
    setClosedVisit(null)
    setCameraFailed(false)
    setBusy(false)
    setCameraKey((value) => value + 1)
  }, [mode])

  const performExit = useCallback(async (visitToCloseId: string, fromList: boolean) => {
    setBusy(true)
    setSelectedVisitId(visitToCloseId)
    setStep('exiting')
    setError(null)
    setOverlay({ message: t('gate.overlay.exiting'), level: 'verifying' })
    try {
      const closed = await exitGateVisit(visitToCloseId)
      setClosedVisit(closed)
      setTicketNo(closed.ticket_no || closed.id)
      setStep('exit-done')
      setOverlay({ message: t('gate.overlay.exitDone'), level: 'ok' })
    } catch (err) {
      if (isAlreadyFinalized(err)) {
        setError(t('gate.exit.alreadyClosedBody'))
        setStep('exit-already-closed')
        setOverlay({ message: t('gate.exit.alreadyClosedTitle'), level: 'warn' })
        return
      }
      setError(errorMessage(err, t('gate.error.exit')))
      if (fromList) {
        setStep('exit-list')
        setOverlay({})
      } else {
        setStep('error')
        setOverlay({ message: t('gate.error.exit'), level: 'error' })
      }
    } finally {
      setBusy(false)
    }
  }, [t])

  const resolveExit = useCallback(async (nextIdentity: GateIdentity) => {
    setIdentity(nextIdentity)
    setVisits([])
    setSelectedVisitId(null)
    setClosedVisit(null)
    setError(null)
    setBusy(true)
    setStep('exit-list')
    try {
      const openVisits = await listOpenVisits({
        cedula: nextIdentity.cedula,
        contributorId: nextIdentity.contributorId,
      })
      setVisits(openVisits)
      if (openVisits.length === 1) {
        await performExit(openVisits[0].id, false)
        return
      }
      setSelectedVisitId(null)
      setOverlay({})
    } catch (err) {
      setError(errorMessage(err, t('gate.error.visits')))
    } finally {
      setBusy(false)
    }
  }, [performExit, t])

  const handleStableCapture = useCallback(async (nextCapture: FaceCapture) => {
    setCapture(nextCapture)
    setPaused(true)
    setBusy(true)
    setStep('verifying')
    setOverlay({ message: t('gate.overlay.verifying'), level: 'verifying' })
    try {
      const result = await recognizeFace({
        image: nextCapture.imageDataUrl,
        landmarks: nextCapture.landmarks,
      })
      if (result.result === 'recognized' && (result.cedula || result.contributor_id)) {
        const nextIdentity = identityFromRecognize(result)
        if (!nextIdentity.cedula) {
          setIdentity(nextIdentity)
          setStep('document')
          setOverlay({ message: t('gate.overlay.needDocument'), level: 'warn' })
          return
        }
        if (mode === 'exit') {
          await resolveExit(nextIdentity)
          return
        }
        setIdentity(nextIdentity)
        setStep('destination')
        setOverlay({ message: t('gate.overlay.identified'), level: 'ok' })
        return
      }
      if (RETRY_SCAN_RESULTS.has(result.result)) {
        setPaused(false)
        setStep('scan')
        setOverlay({})
        return
      }
      if (DOCUMENT_RESULTS.has(result.result) || result.fallback === 'cedula_rif') {
        setIdentity({
          cedula: result.cedula?.trim() || '',
          rif: result.rif || null,
          contributorId: result.contributor_id,
        })
        setStep('document')
        setOverlay({ message: result.message || t('gate.overlay.needDocument'), level: 'warn' })
        return
      }
      setIdentity({ cedula: result.cedula?.trim() || '', rif: result.rif || null })
      setStep('document')
      setOverlay({ message: result.message || t('gate.overlay.needDocument'), level: 'warn' })
    } catch (err) {
      setError(errorMessage(err, t('gate.error.recognize')))
      setStep('error')
      setOverlay({ message: t('gate.error.recognize'), level: 'error' })
    } finally {
      setBusy(false)
    }
  }, [mode, resolveExit, t])

  const handleDocumentSubmit = useCallback(async (values: { cedula: string }) => {
    setBusy(true)
    setError(null)
    try {
      let nextIdentity: GateIdentity = {
        cedula: values.cedula,
        contributorId: identity?.contributorId,
        rif: identity?.rif,
      }

      if (mode === 'entry') {
        const photo = await ensureCapture()
        if (!photo || photo.landmarks.length < 400) {
          setError(t('gate.error.noPhoto'))
          return
        }
        if (!nextIdentity.contributorId) {
          const enrolled = await enrollFace({
            image: photo.imageDataUrl,
            landmarks: photo.landmarks,
            cedula: values.cedula,
          })
          nextIdentity = {
            contributorId: enrolled.contributor_id,
            cedula: enrolled.cedula || values.cedula,
          }
        }
        setIdentity(nextIdentity)
        setStep('destination')
        return
      }

      await resolveExit(nextIdentity)
    } catch (err) {
      setError(errorMessage(err, t('gate.error.document')))
    } finally {
      setBusy(false)
    }
  }, [ensureCapture, identity, mode, resolveExit, t])

  const handleDestinationSubmit = useCallback(async (values: { department: string }) => {
    const photo = capture ?? await ensureCapture()
    if (!identity?.cedula || !photo) {
      setError(t('gate.error.noPhoto'))
      setStep(identity?.cedula ? 'error' : 'document')
      return
    }
    setBusy(true)
    setStep('creating')
    setError(null)
    try {
      const visit = await createGateVisit({
        contributor_cedula: identity.cedula,
        department: values.department,
        photo: photo.photoFile,
      })
      setDepartment(values.department)
      setTicketNo(visit.ticket_no || visit.id)
      setStep('ticket')
      setOverlay({ message: t('gate.overlay.ticket'), level: 'ok' })
    } catch (err) {
      setError(errorMessage(err, t('gate.error.createVisit')))
      setStep('destination')
    } finally {
      setBusy(false)
    }
  }, [capture, ensureCapture, identity, t])

  const handleConfirmExit = useCallback(() => {
    if (!selectedVisitId) return
    void performExit(selectedVisitId, true)
  }, [performExit, selectedVisitId])

  const busySteps = step === 'verifying' || step === 'creating' || step === 'exiting'
  const showDocument = step === 'document'
  const showIdentity = Boolean(identity?.cedula) && step === 'exit-list'
  const showDestination = (step === 'destination' || step === 'creating') && mode === 'entry'
  const showTicket = step === 'ticket' && ticketNo && identity?.cedula
  const showExitList = mode === 'exit' && step === 'exit-list'
  const showExitDone = step === 'exit-done'
  const exitCedula = closedVisit?.contributor_cedula || identity?.cedula || ''
  const exitTicket = closedVisit?.ticket_no || ticketNo

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-4 py-4 sm:px-8">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {t('gate.brand')}
          </p>
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">{t('gate.title')}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <GateModeToggle mode={mode} disabled={busySteps} onChange={(next) => resetSession(next)} />
          <Button asChild variant="ghost" className="text-muted-foreground">
            <Link href="/">{t('gate.backToConsole')}</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-1 gap-6 p-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:p-8">
        <div key={cameraKey}>
          <GateCamera
            ref={cameraRef}
            paused={paused || busySteps}
            overlayMessage={overlay.message}
            overlayLevel={overlay.level}
            onStableCapture={handleStableCapture}
            onStatusChange={(status) => {
              if (status === 'denied' || status === 'mesh-error') {
                setCameraFailed(true)
              }
            }}
          />
        </div>

        <section className="space-y-4" aria-live="polite">
          {step === 'scan' && !cameraFailed && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{t('gate.scan.title')}</CardTitle>
                <CardDescription className="text-base">{t('gate.scan.body')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button type="button" variant="outline" className="h-12 w-full text-base" onClick={() => {
                  setPaused(true)
                  setStep('document')
                }}>
                  {t('gate.scan.useDocument')}
                </Button>
              </CardContent>
            </Card>
          )}

          {cameraFailed && step === 'scan' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{t('gate.camera.failedTitle')}</CardTitle>
                <CardDescription className="text-base">{t('gate.camera.failedBody')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button type="button" size="lg" className="h-14 w-full text-lg" onClick={() => {
                  setPaused(true)
                  setStep('document')
                }}>
                  {t('gate.scan.useDocument')}
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'verifying' && (
            <Card>
              <CardContent className="flex items-center gap-3 py-8 text-xl">
                <Loader2 className="size-6 animate-spin" aria-hidden />
                {t('gate.overlay.verifying')}
              </CardContent>
            </Card>
          )}

          {step === 'exiting' && (
            <Card>
              <CardContent className="flex items-center gap-3 py-8 text-xl">
                <Loader2 className="size-6 animate-spin" aria-hidden />
                {t('gate.overlay.exiting')}
              </CardContent>
            </Card>
          )}

          {step === 'error' && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-2xl text-destructive">{t('gate.error.title')}</CardTitle>
                <CardDescription className="text-base text-foreground">{error}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button type="button" size="lg" className="h-14 text-lg" onClick={() => resetSession(mode)}>
                  {t('error.tryAgain')}
                </Button>
                <Button type="button" size="lg" variant="outline" className="h-14 text-lg" onClick={() => {
                  setPaused(true)
                  setStep('document')
                  setError(null)
                }}>
                  {t('gate.scan.useDocument')}
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'exit-already-closed' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{t('gate.exit.alreadyClosedTitle')}</CardTitle>
                <CardDescription className="text-base" role="status">
                  {error || t('gate.exit.alreadyClosedBody')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button type="button" size="lg" className="h-14 w-full text-lg" onClick={() => resetSession('exit')}>
                  {t('gate.ticket.next')}
                </Button>
              </CardContent>
            </Card>
          )}

          {showIdentity && identity ? <IdentityPanel identity={identity} /> : null}

          {showDocument && (
            <DocumentForm
              initial={identity ?? undefined}
              loading={busy}
              error={error}
              onSubmit={(values) => void handleDocumentSubmit(values)}
            />
          )}

          {showDestination && identity ? (
            <DestinationForm
              identity={identity}
              loading={busy || step === 'creating'}
              error={error}
              onSubmit={(values) => void handleDestinationSubmit(values)}
            />
          ) : null}

          {showTicket && ticketNo && identity ? (
            <TicketPanel
              ticketNo={ticketNo}
              cedula={identity.cedula}
              department={department}
              onNext={() => resetSession('entry')}
            />
          ) : null}

          {showExitList && (
            <ExitPanel
              visits={visits}
              selectedId={selectedVisitId}
              loading={busy}
              error={error}
              onSelect={setSelectedVisitId}
              onConfirm={handleConfirmExit}
              onSwitchToEntry={() => resetSession('entry')}
              onAskDocument={() => {
                setPaused(true)
                setStep('document')
              }}
            />
          )}

          {showExitDone && exitTicket ? (
            <TicketPanel
              ticketNo={exitTicket}
              cedula={exitCedula || '—'}
              stayLabel={formatStaySeconds(closedVisit?.stay_seconds)}
              onNext={() => resetSession('exit')}
            />
          ) : null}
        </section>
      </main>
    </div>
  )
}

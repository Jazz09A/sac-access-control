'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Loader2, Package } from 'lucide-react'
import { toast } from 'sonner'
import { AssetStatusBadge } from '@/components/assets/status-badge'
import { useLocale } from '@/components/providers/locale-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ApiError } from '@/lib/api/client'
import { getSessionUser, type SessionUser } from '@/lib/api/me'
import {
  assignAsset,
  assetPhotoUrl,
  getAsset,
  listSystemUsers,
  recordAssetMovement,
  releaseAsset,
  uploadAssetPhoto,
  type SeniatAsset,
  type SystemUser,
} from '@/services/assets'

type LoadState = 'loading' | 'ready' | 'error' | 'notfound'

export default function AssetDetailPage() {
  const { t } = useLocale()
  const params = useParams<{ assetId: string }>()
  const assetId = Array.isArray(params.assetId) ? params.assetId[0] : params.assetId
  const [asset, setAsset] = useState<SeniatAsset | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [me, setMe] = useState<SessionUser | null>(null)
  const [users, setUsers] = useState<SystemUser[] | 'forbidden' | null>(null)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [workstation, setWorkstation] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState<'assign' | 'release' | 'out' | 'in' | 'photo' | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const loadAsset = useCallback(async () => {
    if (!assetId) {
      setLoadState('notfound')
      return
    }
    setLoadState('loading')
    setErrorMessage(null)
    try {
      const data = await getAsset(assetId)
      setAsset(data)
      setWorkstation(data.workstation || '')
      setLoadState('ready')
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setAsset(null)
        setLoadState('notfound')
        return
      }
      setErrorMessage(error instanceof Error ? error.message : t('error.loading'))
      setLoadState('error')
    }
  }, [assetId, t])

  useEffect(() => {
    void loadAsset()
  }, [loadAsset])

  useEffect(() => {
    let cancel = false
    void (async () => {
      const session = await getSessionUser()
      if (cancel) return
      setMe(session)
      try {
        const result = await listSystemUsers()
        if (!cancel) {
          setUsers(result)
          if (result !== 'forbidden' && result[0]) {
            setSelectedUserId(result[0].id)
          }
        }
      } catch {
        if (!cancel) setUsers('forbidden')
      }
    })()
    return () => {
      cancel = true
    }
  }, [])

  const runAction = async (key: typeof busy, action: () => Promise<SeniatAsset | void>) => {
    setBusy(key)
    try {
      const updated = await action()
      if (updated) {
        setAsset(updated)
        setWorkstation(updated.workstation || '')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('error.loading'))
    } finally {
      setBusy(null)
    }
  }

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return
    const localUrl = URL.createObjectURL(file)
    setPhotoPreview(localUrl)
    await runAction('photo', () => uploadAssetPhoto(assetId, file))
  }

  if (loadState === 'loading') {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6" aria-busy="true">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-8">
        <p className="text-sm font-medium">{t('error.loading')}</p>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
        <Button variant="outline" onClick={() => void loadAsset()}>
          {t('assets.retry')}
        </Button>
      </div>
    )
  }

  if (loadState === 'notfound' || !asset) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-8 text-center">
        <h1 className="text-2xl font-semibold">{t('assets.detail.notFound')}</h1>
        <p className="text-sm text-muted-foreground">{t('assets.detail.notFoundBody')}</p>
        <Button asChild variant="outline">
          <Link href="/assets">{t('assets.detail.back')}</Link>
        </Button>
      </div>
    )
  }

  const photoSrc = photoPreview || assetPhotoUrl(asset.photo_object_key)
  const canSelectUser = Array.isArray(users) && users.length > 0
  const assignUserId = canSelectUser ? selectedUserId : me?.id
  const primaryAssignLabel = canSelectUser ? t('assets.detail.assign') : t('assets.detail.assignMe')

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:p-6">
      <Link href="/assets">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('assets.detail.back')}
        </Button>
      </Link>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
          <Package className="size-3.5" />
          {asset.inventory_code}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-[-0.04em]">
            {[asset.brand, asset.model].filter(Boolean).join(' ') || asset.category}
          </h1>
          <AssetStatusBadge status={asset.status} />
        </div>
        {asset.description ? (
          <p className="text-sm text-muted-foreground">{asset.description}</p>
        ) : null}
      </div>

      <Card className="bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-lg font-medium">{t('assets.detail.photo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {photoSrc ? (
            <img
              src={photoSrc}
              alt={asset.inventory_code}
              className="max-h-64 w-full rounded-2xl border border-border/60 bg-muted/20 object-contain"
            />
          ) : (
            <p className="text-sm text-muted-foreground">{t('assets.detail.photoEmpty')}</p>
          )}
          <div>
            <Label htmlFor="asset-photo" className="sr-only">
              {t('assets.detail.uploadPhoto')}
            </Label>
            <Input
              id="asset-photo"
              type="file"
              accept="image/*"
              disabled={busy === 'photo'}
              onChange={(event) => void handlePhoto(event.target.files?.[0])}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-lg font-medium">{t('assets.detail.assign')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">{t('assets.col.serial')}</dt>
              <dd>{asset.serial || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('assets.col.category')}</dt>
              <dd>{asset.category}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('assets.detail.assignedTo')}</dt>
              <dd>{asset.assigned_user_id || '—'}</dd>
            </div>
          </dl>

          {canSelectUser && Array.isArray(users) ? (
            <div className="space-y-1.5">
              <Label htmlFor="asset-officer">{t('assets.detail.officer')}</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="asset-officer" className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} · {user.person_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('assets.detail.assignMe')}</p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="asset-workstation">{t('assets.field.workstation')}</Label>
            <Input
              id="asset-workstation"
              className="h-11 rounded-xl"
              value={workstation}
              onChange={(event) => setWorkstation(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!assignUserId || busy === 'assign'}
              onClick={() => {
                if (!assignUserId) return
                void runAction('assign', () =>
                  assignAsset(assetId, {
                    user_id: assignUserId,
                    workstation: workstation.trim() || undefined,
                  }),
                )
              }}
            >
              {busy === 'assign' ? <Loader2 className="size-4 animate-spin" /> : null}
              {primaryAssignLabel}
            </Button>
            <Button
              variant="outline"
              disabled={asset.status !== 'assigned' || busy === 'release'}
              onClick={() => void runAction('release', () => releaseAsset(assetId))}
            >
              {busy === 'release' ? <Loader2 className="size-4 animate-spin" /> : null}
              {t('assets.detail.release')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-lg font-medium">{t('assets.detail.movement')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="asset-notes">{t('assets.detail.notes')}</Label>
            <Input
              id="asset-notes"
              className="h-11 rounded-xl"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(asset.status === 'in_transit_out' ? (['in', 'out'] as const) : (['out', 'in'] as const)).map(
              (direction) => {
                const isPrimary =
                  asset.status === 'in_transit_out' ? direction === 'in' : direction === 'out'
                return (
                  <Button
                    key={direction}
                    variant={isPrimary ? 'default' : 'outline'}
                    disabled={!me?.id || busy === direction}
                    onClick={() => {
                      if (!me?.id) return
                      void runAction(direction, async () => {
                        await recordAssetMovement(assetId, {
                          direction,
                          carrier_user_id: me.id as string,
                          notes: notes.trim() || null,
                        })
                        return getAsset(assetId)
                      })
                    }}
                  >
                    {busy === direction ? <Loader2 className="size-4 animate-spin" /> : null}
                    {t(direction === 'out' ? 'assets.detail.out' : 'assets.detail.in')}
                  </Button>
                )
              },
            )}
          </div>
          {!me?.id ? (
            <p className="text-sm text-muted-foreground">{t('assets.gate.noOfficer')}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

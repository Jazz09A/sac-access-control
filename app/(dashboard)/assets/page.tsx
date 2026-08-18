'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Download, Loader2, Package, Plus, Search } from 'lucide-react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ApiError } from '@/lib/api/client'
import { getSessionUser } from '@/lib/api/me'
import {
  exportAssetsCsv,
  listAssets,
  type AssetStatus,
  type SeniatAsset,
} from '@/services/assets'

const STATUS_OPTIONS: Array<AssetStatus | 'all'> = [
  'all',
  'in_sede',
  'assigned',
  'in_transit_out',
]

export default function AssetsPage() {
  const { t } = useLocale()
  const [isAdmin, setIsAdmin] = useState(false)
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [status, setStatus] = useState<AssetStatus | 'all'>('all')
  const [assets, setAssets] = useState<SeniatAsset[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    let cancel = false
    void getSessionUser().then((user) => {
      if (!cancel) setIsAdmin(user?.role === 'admin')
    })
    return () => {
      cancel = true
    }
  }, [])

  const fetchAssets = useCallback(async () => {
    setLoadState('loading')
    setErrorMessage(null)
    try {
      const data = await listAssets({
        q: appliedQuery,
        status: status === 'all' ? '' : status,
      })
      setAssets(data)
      setLoadState('ready')
    } catch (error) {
      setAssets([])
      setErrorMessage(error instanceof Error ? error.message : t('assets.errorTitle'))
      setLoadState('error')
    }
  }, [appliedQuery, status, t])

  useEffect(() => {
    void fetchAssets()
  }, [fetchAssets])

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportAssetsCsv()
    } catch (error) {
      const message =
        error instanceof ApiError && error.status === 401
          ? t('assets.exportNeedToken')
          : error instanceof Error
            ? error.message
            : t('assets.exportError')
      toast.error(message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 p-4 sm:p-5 lg:gap-6 lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
            <Package className="size-3.5" />
            {t('assets.badge')}
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
              {t('assets.heading')}
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              {t('assets.intro')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={isAdmin ? 'outline' : 'default'}
            onClick={() => void handleExport()}
            disabled={exporting}
          >
            {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {t('assets.export')}
          </Button>
          {isAdmin ? (
            <Button asChild>
              <Link href="/assets/new">
                <Plus className="size-4" />
                {t('assets.new')}
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <Card className="bg-white/[0.03] py-4">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg font-medium">{t('assets.search')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-4 md:flex-row">
          <form
            className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault()
              setAppliedQuery(query.trim())
            }}
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <Label htmlFor="assets-q" className="sr-only">
                {t('assets.search')}
              </Label>
              <Input
                id="assets-q"
                value={query}
                placeholder={t('assets.searchPlaceholder')}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Button type="submit" variant="outline">
              <Search className="size-4" />
              {t('assets.search')}
            </Button>
          </form>
          <div className="w-full md:w-56">
            <Label htmlFor="assets-status" className="sr-only">
              {t('assets.status')}
            </Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as AssetStatus | 'all')}
            >
              <SelectTrigger id="assets-status" className="h-11 w-full rounded-xl">
                <SelectValue placeholder={t('assets.status')} />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === 'all' ? t('assets.statusAll') : t(`assets.status.${option}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loadState === 'error' ? (
        <Card className="border-red-400/20 bg-red-500/10 py-6">
          <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{t('assets.errorTitle')}</p>
              <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
            </div>
            <Button variant="outline" onClick={() => void fetchAssets()}>
              {t('assets.retry')}
            </Button>
          </CardContent>
        </Card>
      ) : loadState === 'loading' ? (
        <Card className="bg-white/[0.03] p-6" aria-busy="true">
          <p className="text-sm font-medium text-foreground">{t('assets.loadingTitle')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('assets.loadingBody')}</p>
          <div className="mt-4 space-y-3">
            {[0, 1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </Card>
      ) : assets.length === 0 ? (
        <Card className="bg-white/[0.03] p-8">
          <p className="text-center text-sm leading-6 text-muted-foreground">{t('assets.empty')}</p>
        </Card>
      ) : (
        <Card className="overflow-hidden border-border/50 bg-white/[0.03]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('assets.col.code')}</TableHead>
                <TableHead>{t('assets.col.serial')}</TableHead>
                <TableHead>{t('assets.col.brand')}</TableHead>
                <TableHead>{t('assets.col.model')}</TableHead>
                <TableHead>{t('assets.col.category')}</TableHead>
                <TableHead>{t('assets.col.status')}</TableHead>
                <TableHead>{t('assets.col.workstation')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>
                    <Link
                      href={`/assets/${asset.id}`}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {asset.inventory_code}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{asset.serial || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{asset.brand || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{asset.model || '—'}</TableCell>
                  <TableCell>{asset.category}</TableCell>
                  <TableCell>
                    <AssetStatusBadge status={asset.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{asset.workstation || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Package } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useLocale } from '@/components/providers/locale-provider'
import { ApiError } from '@/lib/api/client'
import { getSessionUser } from '@/lib/api/me'
import { createAsset } from '@/services/assets'

export default function NewAssetPage() {
  const { t } = useLocale()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [inventoryCode, setInventoryCode] = useState('')
  const [serial, setSerial] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [workstation, setWorkstation] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancel = false
    void getSessionUser().then((user) => {
      if (cancel) return
      setIsAdmin(user?.role === 'admin')
      setChecking(false)
    })
    return () => {
      cancel = true
    }
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!inventoryCode.trim() || !category.trim()) {
      setError(t('assets.create.required'))
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const created = await createAsset({
        inventory_code: inventoryCode.trim(),
        category: category.trim(),
        serial: serial.trim() || null,
        brand: brand.trim() || null,
        model: model.trim() || null,
        description: description.trim() || null,
        workstation: workstation.trim() || null,
      })
      toast.success(t('assets.create.success'))
      router.push(`/assets/${created.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail || err.message : t('error.loading'))
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg p-8">
        <p className="text-center text-muted-foreground">{t('assets.create.forbidden')}</p>
        <div className="mt-6 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/assets">{t('assets.create.back')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6 sm:p-8">
      <Link href="/assets">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('assets.create.back')}
        </Button>
      </Link>

      <div>
        <div className="mb-2 flex items-center gap-2 text-primary">
          <Package className="h-6 w-6" />
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('assets.create.title')}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{t('assets.create.subtitle')}</p>
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="inventory_code">{t('assets.field.inventoryCode')}</Label>
          <Input
            id="inventory_code"
            required
            autoComplete="off"
            className="h-11 rounded-xl"
            value={inventoryCode}
            onChange={(event) => setInventoryCode(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="serial">{t('assets.field.serial')}</Label>
          <Input
            id="serial"
            autoComplete="off"
            className="h-11 rounded-xl"
            value={serial}
            onChange={(event) => setSerial(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand">{t('assets.field.brand')}</Label>
          <Input
            id="brand"
            className="h-11 rounded-xl"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">{t('assets.field.model')}</Label>
          <Input
            id="model"
            className="h-11 rounded-xl"
            value={model}
            onChange={(event) => setModel(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">{t('assets.field.category')}</Label>
          <Input
            id="category"
            required
            className="h-11 rounded-xl"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">{t('assets.field.description')}</Label>
          <Textarea
            id="description"
            className="rounded-xl"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workstation">{t('assets.field.workstation')}</Label>
          <Input
            id="workstation"
            className="h-11 rounded-xl"
            value={workstation}
            onChange={(event) => setWorkstation(event.target.value)}
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="h-11 w-full rounded-xl" disabled={submitting}>
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {t('assets.create.submit')}
        </Button>
      </form>
    </div>
  )
}

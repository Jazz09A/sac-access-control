'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLocale } from '@/components/providers/locale-provider'

const createUserSchema = z.object({
  person_id: z.string().min(5, 'Mínimo 5 caracteres').max(20),
  full_name: z.string().min(1, 'Requerido').max(255),
  email: z
    .string()
    .max(255)
    .refine((s) => s.trim() === '' || z.string().email().safeParse(s).success, {
      message: 'Email inválido',
    }),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(256),
  is_active: z.boolean(),
  role: z.enum(['admin', 'user']),
})

type CreateUserForm = z.infer<typeof createUserSchema>

function formatApiError(detail: unknown): string {
  if (typeof detail === 'string') {
    return detail
  }
  if (Array.isArray(detail)) {
    return detail
      .map((d) => (d && typeof d === 'object' && 'msg' in d ? String((d as { msg: string }).msg) : ''))
      .filter(Boolean)
      .join('. ')
  }
  return 'Error al crear usuario'
}

export default function NewUserPage() {
  const { t } = useLocale()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      is_active: true,
      role: 'user',
      email: '',
    },
  })

  useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json().catch(() => ({}))
        if (!cancel && res.ok && data?.role === 'admin') {
          setIsAdmin(true)
        } else if (!cancel && res.ok) {
          setIsAdmin(false)
        } else {
          setIsAdmin(false)
        }
      } catch {
        if (!cancel) {
          setIsAdmin(false)
        }
      } finally {
        if (!cancel) {
          setChecking(false)
        }
      }
    })()
    return () => {
      cancel = true
    }
  }, [])

  const onSubmit = async (data: CreateUserForm) => {
    setSubmitting(true)
    try {
      const payload = {
        person_id: data.person_id.trim(),
        full_name: data.full_name.trim(),
        email: data.email?.trim() || null,
        password: data.password,
        is_active: data.is_active,
        role: data.role,
      }

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = formatApiError(body.detail)
        toast.error(msg)
        return
      }
      toast.success(t('users.create.success'))
      router.push('/')
    } catch (e) {
      console.error(e)
      toast.error('Error de red')
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
        <p className="text-center text-muted-foreground">{t('users.create.forbidden')}</p>
        <div className="mt-6 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/">{t('users.create.back')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6 sm:p-8">
      <Link href="/">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('users.create.back')}
        </Button>
      </Link>

      <div>
        <div className="mb-2 flex items-center gap-2 text-primary">
          <UserPlus className="h-6 w-6" />
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('users.create.title')}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{t('users.create.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="person_id">{t('users.create.cedula')}</Label>
          <Input
            id="person_id"
            autoComplete="off"
            className="h-11 rounded-xl"
            {...register('person_id')}
          />
          {errors.person_id ? (
            <p className="text-sm text-destructive">{errors.person_id.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name">{t('users.create.fullName')}</Label>
          <Input id="full_name" className="h-11 rounded-xl" {...register('full_name')} />
          {errors.full_name ? (
            <p className="text-sm text-destructive">{errors.full_name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('users.create.email')}</Label>
          <Input
            id="email"
            type="email"
            className="h-11 rounded-xl"
            {...register('email')}
          />
          {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('users.create.password')}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            className="h-11 rounded-xl"
            {...register('password')}
          />
          <p className="text-xs text-muted-foreground">{t('users.create.passwordHint')}</p>
          {errors.password ? (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>{t('users.create.role')}</Label>
          <Select
            value={watch('role')}
            onValueChange={(v) => setValue('role', v as 'admin' | 'user')}
          >
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">{t('users.create.roleUser')}</SelectItem>
              <SelectItem value="admin">{t('users.create.roleAdmin')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
          <Label htmlFor="is_active" className="text-sm font-normal">
            {t('users.create.active')}
          </Label>
          <Switch
            id="is_active"
            checked={watch('is_active')}
            onCheckedChange={(c) => setValue('is_active', c)}
          />
        </div>

        <Button type="submit" className="h-11 w-full rounded-xl" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              …
            </>
          ) : (
            t('users.create.submit')
          )}
        </Button>
      </form>
    </div>
  )
}

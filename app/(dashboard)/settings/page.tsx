'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, Globe, Mail, Shield, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { useLocale } from '@/components/providers/locale-provider'
import type { AppLocale } from '@/lib/i18n-messages'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'

function persistPrefVisits(v: boolean) {
  try {
    localStorage.setItem('sac_pref_notify_visits', v ? '1' : '0')
  } catch {
    /* ignore */
  }
}

function persistPrefSystem(v: boolean) {
  try {
    localStorage.setItem('sac_pref_notify_system', v ? '1' : '0')
  } catch {
    /* ignore */
  }
}

export default function SettingsPage() {
  const { t, locale, setLocale } = useLocale()
  const [username, setUsername] = useState<string>('')
  const [email, setEmail] = useState('')
  const [notifyVisits, setNotifyVisits] = useState(true)
  const [notifySystem, setNotifySystem] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json().catch(() => ({}))
        if (!cancelled && res.ok && data?.username) {
          setUsername(String(data.username))
        }
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sac_operator_email')
      if (stored) setEmail(stored)
      setNotifyVisits(localStorage.getItem('sac_pref_notify_visits') !== '0')
      setNotifySystem(localStorage.getItem('sac_pref_notify_system') === '1')
    } catch {
      /* ignore */
    }
  }, [])

  function saveLocalProfile() {
    try {
      localStorage.setItem('sac_operator_email', email.trim())
      localStorage.setItem('sac_pref_notify_visits', notifyVisits ? '1' : '0')
      localStorage.setItem('sac_pref_notify_system', notifySystem ? '1' : '0')
      toast.success(t('settings.saved'))
    } catch {
      toast.error('No se pudo guardar.')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2 gap-2 text-muted-foreground" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              {t('settings.back')}
            </Link>
          </Button>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t('settings.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('settings.subtitle')}</p>
        </div>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Card id="perfil" className="scroll-mt-24 border-white/10 bg-card/80">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{t('settings.profileTitle')}</CardTitle>
            </div>
            <CardDescription>{t('settings.profileDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settings-user">{t('settings.user')}</Label>
              <Input
                id="settings-user"
                value={username || '—'}
                readOnly
                className="bg-muted/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-email">{t('settings.email')}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="settings-email"
                  type="email"
                  placeholder={t('settings.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" className="rounded-xl" onClick={saveLocalProfile}>
                {t('settings.save')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card id="idioma" className="scroll-mt-24 border-white/10 bg-card/80">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{t('settings.langTitle')}</CardTitle>
            </div>
            <CardDescription>{t('settings.langDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>{t('settings.langLabel')}</Label>
              <RadioGroup
                value={locale}
                onValueChange={(v) => setLocale(v as AppLocale)}
                className="flex flex-col gap-3 sm:flex-row sm:gap-6"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="es" id="lang-es" />
                  <Label htmlFor="lang-es" className="cursor-pointer font-normal">
                    {t('topbar.langEs')}
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="en" id="lang-en" />
                  <Label htmlFor="lang-en" className="cursor-pointer font-normal">
                    {t('topbar.langEn')}
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-1 rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('settings.regionLabel')}
              </p>
              <p className="text-sm text-foreground">{t('settings.regionValue')}</p>
            </div>
            <div className="space-y-1 rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('settings.dateFormat')}
              </p>
              <p className="text-sm text-foreground">{t('settings.dateFormatValue')}</p>
            </div>
          </CardContent>
        </Card>

        <Card id="preferencias" className="scroll-mt-24 border-white/10 bg-card/80">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{t('settings.prefsTitle')}</CardTitle>
            </div>
            <CardDescription>{t('settings.prefsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{t('settings.prefVisits')}</p>
                <p className="text-xs text-muted-foreground">{t('settings.prefVisitsHint')}</p>
              </div>
              <Switch
                checked={notifyVisits}
                onCheckedChange={(v) => {
                  setNotifyVisits(v)
                  persistPrefVisits(v)
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{t('settings.prefSystem')}</p>
                <p className="text-xs text-muted-foreground">{t('settings.prefSystemHint')}</p>
              </div>
              <Switch
                checked={notifySystem}
                onCheckedChange={(v) => {
                  setNotifySystem(v)
                  persistPrefSystem(v)
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/80">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{t('settings.securityTitle')}</CardTitle>
            </div>
            <CardDescription>{t('settings.securityDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t('settings.securityBody')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

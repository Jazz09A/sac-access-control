'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { GateMode } from '@/lib/gate/types'
import { useLocale } from '@/components/providers/locale-provider'

interface GateModeToggleProps {
  mode: GateMode
  onChange: (mode: GateMode) => void
  disabled?: boolean
}

export function GateModeToggle({ mode, onChange, disabled }: GateModeToggleProps) {
  const { t } = useLocale()

  return (
    <div
      className="inline-flex rounded-xl border border-border bg-muted/40 p-1"
      role="tablist"
      aria-label={t('gate.mode.label')}
    >
      <Button
        type="button"
        role="tab"
        aria-selected={mode === 'entry'}
        variant={mode === 'entry' ? 'default' : 'ghost'}
        disabled={disabled}
        className={cn('h-11 min-w-32 text-base', mode !== 'entry' && 'text-muted-foreground')}
        onClick={() => onChange('entry')}
      >
        {t('gate.mode.entry')}
      </Button>
      <Button
        type="button"
        role="tab"
        aria-selected={mode === 'exit'}
        variant={mode === 'exit' ? 'default' : 'ghost'}
        disabled={disabled}
        className={cn('h-11 min-w-32 text-base', mode !== 'exit' && 'text-muted-foreground')}
        onClick={() => onChange('exit')}
      >
        {t('gate.mode.exit')}
      </Button>
    </div>
  )
}

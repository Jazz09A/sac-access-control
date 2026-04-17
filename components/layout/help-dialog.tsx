'use client'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/components/providers/locale-provider'

type HelpDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const { t } = useLocale()

  const rows = [
    { k: 'help.row1k', v: 'help.row1v' },
    { k: 'help.row2k', v: 'help.row2v' },
    { k: 'help.row3k', v: 'help.row3v' },
  ] as const

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl border-white/10 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{t('help.title')}</DialogTitle>
          <DialogDescription className="text-left text-sm leading-relaxed">
            {t('help.intro')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">{t('help.colShortcut')}</th>
                  <th className="px-3 py-2 font-medium">{t('help.colAction')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.k} className="border-b border-white/6 last:border-0">
                    <td className="px-3 py-2.5 font-mono text-xs text-foreground">{t(row.k)}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{t(row.v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <p className="text-sm font-medium text-foreground">{t('help.contact')}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('help.contactBody')}</p>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" className="rounded-xl">
              {t('help.close')}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

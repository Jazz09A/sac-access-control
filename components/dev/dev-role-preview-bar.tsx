'use client'

import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DEV_PREVIEW_ROLES,
  parseDevPreviewRole,
  type DevPreviewRole,
} from '@/lib/dev-role-preview'

const ROLE_LABEL: Record<DevPreviewRole, string> = {
  gate: 'Portero',
  officer: 'Funcionario',
  manager: 'Gerente',
  admin: 'Admin',
}

type DevRolePreviewBarProps = {
  role: DevPreviewRole | null
  onRoleChange: (role: DevPreviewRole) => void
}

export function DevRolePreviewBar({ role, onRoleChange }: DevRolePreviewBarProps) {
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div
      role="region"
      aria-label="Vista previa de rol"
      className="pointer-events-none fixed right-3 bottom-3 z-50 sm:right-4 sm:bottom-4"
    >
      <div className="pointer-events-auto flex max-w-[240px] flex-col gap-2 rounded-2xl border border-white/8 bg-background/95 p-3 shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Badge variant="outline">DEV</Badge>
          <p className="text-[10px] font-medium text-muted-foreground">Vista previa</p>
        </div>

        <Select
          value={role ?? 'admin'}
          onValueChange={(value) => {
            const next = parseDevPreviewRole(value)
            if (next) onRoleChange(next)
          }}
        >
          <SelectTrigger size="sm" className="h-8 w-full rounded-xl" aria-label="Rol de vista previa">
            <SelectValue placeholder="Rol de vista previa" />
          </SelectTrigger>
          <SelectContent align="end" className="z-[60]">
            {DEV_PREVIEW_ROLES.map((item) => (
              <SelectItem key={item} value={item}>
                {ROLE_LABEL[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="text-[11px] leading-4 text-muted-foreground">
          Vista previa — el API sigue con tu sesión
        </p>
      </div>
    </div>
  )
}

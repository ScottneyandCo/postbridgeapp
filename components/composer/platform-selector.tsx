'use client'

import { Check } from 'lucide-react'
import { PLATFORM_LIST, type PlatformId } from '@/lib/platforms'
import { PlatformBadge } from '@/components/platform-badge'
import { cn } from '@/lib/utils'

export function PlatformSelector({
  selected,
  onToggle,
}: {
  selected: PlatformId[]
  onToggle: (id: PlatformId) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PLATFORM_LIST.map((p) => {
        const active = selected.includes(p.id)
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onToggle(p.id)}
            aria-pressed={active}
            className={cn(
              'flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-sm font-medium transition-colors',
              active
                ? 'border-primary bg-accent text-accent-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground',
            )}
          >
            <PlatformBadge platform={p.id} size="sm" muted={!active} />
            {p.name}
            {active && <Check className="size-3.5 text-primary" />}
          </button>
        )
      })}
    </div>
  )
}

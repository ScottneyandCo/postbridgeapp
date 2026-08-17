import { PLATFORMS, type PlatformId } from '@/lib/platforms'
import { cn } from '@/lib/utils'

const SIZES = {
  sm: 'size-6 text-[10px] rounded-md',
  md: 'size-9 text-xs rounded-lg',
  lg: 'size-12 text-sm rounded-xl',
}

export function PlatformBadge({
  platform,
  size = 'md',
  className,
  muted = false,
}: {
  platform: PlatformId
  size?: keyof typeof SIZES
  className?: string
  muted?: boolean
}) {
  const p = PLATFORMS[platform]
  return (
    <span
      aria-label={p.name}
      title={p.name}
      className={cn(
        'inline-flex items-center justify-center font-semibold text-white shadow-sm ring-1 ring-black/5',
        SIZES[size],
        muted && 'opacity-40 grayscale',
        className,
      )}
      style={{ backgroundColor: p.color }}
    >
      {p.short}
    </span>
  )
}

export function PlatformStack({
  platforms,
  size = 'sm',
  max = 5,
}: {
  platforms: PlatformId[]
  size?: keyof typeof SIZES
  max?: number
}) {
  const shown = platforms.slice(0, max)
  const extra = platforms.length - shown.length
  return (
    <div className="flex items-center -space-x-1.5">
      {shown.map((p) => (
        <PlatformBadge key={p} platform={p} size={size} className="ring-2 ring-card" />
      ))}
      {extra > 0 && (
        <span className="ml-2.5 text-xs text-muted-foreground">+{extra}</span>
      )}
    </div>
  )
}

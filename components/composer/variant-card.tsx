'use client'

import { useState } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'
import { PLATFORMS, type PlatformId } from '@/lib/platforms'
import { PlatformBadge } from '@/components/platform-badge'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { type MediaItem, isVideo } from '@/lib/media'
import { Film } from 'lucide-react'

export type VariantState = {
  platform: PlatformId
  caption: string
  hashtags: string[]
  loading?: boolean
}

export function VariantCard({
  variant,
  media = [],
  onChange,
  onRegenerate,
}: {
  variant: VariantState
  media?: MediaItem[]
  onChange: (caption: string) => void
  onRegenerate: () => void
}) {
  const [copied, setCopied] = useState(false)
  const p = PLATFORMS[variant.platform]
  const full = variant.hashtags.length
    ? `${variant.caption}\n\n${variant.hashtags.map((h) => `#${h}`).join(' ')}`
    : variant.caption
  const count = full.length
  const over = count > p.charLimit

  function copy() {
    navigator.clipboard.writeText(full)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <PlatformBadge platform={variant.platform} size="md" />
          <div>
            <div className="text-sm font-semibold text-foreground">{p.name}</div>
            <div
              className={cn(
                'font-mono text-xs',
                over ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {count}/{p.charLimit}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={variant.loading}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
            aria-label={`Regenerate ${p.name} variant`}
          >
            <RefreshCw className={cn('size-4', variant.loading && 'animate-spin')} />
          </button>
          <button
            type="button"
            onClick={copy}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={`Copy ${p.name} caption`}
          >
            {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
          </button>
        </div>
      </div>

      <div className="p-4">
        {variant.loading ? (
          <div className="space-y-2">
            <div className="h-3.5 w-11/12 animate-pulse rounded bg-muted" />
            <div className="h-3.5 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <>
            <Textarea
              value={variant.caption}
              onChange={(e) => onChange(e.target.value)}
              rows={5}
              className="resize-none border-0 bg-transparent p-0 text-sm leading-relaxed shadow-none focus-visible:ring-0"
              aria-label={`${p.name} caption`}
            />
            {variant.hashtags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {variant.hashtags.map((h) => (
                  <span
                    key={h}
                    className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    #{h}
                  </span>
                ))}
              </div>
            )}
            {media.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {media.map((item) => (
                  <div
                    key={item.url}
                    className="relative size-16 overflow-hidden rounded-lg border bg-muted"
                  >
                    {isVideo(item) ? (
                      <div className="flex size-full items-center justify-center bg-secondary">
                        <Film className="size-4 text-muted-foreground" />
                      </div>
                    ) : (
                      <img
                        src={item.url || "/placeholder.svg"}
                        alt={item.name}
                        className="size-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

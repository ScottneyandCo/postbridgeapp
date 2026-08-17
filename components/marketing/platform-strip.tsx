import { PlatformBadge } from '@/components/platform-badge'
import { PLATFORM_LIST } from '@/lib/platforms'

export function PlatformStrip() {
  return (
    <section className="border-y border-border bg-card/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 sm:px-6">
        <p className="text-sm font-medium text-muted-foreground">
          One composer for every network you post to
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {PLATFORM_LIST.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 rounded-full border border-border bg-background py-1.5 pl-1.5 pr-3.5"
            >
              <PlatformBadge platform={p.id} size="sm" />
              <span className="text-sm font-medium text-foreground">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

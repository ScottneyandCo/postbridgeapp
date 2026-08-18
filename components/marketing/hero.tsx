import Link from 'next/link'
import { ArrowRight, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlatformBadge } from '@/components/platform-badge'
import type { PlatformId } from '@/lib/platforms'

const VARIANTS: { platform: PlatformId; text: string }[] = [
  { platform: 'x', text: 'I edit videos 10x faster with 3 tools. #2 is free 👇' },
  {
    platform: 'linkedin',
    text: 'After 400+ videos, these 3 editing tools cut my production time by 90%. Here is how each one earns its place in my workflow.',
  },
  { platform: 'tiktok', text: 'POV: you just found the 3 editing tools that save you 6 hrs a week 🎬' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-[500px] bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-accent),transparent)]"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div className="flex flex-col items-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            AI writes a version for every platform
          </span>

          <h1 className="mt-5 text-pretty text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Post once.
            <br />
            Publish <span className="text-primary">everywhere.</span>
          </h1>

          <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
            Write a single idea and PostBridge turns it into platform-perfect
            posts for all 9 networks — then schedules them in one click. From
            $0/month.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Start free — no card
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#how">See how it works</Link>
            </Button>
          </div>

          <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {['9 platforms', 'AI variants', 'Free forever plan'].map((f) => (
              <li key={f} className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-primary" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Product mock */}
        <div className="relative">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xl shadow-primary/5 sm:p-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-muted-foreground/25" />
                <span className="size-2.5 rounded-full bg-muted-foreground/25" />
                <span className="size-2.5 rounded-full bg-muted-foreground/25" />
              </div>
              <span className="ml-2 text-xs font-medium text-muted-foreground">
                New post
              </span>
            </div>

            <div className="mt-4 rounded-xl bg-muted/60 p-3.5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Your idea
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                3 tools I use to edit videos 10x faster (number 2 is free)
              </p>
            </div>

            <div className="my-3 flex items-center justify-center gap-2 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" />
              Generated 3 platform variants
            </div>

            <div className="flex flex-col gap-2.5">
              {VARIANTS.map((v) => (
                <div
                  key={v.platform}
                  className="flex items-start gap-3 rounded-xl border border-border bg-background p-3"
                >
                  <PlatformBadge platform={v.platform} size="md" />
                  <p className="text-sm leading-snug text-foreground/90">{v.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute -bottom-4 -right-3 hidden rotate-2 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium shadow-lg sm:flex">
            <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary">
              <Check className="size-3.5" />
            </span>
            Scheduled to 3 accounts
          </div>
        </div>
      </div>
    </section>
  )
}

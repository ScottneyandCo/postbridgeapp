import { Wand2, Repeat2, CalendarDays, BarChart3, Users, Clock } from 'lucide-react'
import { PlatformBadge } from '@/components/platform-badge'

export function Features() {
  return (
    <section id="features" className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Features
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            An AI content engine, not just a scheduler
          </h2>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-6 md:grid-rows-2">
          {/* Big AI card */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 md:col-span-4 md:row-span-2">
            <div>
              <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Wand2 className="size-5" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-foreground">
                Platform-perfect variants, instantly
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Our AI rewrites your idea for each network&apos;s voice, length
                limit and best practices — hooks for TikTok, insight for
                LinkedIn, threads for X.
              </p>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {(['tiktok', 'linkedin', 'x'] as const).map((p) => (
                <div key={p} className="rounded-xl border border-border bg-muted/50 p-3">
                  <PlatformBadge platform={p} size="sm" />
                  <p className="mt-2 text-xs leading-snug text-muted-foreground">
                    Tuned tone, length &amp; hashtags
                  </p>
                </div>
              ))}
            </div>
          </div>

          <FeatureCard
            icon={Repeat2}
            title="Repurpose in a click"
            body="Turn one long video into a week of posts across formats."
            className="md:col-span-2"
          />
          <FeatureCard
            icon={Clock}
            title="Best-time posting"
            body="We queue each post when your audience is most active."
            className="md:col-span-2"
          />
          <FeatureCard
            icon={CalendarDays}
            title="Visual calendar"
            body="See and drag your whole content plan in one place."
          />
          <FeatureCard
            icon={BarChart3}
            title="Cross-platform analytics"
            body="Reach and engagement unified across every account."
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  body,
  className = '',
}: {
  icon: React.ElementType
  title: string
  body: string
  className?: string
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-6 ${className}`}>
      <div className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}

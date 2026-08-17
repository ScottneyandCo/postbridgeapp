import { PenLine, Sparkles, CalendarClock } from 'lucide-react'

const STEPS = [
  {
    icon: PenLine,
    title: 'Write one idea',
    body: 'Drop a rough thought, a link, or a video. No need to polish it — that is our job.',
  },
  {
    icon: Sparkles,
    title: 'AI tailors each platform',
    body: 'Get a native-feeling version for every network — the right hook, length, tone and hashtags.',
  },
  {
    icon: CalendarClock,
    title: 'Schedule everywhere',
    body: 'Approve, pick the best times, and publish to all your accounts in a single click.',
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          How it works
        </p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          From one idea to everywhere in under a minute
        </h2>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="relative rounded-2xl border border-border bg-card p-6">
            <span className="font-mono text-sm text-muted-foreground">
              0{i + 1}
            </span>
            <div className="mt-4 grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground">
              <s.icon className="size-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

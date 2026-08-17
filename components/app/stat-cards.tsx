import { CalendarClock, Send, TrendingUp, Sparkles } from 'lucide-react'
import { USAGE, POSTS, REACH_SERIES } from '@/lib/mock-data'
import { formatNumber } from '@/lib/format'

export function StatCards() {
  const scheduled = POSTS.filter((p) => p.status === 'scheduled').length
  const weekReach = REACH_SERIES.reduce((s, p) => s + p.reach, 0)
  const creditsLeft = USAGE.aiCreditsTotal - USAGE.aiCreditsUsed

  const stats = [
    {
      label: 'Scheduled posts',
      value: `${scheduled}`,
      hint: 'in your queue',
      icon: CalendarClock,
    },
    {
      label: 'Posts this month',
      value: `${USAGE.postsThisMonth}`,
      hint: 'across all accounts',
      icon: Send,
    },
    {
      label: 'Reach this week',
      value: formatNumber(weekReach),
      hint: '+18% vs last week',
      icon: TrendingUp,
    },
    {
      label: 'AI credits left',
      value: `${creditsLeft}`,
      hint: `${USAGE.plan} plan`,
      icon: Sparkles,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {s.label}
            </span>
            <span className="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground">
              <s.icon className="size-4.5" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            {s.value}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
        </div>
      ))}
    </div>
  )
}

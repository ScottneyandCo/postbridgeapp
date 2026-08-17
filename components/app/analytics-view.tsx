"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { PlatformBadge } from "@/components/platform-badge"
import { PLATFORMS } from "@/lib/platforms"
import { REACH_SERIES, PLATFORM_PERFORMANCE } from "@/lib/mock-data"
import { formatCompact } from "@/lib/format"

const SUMMARY = [
  { label: "Total reach", value: 375100, delta: "+18.2%" },
  { label: "Engagements", value: 13430, delta: "+12.4%" },
  { label: "Avg. engagement rate", value: 3.6, delta: "+0.4pts", suffix: "%" },
  { label: "Posts published", value: 80, delta: "+9", suffix: "" },
]

export function AnalyticsView() {
  const maxReach = Math.max(...PLATFORM_PERFORMANCE.map((p) => p.reach))

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight">
                {s.suffix === "%" ? s.value : formatCompact(s.value)}
                {s.suffix}
              </span>
              <span className="text-xs font-medium text-primary">{s.delta}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Reach & engagement</h2>
            <p className="text-xs text-muted-foreground">Last 7 days across all platforms</p>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REACH_SERIES} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="reachFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="engFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatCompact(Number(v))}
                width={44}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.75rem",
                  fontSize: "0.8rem",
                  color: "var(--color-popover-foreground)",
                }}
                formatter={(value, name) => [formatCompact(Number(value)), String(name)]}
              />
              <Area
                type="monotone"
                dataKey="reach"
                name="Reach"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                fill="url(#reachFill)"
              />
              <Area
                type="monotone"
                dataKey="engagement"
                name="Engagement"
                stroke="var(--color-chart-2)"
                strokeWidth={2}
                fill="url(#engFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">Reach by platform</h2>
        <div className="space-y-3">
          {PLATFORM_PERFORMANCE.map((row) => (
            <div key={row.platform} className="flex items-center gap-3">
              <PlatformBadge platform={row.platform} size="sm" />
              <div className="w-24 shrink-0 text-sm font-medium">{PLATFORMS[row.platform].name}</div>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(row.reach / maxReach) * 100}%` }}
                />
              </div>
              <div className="w-16 shrink-0 text-right text-sm font-semibold">
                {formatCompact(row.reach)}
              </div>
              <div className="w-16 shrink-0 text-right text-xs text-muted-foreground">
                {row.posts} posts
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

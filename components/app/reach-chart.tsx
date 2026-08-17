'use client'

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { REACH_SERIES } from '@/lib/mock-data'
import { formatNumber } from '@/lib/format'

export function ReachChart() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Reach this week</h2>
        <span className="text-xs text-muted-foreground">Last 7 days</span>
      </div>
      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={REACH_SERIES} margin={{ left: -16, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="reachFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={48}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
              tickFormatter={(v) => formatNumber(v as number)}
            />
            <Tooltip
              cursor={{ stroke: 'var(--color-border)' }}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                background: 'var(--color-popover)',
                color: 'var(--color-popover-foreground)',
                fontSize: 12,
              }}
              formatter={(v) => [formatNumber(Number(v)), 'Reach']}
            />
            <Area
              type="monotone"
              dataKey="reach"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              fill="url(#reachFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

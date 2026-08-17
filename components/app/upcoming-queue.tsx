import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ScheduledPost } from '@/lib/mock-data'
import { PlatformStack } from '@/components/platform-badge'
import { StatusPill } from '@/components/app/status-pill'
import { formatTime, relativeDayLabel } from '@/lib/format'

export function UpcomingQueue({ posts }: { posts: ScheduledPost[] }) {
  const upcoming = posts
    .filter((p) => p.status === 'scheduled' || p.status === 'draft')
    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-semibold text-foreground">Up next</h2>
        <Link
          href="/dashboard/calendar"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Calendar
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <ul className="divide-y divide-border">
        {upcoming.map((post) => (
          <li key={post.id} className="flex items-center gap-4 px-5 py-4">
            <div className="w-24 shrink-0">
              <div className="text-sm font-medium text-foreground">
                {relativeDayLabel(post.scheduledAt)}
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                {formatTime(post.scheduledAt)}
              </div>
            </div>
            <p className="line-clamp-2 flex-1 text-sm text-foreground/90">
              {post.content}
            </p>
            <div className="hidden sm:block">
              <PlatformStack platforms={post.platforms} />
            </div>
            <div className="w-24 text-right">
              <StatusPill status={post.status} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

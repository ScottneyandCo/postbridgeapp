import type { PostStatus } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const STYLES: Record<PostStatus, string> = {
  scheduled: 'bg-accent text-accent-foreground',
  published: 'bg-primary/10 text-primary',
  draft: 'bg-muted text-muted-foreground',
  failed: 'bg-destructive/10 text-destructive',
  partial: 'bg-chart-4/15 text-chart-4',
}

const LABELS: Record<PostStatus, string> = {
  scheduled: 'Scheduled',
  published: 'Published',
  draft: 'Draft',
  failed: 'Failed',
  partial: 'Partial',
}

export function StatusPill({ status }: { status: PostStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        STYLES[status],
      )}
    >
      {LABELS[status]}
    </span>
  )
}

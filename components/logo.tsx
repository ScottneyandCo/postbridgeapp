import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({
  className,
  showText = true,
}: {
  className?: string
  showText?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Sparkles className="size-4.5" strokeWidth={2.5} />
      </span>
      {showText && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Crosspost<span className="text-primary">AI</span>
        </span>
      )}
    </span>
  )
}

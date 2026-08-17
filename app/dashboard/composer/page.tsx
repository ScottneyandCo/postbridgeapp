import { Composer } from "@/components/composer/composer"

export default function ComposerPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          AI Content Engine
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Composer</h1>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">
          One idea in, platform-perfect posts out. The AI tailors the hook, length, and hashtags for
          every network so you never rewrite the same post twice.
        </p>
      </div>
      <Composer />
    </div>
  )
}

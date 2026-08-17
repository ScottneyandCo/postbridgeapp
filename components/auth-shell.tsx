import type React from "react"
import { PLATFORM_LIST } from "@/lib/platforms"
import { PlatformBadge } from "@/components/platform-badge"

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col lg:flex-row">
      <div className="flex flex-1 items-center justify-center px-6 py-12">{children}</div>
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-primary px-12 lg:flex">
        <div className="relative z-10 max-w-md text-primary-foreground">
          <p className="text-sm font-medium uppercase tracking-widest text-primary-foreground/70">
            One idea. Every platform.
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight text-balance">
            Write once. Let AI tailor it for every feed, then schedule it all.
          </h2>
          <div className="mt-8 flex flex-wrap gap-2">
            {PLATFORM_LIST.map((p) => (
              <PlatformBadge key={p.id} platform={p.id} size="sm" />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

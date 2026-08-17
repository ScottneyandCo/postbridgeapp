"use client"

import { useState, useTransition } from "react"
import { Plus, Check, Loader2, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlatformBadge } from "@/components/platform-badge"
import { PLATFORM_LIST, type PlatformId } from "@/lib/platforms"
import { formatCompact } from "@/lib/format"
import { connectAccount, disconnectAccount } from "@/app/actions/accounts"
import { cn } from "@/lib/utils"

export type ConnectedAccount = {
  id: number
  platform: string
  handle: string
  displayName: string | null
  followers: number
  isReal: boolean
}

export function AccountsManager({
  initial,
  xEnabled,
}: {
  initial: ConnectedAccount[]
  xEnabled: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [draft, setDraft] = useState<PlatformId | null>(null)
  const [handle, setHandle] = useState("")
  const [busy, setBusy] = useState<string | null>(null)

  // Index connected accounts by platform for quick lookup.
  const byPlatform = new Map(initial.map((a) => [a.platform, a]))
  const connectedCount = initial.length

  function submitConnect(platform: PlatformId) {
    if (!handle.trim()) return
    setBusy(platform)
    startTransition(async () => {
      try {
        await connectAccount({ platform, handle: handle.trim() })
        setDraft(null)
        setHandle("")
      } finally {
        setBusy(null)
      }
    })
  }

  function handleDisconnect(id: number, platform: string) {
    setBusy(platform)
    startTransition(async () => {
      try {
        await disconnectAccount(id)
      } finally {
        setBusy(null)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{connectedCount}</span> of{" "}
          {PLATFORM_LIST.length} platforms connected
        </p>
        <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
          Creator plan · 6 max
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORM_LIST.map((p) => {
          const account = byPlatform.get(p.id)
          const connected = Boolean(account)
          const isDrafting = draft === p.id
          const isBusy = busy === p.id && pending

          return (
            <div
              key={p.id}
              className={cn(
                "flex flex-col rounded-xl border bg-card p-4 transition-colors",
                !connected && "opacity-90",
              )}
            >
              <div className="flex items-start justify-between">
                <PlatformBadge platform={p.id} size="lg" muted={!connected} />
                {connected &&
                  (account!.isReal ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                      <Zap className="size-3" />
                      Live
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                      <Check className="size-3" />
                      Connected
                    </span>
                  ))}
              </div>
              <div className="mt-3">
                <p className="text-sm font-semibold text-foreground">{p.name}</p>
                <p className="text-sm text-muted-foreground">
                  {connected ? `@${account!.handle}` : "Not connected"}
                </p>
              </div>

              {isDrafting ? (
                <div className="mt-3 border-t pt-3">
                  <div className="flex items-center gap-2">
                    <Input
                      autoFocus
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.nativeEvent.isComposing) submitConnect(p.id)
                        if (e.key === "Escape") setDraft(null)
                      }}
                      placeholder="your-handle"
                      className="h-8 text-sm"
                      aria-label={`${p.name} handle`}
                    />
                    <Button
                      size="sm"
                      className="h-8 shrink-0"
                      disabled={isBusy || !handle.trim()}
                      onClick={() => submitConnect(p.id)}
                    >
                      {isBusy ? <Loader2 className="size-3.5 animate-spin" /> : "Link"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      onClick={() => {
                        setDraft(null)
                        setHandle("")
                      }}
                      aria-label="Cancel"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {connected ? formatCompact(account!.followers) : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">followers</p>
                  </div>
                  {connected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 bg-transparent"
                      disabled={isBusy}
                      onClick={() => handleDisconnect(account!.id, p.id)}
                    >
                      {isBusy ? <Loader2 className="size-3.5 animate-spin" /> : "Disconnect"}
                    </Button>
                  ) : p.id === "x" && xEnabled ? (
                    <Button size="sm" className="gap-1.5" asChild>
                      <a href="/api/connect/x/start">
                        <Zap className="size-3.5" />
                        Connect live
                      </a>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => {
                        setDraft(p.id)
                        setHandle("")
                      }}
                    >
                      <Plus className="size-3.5" />
                      Connect
                    </Button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

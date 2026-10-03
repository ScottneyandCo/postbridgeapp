"use client"

import { useState, useTransition } from "react"
import { ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { connectBluesky } from "@/app/actions/accounts"

export function BlueskyConnectForm({ onDone }: { onDone: () => void }) {
  const [identifier, setIdentifier] = useState("")
  const [appPassword, setAppPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!identifier.trim() || !appPassword.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await connectBluesky({ identifier, appPassword })
      if (result.ok) {
        setAppPassword("")
        onDone()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={submit} className="mt-3 flex flex-col gap-3 border-t pt-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bsky-handle" className="text-xs">
          Handle
        </Label>
        <Input
          id="bsky-handle"
          autoFocus
          autoComplete="username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="you.bsky.social"
          className="h-8 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bsky-password" className="text-xs">
          App password
        </Label>
        <Input
          id="bsky-password"
          type="password"
          autoComplete="off"
          value={appPassword}
          onChange={(e) => setAppPassword(e.target.value)}
          placeholder="xxxx-xxxx-xxxx-xxxx"
          className="h-8 font-mono text-sm"
        />
        <a
          href="https://bsky.app/settings/app-passwords"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Create an app password in Bluesky settings
          <ExternalLink className="size-3" aria-hidden />
        </a>
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={pending || !identifier.trim() || !appPassword.trim()}
        >
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : "Connect"}
        </Button>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        We only keep a session token, never your app password. Revoke access anytime from Bluesky.
      </p>
    </form>
  )
}

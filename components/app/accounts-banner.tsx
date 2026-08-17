"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { CheckCircle2, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

const ERROR_MESSAGES: Record<string, string> = {
  x_not_configured:
    "X isn't configured yet. Add your X_CLIENT_ID and X_CLIENT_SECRET to enable real posting.",
  x_denied: "The X authorization was cancelled.",
  x_invalid: "The X connection request was invalid or expired. Please try again.",
  x_state: "The X connection couldn't be verified (state mismatch). Please try again.",
  x_exchange: "We couldn't complete the X connection. Please try again.",
}

export function AccountsBanner({
  connected,
  error,
}: {
  connected?: string
  error?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [visible, setVisible] = useState(Boolean(connected || error))

  // Clear the query params from the URL so the banner doesn't persist on reload.
  useEffect(() => {
    if (connected || error) {
      const t = setTimeout(() => router.replace(pathname), 6000)
      return () => clearTimeout(t)
    }
  }, [connected, error, pathname, router])

  if (!visible || (!connected && !error)) return null

  const isSuccess = Boolean(connected)
  const message = isSuccess
    ? `Your ${connected === "x" ? "X" : connected} account is connected and ready to publish.`
    : (ERROR_MESSAGES[error ?? ""] ?? "Something went wrong connecting your account.")

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4",
        isSuccess
          ? "border-primary/30 bg-primary/10"
          : "border-destructive/30 bg-destructive/10",
      )}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
      ) : (
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
      )}
      <p className={cn("flex-1 text-sm", isSuccess ? "text-foreground" : "text-foreground")}>
        {message}
      </p>
      <button
        type="button"
        onClick={() => {
          setVisible(false)
          router.replace(pathname)
        }}
        aria-label="Dismiss"
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

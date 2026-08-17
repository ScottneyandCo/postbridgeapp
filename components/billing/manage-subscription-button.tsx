"use client"

import { useState } from "react"
import { ExternalLink, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBillingPortalSession } from "@/app/actions/stripe"

export function ManageSubscriptionButton({
  variant = "outline",
}: {
  variant?: "outline" | "default"
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function openPortal() {
    setLoading(true)
    setError(null)
    try {
      const url = await createBillingPortalSession()
      // Portal is a top-level Stripe page — break out of the preview iframe.
      if (window.self !== window.top) {
        window.open(url, "_blank", "noopener,noreferrer")
      } else {
        window.location.href = url
      }
    } catch (err) {
      console.log("[v0] billing portal error:", err)
      setError(err instanceof Error ? err.message : "Could not open the billing portal.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        variant={variant}
        size="sm"
        className={variant === "outline" ? "gap-2 bg-transparent" : "gap-2"}
        onClick={openPortal}
        disabled={loading}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <ExternalLink className="size-4" />}
        Manage subscription
      </Button>
      {error && (
        <span className="inline-flex items-center gap-1 text-xs text-destructive">
          <AlertTriangle className="size-3" />
          {error}
        </span>
      )}
    </div>
  )
}

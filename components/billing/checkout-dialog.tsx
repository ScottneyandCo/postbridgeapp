"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { startSubscriptionCheckout, finalizeCheckout } from "@/app/actions/stripe"
import type { BillingInterval } from "@/lib/pricing"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
)

export type CheckoutTarget = { planId: string; interval: BillingInterval } | null

export function CheckoutDialog({
  target,
  onClose,
}: {
  target: CheckoutTarget
  onClose: () => void
}) {
  const router = useRouter()

  const fetchClientSecret = useCallback(async () => {
    if (!target) return ""
    const clientSecret = await startSubscriptionCheckout(
      target.planId,
      target.interval,
    )
    return clientSecret ?? ""
  }, [target])

  const handleComplete = useCallback(async () => {
    await finalizeCheckout()
    router.refresh()
    // Give the success state a beat to render inside the embedded frame.
    setTimeout(() => onClose(), 1200)
  }, [router, onClose])

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="text-lg">Complete your subscription</DialogTitle>
          <DialogDescription className="sr-only">
            Secure checkout powered by Stripe
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-2">
          {target && (
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ fetchClientSecret, onComplete: handleComplete }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

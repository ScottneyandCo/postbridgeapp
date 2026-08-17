import { CreditCard, AlertTriangle } from "lucide-react"
import { getCurrentSubscription } from "@/app/actions/stripe"
import { getPlan } from "@/lib/pricing"
import { BillingPlans } from "@/components/billing/billing-plans"
import { ManageSubscriptionButton } from "@/components/billing/manage-subscription-button"

export default async function BillingPage() {
  const sub = await getCurrentSubscription()
  const isPastDue = sub?.status === "past_due"
  const hasBillingAccount = Boolean(sub?.stripeCustomerId)
  const currentPlanId = sub?.plan ?? "free"
  const currentPlan = getPlan(currentPlanId)
  const renews = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Billing & plans</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your subscription. Upgrade any time — changes apply immediately.
        </p>
      </div>

      {isPastDue && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="text-sm">
            <p className="font-semibold text-destructive">Payment failed</p>
            <p className="mt-0.5 text-muted-foreground">
              We couldn&apos;t process your last payment for the{" "}
              {currentPlan?.name ?? "current"} plan. Update your payment method to keep your
              plan active.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <CreditCard className="size-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="text-lg font-semibold">
              {currentPlan?.name ?? "Free"}
              {sub?.interval === "year" && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  (annual)
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {sub
              ? isPastDue
                ? "Payment past due"
                : renews
                  ? `Renews ${renews}`
                  : "Active subscription"
              : "You're on the free plan"}
          </div>
          {hasBillingAccount && <ManageSubscriptionButton />}
        </div>
      </div>

      <BillingPlans currentPlan={currentPlanId} />
    </div>
  )
}

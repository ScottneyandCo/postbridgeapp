"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { subscriptions } from "@/lib/db/schema"
import { stripe } from "@/lib/stripe"
import { amountForPlan, getPlan, type BillingInterval } from "@/lib/pricing"
import { and, desc, eq, inArray } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { getAppUrl } from "@/lib/app-url"

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user
}

/**
 * Start an embedded subscription Checkout for the given plan + interval.
 * The price is recomputed server-side from the plan catalog so the client
 * can never choose the amount — only which plan they want.
 */
export async function startSubscriptionCheckout(
  planId: string,
  interval: BillingInterval,
) {
  const user = await requireUser()

  const plan = getPlan(planId)
  if (!plan) throw new Error("Unknown plan")
  if (plan.priceInCents === 0) throw new Error("The Free plan does not require checkout")
  if (interval !== "month" && interval !== "year") throw new Error("Invalid interval")

  const amount = amountForPlan(plan, interval)

  const checkout = await stripe.checkout.sessions.create({
    // `embedded_page` replaced `embedded` in stripe-node v21+ (v22 installed).
    ui_mode: "embedded_page",
    mode: "subscription",
    redirect_on_completion: "never",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `PostBridge — ${plan.name}`,
            description: plan.tagline,
          },
          unit_amount: amount,
          recurring: { interval },
        },
        quantity: 1,
      },
    ],
    metadata: { userId: user.id, planId: plan.id, interval },
  })

  // Clear any prior pending attempts, then record this one so we can finalize
  // it after the embedded checkout completes.
  await db
    .delete(subscriptions)
    .where(and(eq(subscriptions.userId, user.id), eq(subscriptions.status, "pending")))
  await db.insert(subscriptions).values({
    userId: user.id,
    plan: plan.id,
    interval,
    status: "pending",
    stripeSessionId: checkout.id,
  })

  return checkout.client_secret
}

/**
 * Called after the embedded checkout reports completion. Verifies the most
 * recent pending session with Stripe and, if paid, activates the plan.
 */
export async function finalizeCheckout() {
  const user = await requireUser()

  const [pending] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, user.id), eq(subscriptions.status, "pending")))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1)

  if (!pending?.stripeSessionId) return null

  const checkout = await stripe.checkout.sessions.retrieve(pending.stripeSessionId, {
    expand: ["subscription"],
  })

  if (checkout.status !== "complete") return null

  const sub = checkout.subscription as { id: string; current_period_end?: number } | null
  const periodEnd =
    sub?.current_period_end != null ? new Date(sub.current_period_end * 1000) : null

  // Deactivate any previously active plan, then activate this one.
  await db
    .update(subscriptions)
    .set({ status: "canceled", updatedAt: new Date() })
    .where(and(eq(subscriptions.userId, user.id), eq(subscriptions.status, "active")))

  await db
    .update(subscriptions)
    .set({
      status: "active",
      stripeCustomerId:
        typeof checkout.customer === "string" ? checkout.customer : (checkout.customer?.id ?? null),
      stripeSubscriptionId: sub?.id ?? null,
      currentPeriodEnd: periodEnd,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, pending.id))

  revalidatePath("/dashboard/billing")
  revalidatePath("/dashboard")
  return { plan: pending.plan }
}

/** The user's current active subscription, if any. */
export async function getActiveSubscription() {
  const user = await requireUser()
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, user.id), eq(subscriptions.status, "active")))
    .orderBy(desc(subscriptions.updatedAt))
    .limit(1)
  return row ?? null
}

/**
 * Create a Stripe Billing Portal session so the user can manage their own
 * subscription — update the card, switch plans, view invoices, or cancel.
 * Returns the hosted portal URL for the client to redirect to.
 */
export async function createBillingPortalSession() {
  const user = await requireUser()

  const [row] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, user.id),
        inArray(subscriptions.status, ["active", "past_due", "canceled"]),
      ),
    )
    .orderBy(desc(subscriptions.updatedAt))
    .limit(1)

  if (!row?.stripeCustomerId) {
    throw new Error("No billing account yet. Subscribe to a paid plan first.")
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: row.stripeCustomerId,
    return_url: `${getAppUrl()}/dashboard/billing`,
  })

  return session.url
}

/**
 * The user's current billable subscription — active OR past_due. Used by the
 * billing page so a failed renewal (flagged past_due by the webhook) is
 * surfaced instead of silently showing the free plan.
 */
export async function getCurrentSubscription() {
  const user = await requireUser()
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, user.id),
        inArray(subscriptions.status, ["active", "past_due"]),
      ),
    )
    .orderBy(desc(subscriptions.updatedAt))
    .limit(1)
  return row ?? null
}

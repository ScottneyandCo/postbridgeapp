import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { subscriptions } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import type Stripe from "stripe"

// Stripe must reach this with the raw, unparsed body to verify the signature,
// so we read req.text() directly and never parse JSON first.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Map a Stripe subscription status onto the statuses this app stores. */
function mapStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case "active":
    case "trialing":
      return "active"
    case "past_due":
    case "unpaid":
      return "past_due"
    case "canceled":
    case "incomplete_expired":
      return "canceled"
    default:
      return "pending"
  }
}

/**
 * `current_period_end` lives on the subscription in older API versions and on
 * the subscription item in newer ones. Read both so we always get a date.
 */
function periodEndFrom(sub: Stripe.Subscription): Date | null {
  const fromSub = (sub as unknown as { current_period_end?: number }).current_period_end
  const fromItem = sub.items?.data?.[0]?.current_period_end
  const epoch = fromSub ?? fromItem
  return typeof epoch === "number" ? new Date(epoch * 1000) : null
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.log("[v0] Stripe webhook: STRIPE_WEBHOOK_SECRET is not set")
    return new Response("Webhook secret not configured", { status: 500 })
  }

  const signature = req.headers.get("stripe-signature")
  if (!signature) return new Response("Missing stripe-signature header", { status: 400 })

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch (err) {
    console.log("[v0] Stripe webhook signature verification failed:", err)
    return new Response("Invalid signature", { status: 400 })
  }

  try {
    switch (event.type) {
      // Fires when embedded/hosted checkout completes. Authoritative activation.
      case "checkout.session.completed": {
        const session = event.data.object
        const userId = session.metadata?.userId
        const planId = session.metadata?.planId
        const interval = session.metadata?.interval ?? "month"
        if (!userId || !planId) break

        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : (session.subscription?.id ?? null)
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : (session.customer?.id ?? null)

        let periodEnd: Date | null = null
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId)
          periodEnd = periodEndFrom(sub)
        }

        // Retire any currently active plan for this user first.
        await db
          .update(subscriptions)
          .set({ status: "canceled", updatedAt: new Date() })
          .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))

        // Promote the pending row created at checkout start, or insert if the
        // webhook somehow arrives before/without one.
        const [pending] = await db
          .select()
          .from(subscriptions)
          .where(
            and(
              eq(subscriptions.userId, userId),
              eq(subscriptions.stripeSessionId, session.id),
            ),
          )
          .limit(1)

        const values = {
          status: "active",
          plan: planId,
          interval,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subId,
          currentPeriodEnd: periodEnd,
          updatedAt: new Date(),
        }

        if (pending) {
          await db.update(subscriptions).set(values).where(eq(subscriptions.id, pending.id))
        } else {
          await db.insert(subscriptions).values({
            userId,
            stripeSessionId: session.id,
            ...values,
          })
        }
        break
      }

      // Fires on renewals, plan changes, cancellations scheduled, pauses, etc.
      case "customer.subscription.updated": {
        const sub = event.data.object
        await db
          .update(subscriptions)
          .set({
            status: mapStatus(sub.status),
            currentPeriodEnd: periodEndFrom(sub),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id))
        break
      }

      // Fires when a subscription is fully canceled/ended.
      case "customer.subscription.deleted": {
        const sub = event.data.object
        await db
          .update(subscriptions)
          .set({ status: "canceled", updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id))
        break
      }

      // Fires when a recurring charge fails. Flag the account as past due.
      case "invoice.payment_failed": {
        const invoice = event.data.object
        const subId =
          typeof (invoice as unknown as { subscription?: string | { id: string } }).subscription ===
          "string"
            ? (invoice as unknown as { subscription: string }).subscription
            : ((invoice as unknown as { subscription?: { id: string } }).subscription?.id ?? null)
        if (subId) {
          await db
            .update(subscriptions)
            .set({ status: "past_due", updatedAt: new Date() })
            .where(eq(subscriptions.stripeSubscriptionId, subId))
        }
        break
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break
    }
  } catch (err) {
    // Return 500 so Stripe retries transient DB failures.
    console.log("[v0] Stripe webhook handler error:", err)
    return new Response("Webhook handler error", { status: 500 })
  }

  return Response.json({ received: true })
}

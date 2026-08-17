export type Plan = {
  id: string
  name: string
  price: number
  /** Server-side source of truth for the monthly price, in cents. */
  priceInCents: number
  tagline: string
  featured?: boolean
  cta: string
  features: string[]
}

export type BillingInterval = "month" | "year"

/** Annual billing gives ~2 months free (20% off). */
export const ANNUAL_DISCOUNT = 0.8

/** Compute the charge amount (in cents) for a plan + interval, server-side. */
export function amountForPlan(plan: Plan, interval: BillingInterval): number {
  if (interval === "year") {
    return Math.round(plan.priceInCents * 12 * ANNUAL_DISCOUNT)
  }
  return plan.priceInCents
}

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id)
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceInCents: 0,
    tagline: 'Test the workflow, forever free.',
    cta: 'Start free',
    features: [
      '2 connected accounts',
      '10 scheduled posts / month',
      '15 AI credits / month',
      '1 platform variant per post',
    ],
  },
  {
    id: 'creator',
    name: 'Creator',
    price: 9,
    priceInCents: 900,
    tagline: 'For solo creators going all-in.',
    featured: true,
    cta: 'Start 7-day trial',
    features: [
      '6 connected accounts',
      'Unlimited scheduled posts',
      '300 AI credits / month',
      'All platform variants',
      'Best-time-to-post queue',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    priceInCents: 1900,
    tagline: 'For power creators who need data.',
    cta: 'Start 7-day trial',
    features: [
      '15 connected accounts',
      'Unlimited scheduled posts',
      '1,500 AI credits / month',
      'Cross-platform analytics',
      'Repurpose long-form to 12 posts',
      'Priority AI generation',
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 49,
    priceInCents: 4900,
    tagline: 'For teams managing many brands.',
    cta: 'Talk to us',
    features: [
      'Unlimited connected accounts',
      '3 team seats included',
      '6,000 AI credits / month',
      'Client workspaces',
      'Approval workflows',
      'Priority support',
    ],
  },
]

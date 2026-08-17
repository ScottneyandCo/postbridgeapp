import type { Metadata } from "next"
import { SiteHeader } from "@/components/marketing/site-header"
import { CtaFooter } from "@/components/marketing/cta-footer"
import { PricingTable } from "@/components/marketing/pricing-table"

export const metadata: Metadata = {
  title: "Pricing — Crosspost AI",
  description:
    "Simple, creator-friendly pricing. Start free, upgrade when you grow. AI-powered cross-posting to every platform.",
}

const FAQS = [
  {
    q: "What is an AI credit?",
    a: "One credit generates one platform-tailored variant of your post. A single idea posted to 4 platforms uses 4 credits. Credits reset monthly.",
  },
  {
    q: "Which platforms are supported?",
    a: "TikTok, Instagram, YouTube, X, LinkedIn, Facebook, Pinterest, Bluesky, and Threads — with more added regularly.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Plans are month-to-month (or annual if you choose). Cancel in one click, no questions asked.",
  },
  {
    q: "Do you take a cut of my content or revenue?",
    a: "Never. You own everything you create. We only charge the flat subscription.",
  },
]

export default function PricingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 pb-8 pt-16 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            Pricing
          </div>
          <h1 className="mx-auto mt-4 max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            One tool. Every platform. A price that makes sense.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            Start free and upgrade only when you outgrow it. No per-platform fees, no surprises —
            just the AI content engine that saves you hours every week.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <PricingTable />
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
          <dl className="mt-8 divide-y divide-border rounded-2xl border bg-card">
            {FAQS.map((faq) => (
              <div key={faq.q} className="p-6">
                <dt className="font-medium text-foreground">{faq.q}</dt>
                <dd className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
      <CtaFooter />
    </div>
  )
}

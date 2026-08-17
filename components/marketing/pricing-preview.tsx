import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PLANS } from '@/lib/pricing'
import { cn } from '@/lib/utils'

export function PricingPreview() {
  return (
    <section id="pricing" className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Pricing
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Start free. Upgrade when you scale.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Every paid plan is a fraction of Buffer or Hootsuite — with AI built in.
          </p>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'flex flex-col rounded-2xl border bg-card p-6',
                plan.featured ? 'border-primary ring-1 ring-primary' : 'border-border',
              )}
            >
              {plan.featured && (
                <span className="mb-4 inline-flex w-fit rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight text-foreground">
                  ${plan.price}
                </span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.tagline}</p>

              <Button
                className="mt-5"
                variant={plan.featured ? 'default' : 'outline'}
                asChild
              >
                <Link href="/dashboard">{plan.cta}</Link>
              </Button>

              <ul className="mt-6 flex flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

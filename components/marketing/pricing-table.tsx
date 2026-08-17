"use client"

import { useState } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PLANS } from "@/lib/pricing"
import { cn } from "@/lib/utils"

export function PricingTable() {
  const [annual, setAnnual] = useState(true)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-3">
        <span className={cn("text-sm font-medium", !annual && "text-foreground", annual && "text-muted-foreground")}>
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={annual}
          onClick={() => setAnnual((a) => !a)}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            annual ? "bg-primary" : "bg-input",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-5 rounded-full bg-background transition-transform",
              annual ? "translate-x-[22px]" : "translate-x-0.5",
            )}
          />
        </button>
        <span className={cn("text-sm font-medium", annual && "text-foreground", !annual && "text-muted-foreground")}>
          Annual
          <span className="ml-1.5 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
            Save 20%
          </span>
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const price = annual ? Math.round(plan.price * 0.8) : plan.price
          return (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-2xl border bg-card p-6",
                plan.featured && "border-primary shadow-lg ring-1 ring-primary/20",
              )}
            >
              {plan.featured && (
                <span className="mb-3 inline-flex w-fit rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">${price}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              {annual && plan.price > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">billed annually</p>
              )}
              <Button
                asChild
                variant={plan.featured ? "default" : "outline"}
                className={cn("mt-5 w-full", !plan.featured && "bg-transparent")}
              >
                <Link href="/sign-up">{plan.cta}</Link>
              </Button>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

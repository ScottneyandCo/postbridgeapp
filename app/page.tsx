import { SiteHeader } from '@/components/marketing/site-header'
import { Hero } from '@/components/marketing/hero'
import { PlatformStrip } from '@/components/marketing/platform-strip'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { Features } from '@/components/marketing/features'
import { SocialProof } from '@/components/marketing/social-proof'
import { PricingPreview } from '@/components/marketing/pricing-preview'
import { CtaFooter } from '@/components/marketing/cta-footer'

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <PlatformStrip />
        <HowItWorks />
        <Features />
        <SocialProof />
        <PricingPreview />
        <CtaFooter />
      </main>
    </div>
  )
}

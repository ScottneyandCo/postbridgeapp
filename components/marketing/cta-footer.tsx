import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'

export function CtaFooter() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_0%,rgba(255,255,255,0.18),transparent)]"
          />
          <h2 className="relative text-balance text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
            Stop rewriting the same post 6 times
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-pretty text-primary-foreground/80">
            Join creators publishing everywhere in minutes. Free forever plan, no
            credit card required.
          </p>
          <div className="relative mt-8">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/dashboard">
                Start free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6">
          <Logo />
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground">Features</Link>
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <Link href="#" className="hover:text-foreground">Privacy</Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PostBridge
          </p>
        </div>
      </footer>
    </>
  )
}

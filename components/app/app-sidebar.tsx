'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  PenSquare,
  CalendarDays,
  BarChart3,
  Users,
  CreditCard,
  Settings,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { USAGE } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Composer', href: '/dashboard/composer', icon: PenSquare },
  { label: 'Calendar', href: '/dashboard/calendar', icon: CalendarDays },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Accounts', href: '/dashboard/accounts', icon: Users },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
]

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const pct = Math.round((USAGE.aiCreditsUsed / USAGE.aiCreditsTotal) * 100)

  return (
    <div className="flex h-full flex-col gap-1 bg-sidebar p-3">
      <div className="px-2 py-3">
        <Link href="/" aria-label="PostBridge home">
          <Logo />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === item.href
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
              )}
            >
              <item.icon className="size-4.5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="rounded-xl border border-sidebar-border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">AI credits</span>
          <span className="font-mono text-xs text-muted-foreground">
            {USAGE.aiCreditsUsed}/{USAGE.aiCreditsTotal}
          </span>
        </div>
        <Progress value={pct} className="mt-2.5 h-1.5" />
        <p className="mt-2 text-xs text-muted-foreground">
          {USAGE.plan} plan · resets in 12 days
        </p>
        <Button size="sm" className="mt-3 w-full" asChild>
          <Link href="/dashboard/billing" onClick={onNavigate}>
            Upgrade plan
          </Link>
        </Button>
      </div>

      <Link
        href="#"
        className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      >
        <Settings className="size-4.5" />
        Settings
      </Link>
    </div>
  )
}

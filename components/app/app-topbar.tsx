'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppSidebar } from './app-sidebar'
import { UserMenu } from './user-menu'

const TITLES: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/composer': 'AI Composer',
  '/dashboard/calendar': 'Calendar',
  '/dashboard/accounts': 'Accounts',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/billing': 'Billing',
}

export function AppTopbar({
  user,
}: {
  user: { name: string; email: string }
}) {
  const pathname = usePathname()
  const title = TITLES[pathname] ?? 'Dashboard'
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid size-9 place-items-center rounded-lg text-foreground hover:bg-muted lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" asChild>
          <Link href="/dashboard/composer">
            <Plus className="size-4" />
            <span className="hidden sm:inline">New post</span>
          </Link>
        </Button>
        <UserMenu name={user.name} email={user.email} />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-border shadow-xl">
            <AppSidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </header>
  )
}

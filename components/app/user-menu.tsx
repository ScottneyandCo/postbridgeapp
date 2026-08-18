"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { signOut } from "@/lib/auth-client"

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function UserMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  async function handleSignOut() {
    setLoading(true)
    await signOut()
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid size-9 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground ring-1 ring-border transition hover:opacity-90"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {initials(name || email)}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 isolate w-56 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground opacity-100 shadow-xl ring-1 ring-foreground/5"
          style={{ backgroundColor: "var(--popover)" }}
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-popover-foreground">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={loading}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-popover-foreground transition hover:bg-muted disabled:opacity-60"
          >
            <LogOut className="size-4" />
            {loading ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  )
}

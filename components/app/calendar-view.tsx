"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlatformBadge } from "@/components/platform-badge"
import { StatusPill } from "@/components/app/status-pill"
import type { ScheduledPost } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function startOfWeek(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}

export function CalendarView({ posts }: { posts: ScheduledPost[] }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [weekStart])

  const postsByDay = useMemo(() => {
    const map = new Map<string, ScheduledPost[]>()
    for (const post of posts) {
      const key = new Date(post.scheduledAt).toDateString()
      const arr = map.get(key) ?? []
      arr.push(post)
      map.set(key, arr)
    }
    return map
  }, [posts])

  const today = new Date().toDateString()
  const rangeLabel = `${days[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${days[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}`

  function shiftWeek(dir: number) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + dir * 7)
    setWeekStart(d)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => shiftWeek(-1)} aria-label="Previous week">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => shiftWeek(1)} aria-label="Next week">
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>
            Today
          </Button>
          <span className="ml-2 text-sm font-medium text-muted-foreground">{rangeLabel}</span>
        </div>
        <Button asChild size="sm" className="gap-2">
          <Link href="/dashboard/composer">
            <Plus className="size-4" />
            New post
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
        {days.map((day) => {
          const key = day.toDateString()
          const dayPosts = postsByDay.get(key) ?? []
          const isToday = key === today
          return (
            <div
              key={key}
              className={cn(
                "flex min-h-44 flex-col rounded-xl border bg-card p-2",
                isToday && "border-primary ring-1 ring-primary/30",
              )}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {DAY_LABELS[day.getDay()]}
                </span>
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-md text-xs font-semibold",
                    isToday ? "bg-primary text-primary-foreground" : "text-foreground",
                  )}
                >
                  {day.getDate()}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                {dayPosts.map((post) => (
                  <div key={post.id} className="rounded-lg border bg-background p-2">
                    <div className="mb-1.5 flex items-center justify-between gap-1">
                      <div className="flex -space-x-1">
                        {post.platforms.slice(0, 3).map((p) => (
                          <PlatformBadge key={p} platform={p} size="sm" className="ring-2 ring-background" />
                        ))}
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {new Date(post.scheduledAt).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-xs leading-snug text-foreground">{post.content}</p>
                    <div className="mt-1.5">
                      <StatusPill status={post.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

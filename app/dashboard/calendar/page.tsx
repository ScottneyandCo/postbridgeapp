import { CalendarView } from "@/components/app/calendar-view"
import { getPosts } from "@/app/actions/posts"
import { toViewPosts } from "@/lib/post-view"

export default async function CalendarPage() {
  const posts = toViewPosts(await getPosts())
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your whole week at a glance. Every post, every platform, one queue.
        </p>
      </div>
      <CalendarView posts={posts} />
    </div>
  )
}

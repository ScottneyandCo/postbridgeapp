import Link from "next/link"
import { Sparkles, ArrowRight } from "lucide-react"
import { StatCards } from "@/components/app/stat-cards"
import { UpcomingQueue } from "@/components/app/upcoming-queue"
import { ReachChart } from "@/components/app/reach-chart"
import { Button } from "@/components/ui/button"
import { getPosts } from "@/app/actions/posts"
import { toViewPosts } from "@/lib/post-view"

export default async function DashboardPage() {
  const posts = toViewPosts(await getPosts())
  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* AI nudge banner */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/30 bg-accent/60 p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </span>
          <div>
            <p className="font-semibold text-foreground">Turn one idea into a week of content</p>
            <p className="text-sm text-muted-foreground">
              Open the AI Composer, drop a thought, and get variants for every platform.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/dashboard/composer">
            Open Composer
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-6">
        <StatCards />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <UpcomingQueue posts={posts} />
        <ReachChart />
      </div>
    </div>
  )
}

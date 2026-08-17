import { AnalyticsView } from "@/components/app/analytics-view"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          See what is working across every platform in one place — no more ten browser tabs.
        </p>
      </div>
      <AnalyticsView />
    </div>
  )
}

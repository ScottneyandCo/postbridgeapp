import { AccountsManager } from "@/components/app/accounts-manager"
import { getAccounts } from "@/app/actions/accounts"
import { xConfigured } from "@/lib/platforms/x"
import { AccountsBanner } from "@/components/app/accounts-banner"

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>
}) {
  const [rows, params] = await Promise.all([getAccounts(), searchParams])
  const initial = rows.map((r) => ({
    id: r.id,
    platform: r.platform,
    handle: r.handle,
    displayName: r.displayName,
    followers: r.followers,
    isReal: r.isReal,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your social accounts once. Publish to all of them from a single composer.
        </p>
      </div>
      <AccountsBanner connected={params.connected} error={params.error} />
      <AccountsManager initial={initial} xEnabled={xConfigured()} />
    </div>
  )
}

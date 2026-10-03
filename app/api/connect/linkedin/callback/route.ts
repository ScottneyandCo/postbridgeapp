import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"
import { and, eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { socialAccounts } from "@/lib/db/schema"
import { originFromRequest } from "@/lib/app-url"
import { exchangeCode, getMe } from "@/lib/platforms/linkedin"

export async function GET(req: Request) {
  const origin = originFromRequest(req)
  const accountsUrl = (params: string) =>
    NextResponse.redirect(new URL(`/dashboard/accounts${params}`, origin))

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.redirect(new URL("/sign-in", origin))
  }
  const userId = session.user.id

  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const returnedState = url.searchParams.get("state")
  const oauthError = url.searchParams.get("error")

  const cookieStore = await cookies()
  const savedState = cookieStore.get("li_oauth_state")?.value
  const redirectUri = cookieStore.get("li_oauth_redirect")?.value
  cookieStore.delete("li_oauth_state")
  cookieStore.delete("li_oauth_redirect")

  if (oauthError) return accountsUrl(`?error=linkedin_denied`)
  if (!code || !returnedState || !savedState || !redirectUri) {
    return accountsUrl(`?error=linkedin_invalid`)
  }
  if (returnedState !== savedState) return accountsUrl(`?error=linkedin_state`)

  try {
    const tokens = await exchangeCode({ code, redirectUri })
    const me = await getMe(tokens.accessToken)

    const [existing] = await db
      .select()
      .from(socialAccounts)
      .where(
        and(
          eq(socialAccounts.userId, userId),
          eq(socialAccounts.platform, "linkedin"),
          eq(socialAccounts.isReal, true),
        ),
      )
      .limit(1)

    const values = {
      userId,
      platform: "linkedin",
      handle: me.vanity,
      displayName: me.name,
      platformUserId: me.id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt: tokens.expiresAt,
      scope: tokens.scope,
      isReal: true,
      connected: true,
    }

    if (existing) {
      await db.update(socialAccounts).set(values).where(eq(socialAccounts.id, existing.id))
    } else {
      await db.insert(socialAccounts).values(values)
    }

    return accountsUrl(`?connected=linkedin`)
  } catch (err) {
    console.log("[v0] LinkedIn OAuth callback error:", err)
    return accountsUrl(`?error=linkedin_exchange`)
  }
}

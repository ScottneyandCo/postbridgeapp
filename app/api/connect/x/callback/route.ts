import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"
import { and, eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { socialAccounts } from "@/lib/db/schema"
import { originFromRequest } from "@/lib/app-url"
import { exchangeCode, getMe } from "@/lib/platforms/x"

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
  const savedState = cookieStore.get("x_oauth_state")?.value
  const verifier = cookieStore.get("x_oauth_verifier")?.value
  const redirectUri = cookieStore.get("x_oauth_redirect")?.value

  // Always clear the one-time flow cookies.
  for (const name of ["x_oauth_state", "x_oauth_verifier", "x_oauth_redirect"]) {
    cookieStore.delete(name)
  }

  if (oauthError) return accountsUrl(`?error=x_denied`)
  if (!code || !returnedState || !savedState || !verifier || !redirectUri) {
    return accountsUrl(`?error=x_invalid`)
  }
  if (returnedState !== savedState) {
    return accountsUrl(`?error=x_state`)
  }

  try {
    const tokens = await exchangeCode({ code, redirectUri, verifier })
    const me = await getMe(tokens.accessToken)

    // Upsert: one real X account per user.
    const [existing] = await db
      .select()
      .from(socialAccounts)
      .where(
        and(
          eq(socialAccounts.userId, userId),
          eq(socialAccounts.platform, "x"),
          eq(socialAccounts.isReal, true),
        ),
      )
      .limit(1)

    const values = {
      userId,
      platform: "x",
      handle: me.username,
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

    return accountsUrl(`?connected=x`)
  } catch (err) {
    console.log("[v0] X OAuth callback error:", err)
    return accountsUrl(`?error=x_exchange`)
  }
}

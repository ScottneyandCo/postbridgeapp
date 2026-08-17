import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"
import { auth } from "@/lib/auth"
import { originFromRequest } from "@/lib/app-url"
import { buildAuthorizeUrl, createPkce, xConfigured } from "@/lib/platforms/x"

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.redirect(new URL("/sign-in", originFromRequest(req)))
  }

  const origin = originFromRequest(req)

  if (!xConfigured()) {
    return NextResponse.redirect(
      new URL("/dashboard/accounts?error=x_not_configured", origin),
    )
  }

  const redirectUri = `${origin}/api/connect/x/callback`
  const { verifier, challenge, state } = createPkce()

  const authorizeUrl = buildAuthorizeUrl({ redirectUri, state, challenge })

  const cookieStore = await cookies()
  const secure = origin.startsWith("https://")
  const common = {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 10, // 10 minutes to complete the flow
  }
  cookieStore.set("x_oauth_state", state, common)
  cookieStore.set("x_oauth_verifier", verifier, common)
  cookieStore.set("x_oauth_redirect", redirectUri, common)

  return NextResponse.redirect(authorizeUrl)
}

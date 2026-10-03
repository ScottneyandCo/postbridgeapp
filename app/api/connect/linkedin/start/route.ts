import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"
import { auth } from "@/lib/auth"
import { originFromRequest } from "@/lib/app-url"
import { buildAuthorizeUrl, createState, linkedinConfigured } from "@/lib/platforms/linkedin"

export async function GET(req: Request) {
  const origin = originFromRequest(req)
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.redirect(new URL("/sign-in", origin))
  }

  if (!linkedinConfigured()) {
    return NextResponse.redirect(
      new URL("/dashboard/accounts?error=linkedin_not_configured", origin),
    )
  }

  const redirectUri = `${origin}/api/connect/linkedin/callback`
  const state = createState()

  const cookieStore = await cookies()
  const common = {
    httpOnly: true,
    secure: origin.startsWith("https://"),
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 10,
  }
  cookieStore.set("li_oauth_state", state, common)
  cookieStore.set("li_oauth_redirect", redirectUri, common)

  return NextResponse.redirect(buildAuthorizeUrl({ redirectUri, state }))
}

import { randomBytes } from "crypto"

// ---------------------------------------------------------------------------
// LinkedIn OAuth 2.0 (3-legged) + Posts API for member posts.
// Requires the "Sign In with LinkedIn using OpenID Connect" and
// "Share on LinkedIn" products on the LinkedIn developer app.
// Docs: https://learn.microsoft.com/linkedin/shared/authentication/authorization-code-flow
// ---------------------------------------------------------------------------

const AUTHORIZE_URL = "https://www.linkedin.com/oauth/v2/authorization"
const TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
const USERINFO_URL = "https://api.linkedin.com/v2/userinfo"
const POSTS_URL = "https://api.linkedin.com/rest/posts"

export const LINKEDIN_SCOPES = ["openid", "profile", "w_member_social"]

export function linkedinConfigured(): boolean {
  return Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET)
}

function clientId() {
  const id = process.env.LINKEDIN_CLIENT_ID
  if (!id) throw new Error("LINKEDIN_CLIENT_ID is not set")
  return id
}

function clientSecret() {
  const secret = process.env.LINKEDIN_CLIENT_SECRET
  if (!secret) throw new Error("LINKEDIN_CLIENT_SECRET is not set")
  return secret
}

/**
 * LinkedIn's versioned REST API requires a YYYYMM version header, and each
 * version is only supported for about a year. Default to two months ago so the
 * value is always a released, still-supported version.
 */
function apiVersion() {
  if (process.env.LINKEDIN_API_VERSION) return process.env.LINKEDIN_API_VERSION
  const d = new Date()
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() - 2)
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

export function createState() {
  return randomBytes(16).toString("base64url")
}

export function buildAuthorizeUrl(opts: { redirectUri: string; state: string }) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId(),
    redirect_uri: opts.redirectUri,
    scope: LINKEDIN_SCOPES.join(" "),
    state: opts.state,
  })
  return `${AUTHORIZE_URL}?${params.toString()}`
}

export type LinkedInTokens = {
  accessToken: string
  refreshToken: string | null
  expiresAt: Date
  scope: string
}

export async function exchangeCode(opts: {
  code: string
  redirectUri: string
}): Promise<LinkedInTokens> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: opts.code,
      redirect_uri: opts.redirectUri,
      client_id: clientId(),
      client_secret: clientSecret(),
    }),
  })
  if (!res.ok) {
    throw new Error(`LinkedIn token exchange failed (${res.status}): ${await res.text()}`)
  }
  const data = await res.json()
  return {
    accessToken: data.access_token,
    // Refresh tokens are only issued to approved partner apps; most apps get none.
    refreshToken: data.refresh_token ?? null,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    scope: data.scope ?? LINKEDIN_SCOPES.join(" "),
  }
}

export async function refreshTokens(refreshToken: string): Promise<LinkedInTokens> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId(),
      client_secret: clientSecret(),
    }),
  })
  if (!res.ok) {
    throw new Error(`LinkedIn token refresh failed (${res.status}): ${await res.text()}`)
  }
  const data = await res.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    scope: data.scope ?? LINKEDIN_SCOPES.join(" "),
  }
}

export type LinkedInUser = { id: string; name: string; vanity: string }

export async function getMe(accessToken: string): Promise<LinkedInUser> {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    throw new Error(`LinkedIn userinfo failed (${res.status}): ${await res.text()}`)
  }
  const data = await res.json()
  const name = data.name ?? [data.given_name, data.family_name].filter(Boolean).join(" ")
  return { id: data.sub, name: name || "LinkedIn member", vanity: name || data.sub }
}

/**
 * Posts API commentary uses "little text" format, where these characters are
 * reserved and must be backslash-escaped. Hashtags are turned into real
 * hashtag templates so they stay clickable.
 */
export function toLittleText(text: string): string {
  const escape = (s: string) => s.replace(/[\\|{}@[\]()<>#*_~]/g, (c) => `\\${c}`)
  const parts: string[] = []
  let last = 0
  for (const m of text.matchAll(/(^|\s)#([\p{L}\p{N}_]+)/gu)) {
    const start = m.index! + m[1].length
    parts.push(escape(text.slice(last, start)))
    parts.push(`{hashtag|\\#|${m[2]}}`)
    last = start + 1 + m[2].length
  }
  parts.push(escape(text.slice(last)))
  return parts.join("")
}

export async function createPost(opts: {
  accessToken: string
  personId: string
  text: string
}): Promise<{ id: string; url: string }> {
  const res = await fetch(POSTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.accessToken}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": apiVersion(),
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: `urn:li:person:${opts.personId}`,
      commentary: toLittleText(opts.text),
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  })
  if (!res.ok) {
    throw new Error(`LinkedIn post failed (${res.status}): ${await res.text()}`)
  }
  const urn = res.headers.get("x-restli-id") ?? ""
  return { id: urn, url: `https://www.linkedin.com/feed/update/${urn}/` }
}

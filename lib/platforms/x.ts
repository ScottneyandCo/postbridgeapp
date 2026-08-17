import { createHash, randomBytes } from "crypto"

// ---------------------------------------------------------------------------
// X (Twitter) OAuth 2.0 Authorization Code flow with PKCE + v2 posting.
// Docs: https://docs.x.com/resources/fundamentals/authentication/oauth-2-0
// ---------------------------------------------------------------------------

const AUTHORIZE_URL = "https://x.com/i/oauth2/authorize"
const TOKEN_URL = "https://api.x.com/2/oauth2/token"
const API_BASE = "https://api.x.com/2"

export const X_SCOPES = ["tweet.read", "tweet.write", "users.read", "offline.access"]

export function xConfigured(): boolean {
  return Boolean(process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET)
}

function clientId() {
  const id = process.env.X_CLIENT_ID
  if (!id) throw new Error("X_CLIENT_ID is not set")
  return id
}

function clientSecret() {
  const secret = process.env.X_CLIENT_SECRET
  if (!secret) throw new Error("X_CLIENT_SECRET is not set")
  return secret
}

/** Basic auth header for the confidential client token endpoint. */
function basicAuthHeader() {
  return "Basic " + Buffer.from(`${clientId()}:${clientSecret()}`).toString("base64")
}

function base64url(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

/** Generate a PKCE verifier + S256 challenge and a CSRF state token. */
export function createPkce() {
  const verifier = base64url(randomBytes(32))
  const challenge = base64url(createHash("sha256").update(verifier).digest())
  const state = base64url(randomBytes(16))
  return { verifier, challenge, state }
}

export function buildAuthorizeUrl(opts: {
  redirectUri: string
  state: string
  challenge: string
}) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId(),
    redirect_uri: opts.redirectUri,
    scope: X_SCOPES.join(" "),
    state: opts.state,
    code_challenge: opts.challenge,
    code_challenge_method: "S256",
  })
  return `${AUTHORIZE_URL}?${params.toString()}`
}

export type XTokens = {
  accessToken: string
  refreshToken: string | null
  expiresAt: Date
  scope: string
}

function parseTokenResponse(data: {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
}): XTokens {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    scope: data.scope,
  }
}

/** Exchange an authorization code for tokens. */
export async function exchangeCode(opts: {
  code: string
  redirectUri: string
  verifier: string
}): Promise<XTokens> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: opts.code,
      redirect_uri: opts.redirectUri,
      code_verifier: opts.verifier,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`X token exchange failed (${res.status}): ${text}`)
  }
  return parseTokenResponse(await res.json())
}

/**
 * Refresh an access token. X rotates refresh tokens on every use, so the
 * caller MUST persist the returned refreshToken atomically.
 */
export async function refreshTokens(refreshToken: string): Promise<XTokens> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`X token refresh failed (${res.status}): ${text}`)
  }
  return parseTokenResponse(await res.json())
}

export type XUser = { id: string; username: string; name: string }

export async function getMe(accessToken: string): Promise<XUser> {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`X users/me failed (${res.status}): ${text}`)
  }
  const { data } = await res.json()
  return { id: data.id, username: data.username, name: data.name }
}

export type PostedTweet = { id: string; url: string }

/** Publish a text tweet. Returns the tweet id + canonical URL. */
export async function postTweet(accessToken: string, text: string): Promise<PostedTweet> {
  const res = await fetch(`${API_BASE}/tweets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`X post failed (${res.status}): ${body}`)
  }
  const { data } = await res.json()
  return { id: data.id, url: `https://x.com/i/web/status/${data.id}` }
}

// ---------------------------------------------------------------------------
// Bluesky (AT Protocol) connection + posting via app passwords.
// Docs: https://docs.bsky.app/docs/get-started
//
// We never store the app password. It is exchanged once for a session; we keep
// the refreshJwt (long-lived) and accessJwt (short-lived) and refresh as needed.
// ---------------------------------------------------------------------------

const PUBLIC_API = "https://public.api.bsky.app/xrpc"
const PLC_DIRECTORY = "https://plc.directory"

export type BlueskySession = {
  did: string
  handle: string
  accessJwt: string
  refreshJwt: string
  accessExpiresAt: Date
}

export type BlueskyProfile = {
  displayName: string | null
  avatar: string | null
  followersCount: number
}

export class BlueskyError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message)
  }
}

function jwtExpiry(jwt: string): Date {
  try {
    const payload = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString("utf8"))
    if (typeof payload.exp === "number") return new Date(payload.exp * 1000)
  } catch {}
  return new Date(Date.now() + 60 * 60 * 1000)
}

async function xrpcError(res: Response, fallback: string): Promise<BlueskyError> {
  let code = "Unknown"
  let message = fallback
  try {
    const body = await res.json()
    code = body.error ?? code
    message = body.message ?? message
  } catch {}
  return new BlueskyError(`${fallback} (${res.status}): ${message}`, code)
}

export function normalizeIdentifier(input: string): string {
  const trimmed = input.trim().replace(/^@/, "").toLowerCase()
  if (trimmed.startsWith("did:")) return trimmed
  // Allow bare usernames like "alice" -> "alice.bsky.social"
  return trimmed.includes(".") ? trimmed : `${trimmed}.bsky.social`
}

export async function resolveHandle(handle: string): Promise<string> {
  if (handle.startsWith("did:")) return handle
  const res = await fetch(
    `${PUBLIC_API}/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`,
  )
  if (!res.ok) throw new BlueskyError("We couldn't find that Bluesky handle", "HandleNotFound")
  const { did } = await res.json()
  return did
}

/** Find the user's PDS (Personal Data Server) from their DID document. */
export async function resolvePds(did: string): Promise<string> {
  let docUrl: string
  if (did.startsWith("did:plc:")) docUrl = `${PLC_DIRECTORY}/${did}`
  else if (did.startsWith("did:web:")) docUrl = `https://${did.slice(8)}/.well-known/did.json`
  else throw new BlueskyError("Unsupported DID method", "UnsupportedDid")

  const res = await fetch(docUrl)
  if (!res.ok) throw new BlueskyError("Couldn't resolve Bluesky account server", "DidResolveFailed")
  const doc = await res.json()
  const service = (doc.service ?? []).find(
    (s: { id: string; type: string }) =>
      s.id === "#atproto_pds" || s.type === "AtprotoPersonalDataServer",
  )
  if (!service?.serviceEndpoint) {
    throw new BlueskyError("Bluesky account has no data server", "NoPds")
  }
  return String(service.serviceEndpoint).replace(/\/$/, "")
}

function toSession(data: {
  did: string
  handle: string
  accessJwt: string
  refreshJwt: string
}): BlueskySession {
  return {
    did: data.did,
    handle: data.handle,
    accessJwt: data.accessJwt,
    refreshJwt: data.refreshJwt,
    accessExpiresAt: jwtExpiry(data.accessJwt),
  }
}

/** Log in with a handle + app password. */
export async function createSession(identifier: string, appPassword: string) {
  const handle = normalizeIdentifier(identifier)
  const did = await resolveHandle(handle)
  const pds = await resolvePds(did)

  const res = await fetch(`${pds}/xrpc/com.atproto.server.createSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: did, password: appPassword.trim() }),
  })
  if (!res.ok) {
    const err = await xrpcError(res, "Bluesky sign-in failed")
    if (res.status === 401) {
      throw new BlueskyError("Handle or app password is incorrect", "AuthenticationRequired")
    }
    throw err
  }
  return toSession(await res.json())
}

/** Exchange a refreshJwt for a fresh session. Bluesky rotates the refreshJwt. */
export async function refreshSession(did: string, refreshJwt: string) {
  const pds = await resolvePds(did)
  const res = await fetch(`${pds}/xrpc/com.atproto.server.refreshSession`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refreshJwt}` },
  })
  if (!res.ok) throw await xrpcError(res, "Bluesky session refresh failed")
  return toSession(await res.json())
}

export async function getProfile(did: string): Promise<BlueskyProfile> {
  const res = await fetch(
    `${PUBLIC_API}/app.bsky.actor.getProfile?actor=${encodeURIComponent(did)}`,
  )
  if (!res.ok) return { displayName: null, avatar: null, followersCount: 0 }
  const data = await res.json()
  return {
    displayName: data.displayName || null,
    avatar: data.avatar ?? null,
    followersCount: data.followersCount ?? 0,
  }
}

type Facet = {
  index: { byteStart: number; byteEnd: number }
  features: Array<
    | { $type: "app.bsky.richtext.facet#link"; uri: string }
    | { $type: "app.bsky.richtext.facet#tag"; tag: string }
  >
}

/** Make links and hashtags clickable. Bluesky facets use UTF-8 byte offsets. */
export function detectFacets(text: string): Facet[] {
  const encoder = new TextEncoder()
  const byteOffset = (charIndex: number) => encoder.encode(text.slice(0, charIndex)).length
  const facets: Facet[] = []

  for (const match of text.matchAll(/https?:\/\/[^\s]+/g)) {
    const uri = match[0].replace(/[.,;:!?)\]]+$/, "")
    const start = match.index!
    facets.push({
      index: { byteStart: byteOffset(start), byteEnd: byteOffset(start + uri.length) },
      features: [{ $type: "app.bsky.richtext.facet#link", uri }],
    })
  }

  for (const match of text.matchAll(/(^|\s)#([\p{L}\p{N}_]+)/gu)) {
    const start = match.index! + match[1].length
    const end = start + 1 + match[2].length
    facets.push({
      index: { byteStart: byteOffset(start), byteEnd: byteOffset(end) },
      features: [{ $type: "app.bsky.richtext.facet#tag", tag: match[2] }],
    })
  }

  return facets
}

export type PostedSkeet = { id: string; url: string }

export async function createPost(opts: {
  did: string
  handle: string
  accessJwt: string
  text: string
}): Promise<PostedSkeet> {
  const pds = await resolvePds(opts.did)
  const facets = detectFacets(opts.text)
  const res = await fetch(`${pds}/xrpc/com.atproto.repo.createRecord`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.accessJwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      repo: opts.did,
      collection: "app.bsky.feed.post",
      record: {
        $type: "app.bsky.feed.post",
        text: opts.text,
        createdAt: new Date().toISOString(),
        ...(facets.length ? { facets } : {}),
      },
    }),
  })
  if (!res.ok) throw await xrpcError(res, "Bluesky post failed")
  const { uri } = (await res.json()) as { uri: string }
  const rkey = uri.split("/").pop()!
  return { id: uri, url: `https://bsky.app/profile/${opts.handle}/post/${rkey}` }
}

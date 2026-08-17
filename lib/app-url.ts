/**
 * Resolve the app's public base URL for building OAuth redirect URIs, etc.
 * Prefers an explicit APP_URL, then Vercel-provided hosts, then the v0 preview.
 */
export function getAppUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "")
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (process.env.V0_RUNTIME_URL) return process.env.V0_RUNTIME_URL.replace(/\/$/, "")
  return "http://localhost:3000"
}

/**
 * Build the absolute origin from an incoming request. OAuth callbacks must use
 * the exact origin the user authorized on, so prefer this in route handlers.
 */
export function originFromRequest(req: Request): string {
  const url = new URL(req.url)
  const forwardedHost = req.headers.get("x-forwarded-host")
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? "https"
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`
  return url.origin
}

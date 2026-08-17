import { betterAuth } from "better-auth"
import { Pool } from "pg"

function resolveBaseURL() {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return process.env.V0_RUNTIME_URL
}

function resolveTrustedOrigins() {
  const origins: string[] = []
  if (process.env.NODE_ENV === "development") {
    if (process.env.V0_RUNTIME_URL) origins.push(process.env.V0_RUNTIME_URL)
    // The v0 preview renders the app in a cross-site iframe served from a
    // per-session *.vercel.run origin that isn't always exposed via env.
    // Trust the wildcard preview host (and localhost) in development only.
    origins.push("https://*.vercel.run")
    origins.push("http://localhost:3000")
  } else {
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
      origins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    if (process.env.VERCEL_URL) origins.push(`https://${process.env.VERCEL_URL}`)
  }
  return origins
}

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  baseURL: resolveBaseURL(),
  trustedOrigins: resolveTrustedOrigins(),
  emailAndPassword: {
    enabled: true,
  },
  ...(process.env.NODE_ENV === "development"
    ? {
        advanced: {
          // Required by the cross-site v0 preview iframe. Without these
          // attributes, login succeeds but the next request appears signed out.
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
})

"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { socialAccounts } from "@/lib/db/schema"
import { and, asc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { BlueskyError, createSession, getProfile } from "@/lib/platforms/bluesky"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function getAccounts() {
  const userId = await getUserId()
  return db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.userId, userId))
    .orderBy(asc(socialAccounts.createdAt))
}

export async function connectAccount(input: {
  platform: string
  handle: string
  displayName?: string
}) {
  const userId = await getUserId()
  // Real OAuth per network is a later pass; here we persist a linked account
  // record scoped to the signed-in user.
  const [row] = await db
    .insert(socialAccounts)
    .values({
      userId,
      platform: input.platform,
      handle: input.handle.replace(/^@/, ""),
      displayName: input.displayName ?? null,
      followers: 0,
      connected: true,
    })
    .returning()
  revalidatePath("/dashboard/accounts")
  return row.id
}

export type ConnectBlueskyResult = { ok: true; handle: string } | { ok: false; error: string }

export async function connectBluesky(input: {
  identifier: string
  appPassword: string
}): Promise<ConnectBlueskyResult> {
  const userId = await getUserId()
  const identifier = input.identifier?.trim() ?? ""
  const appPassword = input.appPassword?.trim() ?? ""
  if (!identifier || identifier.length > 253) return { ok: false, error: "Enter your Bluesky handle" }
  if (!appPassword || appPassword.length > 64) return { ok: false, error: "Enter an app password" }

  try {
    const session = await createSession(identifier, appPassword)
    const profile = await getProfile(session.did)

    const values = {
      userId,
      platform: "bluesky",
      handle: session.handle,
      displayName: profile.displayName,
      avatarUrl: profile.avatar,
      followers: profile.followersCount,
      platformUserId: session.did,
      accessToken: session.accessJwt,
      refreshToken: session.refreshJwt,
      tokenExpiresAt: session.accessExpiresAt,
      scope: "app-password",
      isReal: true,
      connected: true,
    }

    // Replace any demo Bluesky link and keep one real Bluesky account per user.
    await db
      .delete(socialAccounts)
      .where(
        and(
          eq(socialAccounts.userId, userId),
          eq(socialAccounts.platform, "bluesky"),
          eq(socialAccounts.isReal, false),
        ),
      )
    const [existing] = await db
      .select({ id: socialAccounts.id })
      .from(socialAccounts)
      .where(
        and(
          eq(socialAccounts.userId, userId),
          eq(socialAccounts.platform, "bluesky"),
          eq(socialAccounts.isReal, true),
        ),
      )
      .limit(1)

    if (existing) {
      await db.update(socialAccounts).set(values).where(eq(socialAccounts.id, existing.id))
    } else {
      await db.insert(socialAccounts).values(values)
    }

    revalidatePath("/dashboard/accounts")
    return { ok: true, handle: session.handle }
  } catch (err) {
    if (err instanceof BlueskyError) return { ok: false, error: err.message }
    console.log("[v0] Bluesky connect error:", err)
    return { ok: false, error: "Couldn't reach Bluesky. Try again in a moment." }
  }
}

export async function disconnectAccount(id: number) {
  const userId = await getUserId()
  await db
    .delete(socialAccounts)
    .where(and(eq(socialAccounts.id, id), eq(socialAccounts.userId, userId)))
  revalidatePath("/dashboard/accounts")
}

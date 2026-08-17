"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { socialAccounts } from "@/lib/db/schema"
import { and, asc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

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

export async function disconnectAccount(id: number) {
  const userId = await getUserId()
  await db
    .delete(socialAccounts)
    .where(and(eq(socialAccounts.id, id), eq(socialAccounts.userId, userId)))
  revalidatePath("/dashboard/accounts")
}

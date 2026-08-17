"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { posts, postTargets } from "@/lib/db/schema"
import { and, desc, eq, inArray } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { publishPost } from "@/lib/publish"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export type NewVariant = {
  platform: string
  caption: string
  hashtags: string
}

export async function createPost(input: {
  idea: string
  status?: "draft" | "scheduled"
  scheduledAt?: string | null
  variants: NewVariant[]
}) {
  const userId = await getUserId()

  const [post] = await db
    .insert(posts)
    .values({
      userId,
      idea: input.idea,
      status: input.status ?? "draft",
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
    })
    .returning()

  if (input.variants.length > 0) {
    await db.insert(postTargets).values(
      input.variants.map((v) => ({
        postId: post.id,
        userId,
        platform: v.platform,
        caption: v.caption,
        hashtags: v.hashtags,
      })),
    )
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/calendar")
  return post.id
}

export async function getPosts() {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(posts)
    .where(eq(posts.userId, userId))
    .orderBy(desc(posts.createdAt))

  if (rows.length === 0) return []

  const targets = await db
    .select()
    .from(postTargets)
    .where(
      and(
        eq(postTargets.userId, userId),
        inArray(
          postTargets.postId,
          rows.map((r) => r.id),
        ),
      ),
    )

  return rows.map((post) => ({
    ...post,
    targets: targets.filter((t) => t.postId === post.id),
  }))
}

export async function publishPostNow(id: number) {
  const userId = await getUserId()
  const results = await publishPost(id, userId)
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/calendar")
  return results
}

export async function deletePost(id: number) {
  const userId = await getUserId()
  await db.delete(postTargets).where(and(eq(postTargets.postId, id), eq(postTargets.userId, userId)))
  await db.delete(posts).where(and(eq(posts.id, id), eq(posts.userId, userId)))
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/calendar")
}

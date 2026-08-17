import { NextResponse } from "next/server"
import { and, eq, lte } from "drizzle-orm"
import { db } from "@/lib/db"
import { posts } from "@/lib/db/schema"
import { publishPost } from "@/lib/publish"

// Scheduled posts can take a moment to fan out across platforms.
export const maxDuration = 60

/**
 * Publishes any scheduled post whose time has arrived. Invoked by Vercel Cron
 * (see vercel.json). Protected by CRON_SECRET: Vercel sends it as a Bearer
 * token, and we also accept ?secret= for manual triggering.
 */
async function handle(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get("authorization")
    const url = new URL(req.url)
    const provided = auth === `Bearer ${secret}` || url.searchParams.get("secret") === secret
    if (!provided) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }
  }

  const now = new Date()
  const due = await db
    .select()
    .from(posts)
    .where(and(eq(posts.status, "scheduled"), lte(posts.scheduledAt, now)))
    .limit(50)

  let publishedPosts = 0
  const details: Array<{ postId: number; results: unknown }> = []

  for (const post of due) {
    try {
      const results = await publishPost(post.id, post.userId)
      publishedPosts++
      details.push({ postId: post.id, results })
    } catch (err) {
      console.log("[v0] cron publish error for post", post.id, err)
    }
  }

  return NextResponse.json({ ok: true, checked: due.length, published: publishedPosts, details })
}

export async function GET(req: Request) {
  return handle(req)
}

// Vercel Cron issues GET, but allow POST for manual/webhook triggering too.
export async function POST(req: Request) {
  return handle(req)
}

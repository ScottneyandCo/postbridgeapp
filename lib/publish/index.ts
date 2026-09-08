import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { posts, postTargets, socialAccounts } from "@/lib/db/schema"
import type { PostTarget, SocialAccount } from "@/lib/db/schema"
import { postTweet, refreshTokens, uploadMedia } from "@/lib/platforms/x"
import { parseMedia, isVideo, type MediaItem } from "@/lib/media"

/** Platforms that currently support real publishing. */
export const PUBLISHABLE_PLATFORMS = ["x"] as const

/** Combine a target's caption + hashtags into the text to publish. */
export function composeText(target: Pick<PostTarget, "caption" | "hashtags">): string {
  const caption = target.caption?.trim() ?? ""
  const tags = target.hashtags?.trim() ?? ""
  return tags ? `${caption}\n\n${tags}`.trim() : caption
}

/**
 * Return a valid X access token for the account, refreshing (and persisting the
 * rotated refresh token) when the current one is expired or about to expire.
 */
async function getValidXToken(account: SocialAccount): Promise<string> {
  const expiresSoon =
    !account.tokenExpiresAt || account.tokenExpiresAt.getTime() - Date.now() < 60_000

  if (!expiresSoon && account.accessToken) return account.accessToken

  if (!account.refreshToken) {
    throw new Error("X account has no refresh token; reconnect required")
  }

  const tokens = await refreshTokens(account.refreshToken)
  // X rotates the refresh token on every use — persist both atomically.
  await db
    .update(socialAccounts)
    .set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? account.refreshToken,
      tokenExpiresAt: tokens.expiresAt,
      scope: tokens.scope,
    })
    .where(eq(socialAccounts.id, account.id))

  return tokens.accessToken
}

type PublishResult = {
  targetId: number
  platform: string
  status: "published" | "failed" | "skipped"
  externalUrl?: string
  error?: string
}

/**
 * Publish every target of a post to any platform the user has really connected.
 * Updates each target's status and rolls the post status up to
 * published / partial / failed. Idempotent: already-published targets skip.
 */
/**
 * Attach a post's media to X: upload up to 4 images, or a single video.
 * Best-effort — on failure returns [] so the post still publishes as text.
 */
async function uploadXMedia(accessToken: string, media: MediaItem[]): Promise<string[]> {
  if (media.length === 0) return []
  const video = media.find(isVideo)
  const toUpload = video ? [video] : media.filter((m) => !isVideo(m)).slice(0, 4)
  const ids: string[] = []
  for (const item of toUpload) {
    try {
      ids.push(await uploadMedia(accessToken, item.url, item.contentType))
    } catch (err) {
      console.log("[v0] X media upload failed:", err instanceof Error ? err.message : err)
    }
  }
  return ids
}

export async function publishPost(postId: number, userId: string): Promise<PublishResult[]> {
  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.userId, userId)))
  const media = parseMedia(post?.media)

  const targets = await db
    .select()
    .from(postTargets)
    .where(and(eq(postTargets.postId, postId), eq(postTargets.userId, userId)))

  const accounts = await db
    .select()
    .from(socialAccounts)
    .where(and(eq(socialAccounts.userId, userId), eq(socialAccounts.isReal, true)))

  const realByPlatform = new Map(accounts.map((a) => [a.platform, a]))
  const results: PublishResult[] = []

  for (const target of targets) {
    if (target.status === "published") {
      results.push({
        targetId: target.id,
        platform: target.platform,
        status: "published",
        externalUrl: target.externalUrl ?? undefined,
      })
      continue
    }

    const supported = (PUBLISHABLE_PLATFORMS as readonly string[]).includes(target.platform)
    const account = realByPlatform.get(target.platform)

    if (!supported || !account) {
      // No real connection for this platform yet — leave it queued, don't fail.
      await db
        .update(postTargets)
        .set({ status: "skipped", error: !supported ? "platform_unsupported" : "not_connected" })
        .where(eq(postTargets.id, target.id))
      results.push({ targetId: target.id, platform: target.platform, status: "skipped" })
      continue
    }

    try {
      const accessToken = await getValidXToken(account)
      const mediaIds = target.platform === "x" ? await uploadXMedia(accessToken, media) : []
      const tweet = await postTweet(accessToken, composeText(target), mediaIds)
      await db
        .update(postTargets)
        .set({
          status: "published",
          externalId: tweet.id,
          externalUrl: tweet.url,
          publishedAt: new Date(),
          error: null,
        })
        .where(eq(postTargets.id, target.id))
      results.push({
        targetId: target.id,
        platform: target.platform,
        status: "published",
        externalUrl: tweet.url,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown error"
      console.log("[v0] publish target failed:", target.platform, message)
      await db
        .update(postTargets)
        .set({ status: "failed", error: message.slice(0, 500) })
        .where(eq(postTargets.id, target.id))
      results.push({
        targetId: target.id,
        platform: target.platform,
        status: "failed",
        error: message,
      })
    }
  }

  // Roll up post status from its targets.
  const published = results.filter((r) => r.status === "published").length
  const failed = results.filter((r) => r.status === "failed").length
  let postStatus = "scheduled"
  if (published > 0 && failed === 0) postStatus = "published"
  else if (published > 0 && failed > 0) postStatus = "partial"
  else if (failed > 0) postStatus = "failed"

  await db
    .update(posts)
    .set({ status: postStatus, updatedAt: new Date() })
    .where(and(eq(posts.id, postId), eq(posts.userId, userId)))

  return results
}

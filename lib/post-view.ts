import type { PlatformId } from "./platforms"
import type { ScheduledPost, PostStatus } from "./mock-data"
import { POSTS } from "./mock-data"

type DbTarget = { platform: string; caption: string }
type DbPost = {
  id: number
  idea: string
  status: string
  scheduledAt: Date | string | null
  createdAt: Date | string
  targets: DbTarget[]
}

/**
 * Map a persisted post (post + its per-platform targets) into the
 * ScheduledPost shape the queue and calendar UIs render.
 */
export function toScheduledPost(post: DbPost): ScheduledPost {
  const when = post.scheduledAt ?? post.createdAt
  const firstCaption = post.targets[0]?.caption?.trim()
  return {
    id: `db-${post.id}`,
    content: firstCaption || post.idea,
    platforms: post.targets.map((t) => t.platform as PlatformId),
    status: post.status as PostStatus,
    scheduledAt: new Date(when).toISOString(),
  }
}

/**
 * Return the user's posts as view models. New accounts with no posts yet
 * fall back to demo content so the dashboard and calendar aren't empty.
 */
export function toViewPosts(posts: DbPost[]): ScheduledPost[] {
  if (posts.length === 0) return POSTS
  return posts.map(toScheduledPost)
}

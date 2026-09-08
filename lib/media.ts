// ---------------------------------------------------------------------------
// Media attached to a post. Stored as a JSON string on posts.media and shared
// across every platform variant of that post.
// ---------------------------------------------------------------------------

export type MediaItem = {
  url: string
  pathname: string
  contentType: string
  name: string
  size: number
}

export const MAX_MEDIA_ITEMS = 4
export const MAX_MEDIA_BYTES = 25 * 1024 * 1024 // 25 MB
export const ACCEPTED_MEDIA_TYPES = ["image/", "video/"]

export function isAcceptedMediaType(contentType: string): boolean {
  return ACCEPTED_MEDIA_TYPES.some((prefix) => contentType.startsWith(prefix))
}

export function isVideo(item: Pick<MediaItem, "contentType">): boolean {
  return item.contentType.startsWith("video/")
}

/** Safely parse the posts.media column into a MediaItem[]. Never throws. */
export function parseMedia(raw: string | null | undefined): MediaItem[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (m): m is MediaItem =>
        m && typeof m.url === "string" && typeof m.contentType === "string",
    )
  } catch {
    return []
  }
}

/** Serialize a MediaItem[] for storage. Returns null when empty. */
export function serializeMedia(items: MediaItem[]): string | null {
  return items.length ? JSON.stringify(items) : null
}

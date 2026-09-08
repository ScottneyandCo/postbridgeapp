"use client"

import { useRef, useState } from "react"
import { ImagePlus, Loader2, X, Film } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  isAcceptedMediaType,
  isVideo,
  MAX_MEDIA_BYTES,
  MAX_MEDIA_ITEMS,
  type MediaItem,
} from "@/lib/media"

export function MediaUploader({
  media,
  onChange,
}: {
  media: MediaItem[]
  onChange: (media: MediaItem[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const atLimit = media.length >= MAX_MEDIA_ITEMS

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)

    const remaining = MAX_MEDIA_ITEMS - media.length
    const chosen = Array.from(files).slice(0, remaining)
    const rejected = chosen.filter(
      (f) => !isAcceptedMediaType(f.type) || f.size > MAX_MEDIA_BYTES,
    )
    if (rejected.length) {
      setError("Some files were skipped (images/videos only, max 25 MB each).")
    }
    const valid = chosen.filter((f) => isAcceptedMediaType(f.type) && f.size <= MAX_MEDIA_BYTES)
    if (valid.length === 0) return

    setUploading(true)
    try {
      const uploaded: MediaItem[] = []
      for (const file of valid) {
        const body = new FormData()
        body.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data.error ?? "Upload failed. Please try again.")
          continue
        }
        uploaded.push((await res.json()) as MediaItem)
      }
      if (uploaded.length) onChange([...media, ...uploaded])
    } catch (err) {
      console.log("[v0] media upload error:", err)
      setError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  async function removeItem(item: MediaItem) {
    onChange(media.filter((m) => m.url !== item.url))
    // Best-effort cleanup of the blob; ignore failures.
    fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: item.url }),
    }).catch(() => {})
  }

  return (
    <div className="space-y-2">
      {media.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {media.map((item) => (
            <div
              key={item.url}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              {isVideo(item) ? (
                <div className="flex size-full items-center justify-center bg-secondary">
                  <Film className="size-5 text-muted-foreground" />
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video src={item.url} className="absolute inset-0 size-full object-cover opacity-80" muted />
                </div>
              ) : (
                <img
                  src={item.url || "/placeholder.svg"}
                  alt={item.name}
                  className="size-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                aria-label={`Remove ${item.name}`}
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || atLimit}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-50",
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <ImagePlus className="size-4" />
            {atLimit ? `Max ${MAX_MEDIA_ITEMS} files` : "Add image or video"}
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

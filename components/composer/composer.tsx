"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Loader2, CalendarClock, Send, Check, Zap, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { PlatformSelector } from "./platform-selector"
import { VariantCard, type VariantState } from "./variant-card"
import { MediaUploader } from "./media-uploader"
import { type PlatformId } from "@/lib/platforms"
import { createPost, publishPostNow } from "@/app/actions/posts"
import { type MediaItem } from "@/lib/media"

const TONES = ["Punchy", "Professional", "Casual", "Bold", "Educational", "Funny"] as const
type Tone = (typeof TONES)[number]

const INITIAL_SELECTED: PlatformId[] = ["x", "instagram", "linkedin", "tiktok"]

function variantPayload(variants: VariantState[]) {
  return variants.map((v) => ({
    platform: v.platform,
    caption: v.caption,
    hashtags: Array.isArray(v.hashtags) ? v.hashtags.join(" ") : (v.hashtags ?? ""),
  }))
}

export function Composer() {
  const router = useRouter()
  const [idea, setIdea] = useState("")
  const [media, setMedia] = useState<MediaItem[]>([])
  const [selected, setSelected] = useState<PlatformId[]>(INITIAL_SELECTED)
  const [tone, setTone] = useState<Tone>("Punchy")
  const [loading, setLoading] = useState(false)
  const [variants, setVariants] = useState<VariantState[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<"draft" | "schedule" | "publish" | null>(null)
  const [saved, setSaved] = useState(false)
  const [publishSummary, setPublishSummary] = useState<string | null>(null)

  async function savePost(status: "draft" | "scheduled") {
    if (variants.length === 0) return
    setSaving(status === "draft" ? "draft" : "schedule")
    setError(null)
    setPublishSummary(null)
    try {
      await createPost({
        idea,
        status,
        // Demo scheduling: queue the post for tomorrow morning.
        scheduledAt:
          status === "scheduled"
            ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            : null,
        variants: variantPayload(variants),
        media,
      })
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.log("[v0] save post error:", err)
      setError("Could not save this post. Please try again.")
    } finally {
      setSaving(null)
    }
  }

  async function publishNow() {
    if (variants.length === 0) return
    setSaving("publish")
    setError(null)
    setPublishSummary(null)
    try {
      const postId = await createPost({
        idea,
        status: "scheduled",
        scheduledAt: null,
        variants: variantPayload(variants),
        media,
      })
      const results = await publishPostNow(postId)
      const published = results.filter((r) => r.status === "published")
      const failed = results.filter((r) => r.status === "failed")
      const skipped = results.filter((r) => r.status === "skipped")

      const parts: string[] = []
      if (published.length) {
        parts.push(`Published to ${published.map((r) => r.platform.toUpperCase()).join(", ")}`)
      }
      if (failed.length) parts.push(`${failed.length} failed`)
      if (skipped.length) {
        parts.push(`${skipped.length} queued (connect those platforms to publish live)`)
      }
      setPublishSummary(parts.join(" · ") || "Post saved to your queue.")
      router.refresh()
    } catch (err) {
      console.log("[v0] publish now error:", err)
      setError("Could not publish this post. Please try again.")
    } finally {
      setSaving(null)
    }
  }

  function togglePlatform(id: PlatformId) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  async function requestVariants(platforms: PlatformId[]): Promise<VariantState[]> {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea, platforms, tone }),
    })
    if (!res.ok) throw new Error("Generation failed")
    const data = await res.json()
    return (data.variants ?? []) as VariantState[]
  }

  async function handleGenerate() {
    if (!idea.trim() || selected.length === 0) return
    setLoading(true)
    setError(null)
    try {
      setVariants(await requestVariants(selected))
    } catch (err) {
      console.log("[v0] generate error:", err)
      setError("Something went wrong generating variants. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function updateCaption(platform: PlatformId, caption: string) {
    setVariants((prev) => prev.map((v) => (v.platform === platform ? { ...v, caption } : v)))
  }

  async function regenerateOne(platform: PlatformId) {
    setVariants((prev) => prev.map((v) => (v.platform === platform ? { ...v, loading: true } : v)))
    try {
      const [fresh] = await requestVariants([platform])
      if (fresh) {
        setVariants((prev) => prev.map((v) => (v.platform === platform ? fresh : v)))
      }
    } catch (err) {
      console.log("[v0] regenerate error:", err)
      setVariants((prev) =>
        prev.map((v) => (v.platform === platform ? { ...v, loading: false } : v)),
      )
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* Input panel */}
      <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="idea" className="text-sm font-medium">
                Your idea
              </Label>
              <Textarea
                id="idea"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Paste a rough draft, a link, or just an idea. e.g. 'Why most creators quit in month 3 and how to push through.'"
                className="min-h-32 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Platforms</Label>
              <PlatformSelector selected={selected} onToggle={togglePlatform} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Media</Label>
              <MediaUploader media={media} onChange={setMedia} />
              <p className="text-xs text-muted-foreground">
                Optional. Attached to every platform variant.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Tone</Label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      tone === t
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !idea.trim() || selected.length === 0}
              className="w-full gap-2"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating variants...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Generate {selected.length} variant{selected.length === 1 ? "" : "s"}
                </>
              )}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-center text-xs text-muted-foreground">
              Uses 1 AI credit per platform variant
            </p>
          </div>
        </div>
      </div>

      {/* Output panel */}
      <div className="space-y-4">
        {variants.length === 0 && !loading && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed bg-card/40 p-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Sparkles className="size-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Platform-perfect variants appear here</h3>
            <p className="mt-1 max-w-sm text-pretty text-sm text-muted-foreground">
              Write one idea, pick your platforms, and let the AI engine tailor the hook, caption,
              and hashtags for each network.
            </p>
          </div>
        )}

        {loading && (
          <div className="grid gap-4">
            {selected.map((p) => (
              <div key={p} className="animate-pulse rounded-2xl border bg-card p-5">
                <div className="mb-4 h-5 w-32 rounded bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-5/6 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        )}

        {variants.length > 0 && !loading && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
              <div className="min-w-0 text-sm text-muted-foreground">
                {publishSummary ? (
                  <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                    <Zap className="size-4 text-primary" />
                    {publishSummary}
                  </span>
                ) : saved ? (
                  <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                    <Check className="size-4 text-primary" />
                    Saved to your queue.
                  </span>
                ) : error ? (
                  <span className="inline-flex items-center gap-1.5 font-medium text-destructive">
                    <AlertTriangle className="size-4" />
                    {error}
                  </span>
                ) : (
                  <>
                    <span className="font-semibold text-foreground">{variants.length}</span>{" "}
                    variants ready. Edit anything inline, then publish.
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  disabled={saving !== null}
                  onClick={() => savePost("draft")}
                >
                  {saving === "draft" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CalendarClock className="size-4" />
                  )}
                  Save draft
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  disabled={saving !== null}
                  onClick={() => savePost("scheduled")}
                >
                  {saving === "schedule" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CalendarClock className="size-4" />
                  )}
                  Schedule all
                </Button>
                <Button
                  size="sm"
                  className="gap-2"
                  disabled={saving !== null}
                  onClick={publishNow}
                >
                  {saving === "publish" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  Post now
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              {variants.map((v) => (
                <VariantCard
                  key={v.platform}
                  variant={v}
                  media={media}
                  onChange={(caption) => updateCaption(v.platform, caption)}
                  onRegenerate={() => regenerateOne(v.platform)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

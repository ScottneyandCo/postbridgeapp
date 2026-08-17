import { generateText, Output } from 'ai'
import { z } from 'zod'
import { PLATFORMS, type PlatformId } from '@/lib/platforms'

export const maxDuration = 30

const RequestSchema = z.object({
  idea: z.string().min(1).max(2000),
  platforms: z.array(z.string()).min(1).max(9),
  tone: z.string().optional(),
})

const VariantSchema = z.object({
  caption: z.string(),
  hashtags: z.array(z.string()),
})

type Variant = { platform: PlatformId; caption: string; hashtags: string[] }

async function generateForPlatform(
  platformId: PlatformId,
  idea: string,
  tone: string | undefined,
): Promise<Variant> {
  const p = PLATFORMS[platformId]
  const toneLine = tone ? `Overall tone requested by the user: ${tone}.` : ''

  const { output } = await generateText({
    model: 'openai/gpt-5-mini',
    output: Output.object({ schema: VariantSchema }),
    system:
      'You are an expert social media copywriter who writes native-feeling posts for each platform. ' +
      'You never invent facts. You keep the meaning of the idea intact while adapting voice, length and format.',
    prompt: `Rewrite this idea as a post for ${p.name}.

Idea: """${idea}"""

Platform voice: ${p.voice}.
Hard character limit for the caption: ${p.charLimit} characters. Stay well under it.
${toneLine}

Return a compelling caption tailored to ${p.name} and up to 6 relevant hashtags (without the # symbol). If the platform is not hashtag-driven (e.g. LinkedIn), return 0-2 hashtags.`,
  })

  return {
    platform: platformId,
    caption: output.caption.trim(),
    hashtags: output.hashtags.slice(0, 6),
  }
}

/** Deterministic fallback so the composer still works without a model key. */
function fallbackVariant(platformId: PlatformId, idea: string): Variant {
  const p = PLATFORMS[platformId]
  const trimmed = idea.trim().replace(/\s+/g, ' ')
  const caption =
    p.id === 'x' || p.id === 'bluesky'
      ? trimmed.slice(0, p.charLimit)
      : `${trimmed}\n\nWhat do you think? Drop a comment below.`
  return {
    platform: platformId,
    caption: caption.slice(0, p.charLimit),
    hashtags: ['content', 'creator', 'howto'],
  }
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { idea, platforms, tone } = parsed.data
  const ids = platforms.filter((p): p is PlatformId => p in PLATFORMS)

  try {
    const variants = await Promise.all(
      ids.map((id) => generateForPlatform(id, idea, tone)),
    )
    return Response.json({ variants })
  } catch (err) {
    console.log('[v0] generation error, using fallback:', (err as Error).message)
    const variants = ids.map((id) => fallbackVariant(id, idea))
    return Response.json({ variants, fallback: true })
  }
}

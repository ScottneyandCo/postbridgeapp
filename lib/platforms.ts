export type PlatformId =
  | 'tiktok'
  | 'instagram'
  | 'x'
  | 'youtube'
  | 'linkedin'
  | 'facebook'
  | 'pinterest'
  | 'bluesky'
  | 'threads'

export type Platform = {
  id: PlatformId
  name: string
  short: string
  color: string
  charLimit: number
  /** How the AI should tune content for this platform */
  voice: string
}

export const PLATFORMS: Record<PlatformId, Platform> = {
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    short: 'TT',
    color: '#fe2c55',
    charLimit: 2200,
    voice: 'trend-aware, punchy hook in the first line, casual and high-energy',
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    short: 'IG',
    color: '#d62976',
    charLimit: 2200,
    voice: 'aesthetic and aspirational, emoji-friendly, strong CTA and hashtags',
  },
  x: {
    id: 'x',
    name: 'X',
    short: 'X',
    color: '#111114',
    charLimit: 280,
    voice: 'concise, opinionated, hook-driven, thread-ready',
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    short: 'YT',
    color: '#ff0033',
    charLimit: 5000,
    voice: 'SEO-rich description, keywords, chapters and CTA to subscribe',
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    short: 'in',
    color: '#0a66c2',
    charLimit: 3000,
    voice: 'professional, insight-led, story then takeaway, minimal hashtags',
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    short: 'fb',
    color: '#1877f2',
    charLimit: 63206,
    voice: 'friendly and community-oriented, conversational, question to drive comments',
  },
  pinterest: {
    id: 'pinterest',
    name: 'Pinterest',
    short: 'P',
    color: '#e60023',
    charLimit: 500,
    voice: 'keyword-rich, descriptive, inspirational and searchable',
  },
  bluesky: {
    id: 'bluesky',
    name: 'Bluesky',
    short: 'bs',
    color: '#1185fe',
    charLimit: 300,
    voice: 'authentic, community-first, concise and conversational',
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    short: 'th',
    color: '#3b3b40',
    charLimit: 500,
    voice: 'casual, witty, conversation-starting, lightly emoji-friendly',
  },
}

export const PLATFORM_LIST = Object.values(PLATFORMS)

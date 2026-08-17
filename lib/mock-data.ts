import type { PlatformId } from './platforms'

export type Account = {
  id: string
  platform: PlatformId
  handle: string
  displayName: string
  followers: number
  connected: boolean
}

export type PostStatus = 'scheduled' | 'published' | 'draft' | 'failed' | 'partial'

export type ScheduledPost = {
  id: string
  content: string
  platforms: PlatformId[]
  status: PostStatus
  scheduledAt: string // ISO
  engagement?: number
}

export const ACCOUNTS: Account[] = [
  { id: 'a1', platform: 'tiktok', handle: '@maya.builds', displayName: 'Maya Builds', followers: 48200, connected: true },
  { id: 'a2', platform: 'instagram', handle: '@mayabuilds', displayName: 'Maya Builds', followers: 31900, connected: true },
  { id: 'a3', platform: 'x', handle: '@mayabuilds', displayName: 'Maya', followers: 12400, connected: true },
  { id: 'a4', platform: 'youtube', handle: 'Maya Builds', displayName: 'Maya Builds', followers: 89100, connected: true },
  { id: 'a5', platform: 'linkedin', handle: 'Maya Chen', displayName: 'Maya Chen', followers: 6800, connected: true },
  { id: 'a6', platform: 'threads', handle: '@mayabuilds', displayName: 'Maya Builds', followers: 4200, connected: true },
  { id: 'a7', platform: 'bluesky', handle: '@maya.bsky.social', displayName: 'Maya', followers: 1900, connected: false },
  { id: 'a8', platform: 'pinterest', handle: 'Maya Builds', displayName: 'Maya Builds', followers: 0, connected: false },
  { id: 'a9', platform: 'facebook', handle: 'Maya Builds', displayName: 'Maya Builds', followers: 0, connected: false },
]

function iso(daysFromNow: number, hour: number, minute = 0) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export const POSTS: ScheduledPost[] = [
  {
    id: 'p1',
    content: '3 tools I use to edit videos 10x faster (number 2 is free) 🎬',
    platforms: ['tiktok', 'instagram', 'youtube'],
    status: 'scheduled',
    scheduledAt: iso(0, 17, 30),
  },
  {
    id: 'p2',
    content: 'The one habit that doubled my output this quarter: shipping ugly first drafts.',
    platforms: ['x', 'linkedin', 'threads'],
    status: 'scheduled',
    scheduledAt: iso(1, 9, 0),
  },
  {
    id: 'p3',
    content: 'Behind the scenes of building my studio setup on a $500 budget.',
    platforms: ['instagram', 'tiktok'],
    status: 'scheduled',
    scheduledAt: iso(2, 12, 0),
  },
  {
    id: 'p4',
    content: 'Why most creators quit at month 4 — and the mindset shift that fixes it.',
    platforms: ['linkedin', 'x'],
    status: 'scheduled',
    scheduledAt: iso(3, 8, 30),
  },
  {
    id: 'p5',
    content: 'New drop: my free 30-day content calendar template. Link below.',
    platforms: ['instagram', 'threads', 'facebook'],
    status: 'draft',
    scheduledAt: iso(4, 15, 0),
  },
  {
    id: 'p6',
    content: 'How I repurpose one video into 12 posts a week.',
    platforms: ['youtube', 'x', 'linkedin', 'tiktok'],
    status: 'published',
    scheduledAt: iso(-1, 10, 0),
    engagement: 8420,
  },
  {
    id: 'p7',
    content: 'Stop posting at random times. Here is the data on when your audience is online.',
    platforms: ['instagram', 'tiktok'],
    status: 'published',
    scheduledAt: iso(-2, 18, 0),
    engagement: 15230,
  },
  {
    id: 'p8',
    content: 'A thread on the creator economy in 2026 and where the money actually is.',
    platforms: ['x'],
    status: 'published',
    scheduledAt: iso(-3, 11, 0),
    engagement: 6110,
  },
]

export type AnalyticsPoint = { label: string; reach: number; engagement: number }

export const REACH_SERIES: AnalyticsPoint[] = [
  { label: 'Mon', reach: 12400, engagement: 820 },
  { label: 'Tue', reach: 18200, engagement: 1340 },
  { label: 'Wed', reach: 15600, engagement: 1120 },
  { label: 'Thu', reach: 24800, engagement: 2010 },
  { label: 'Fri', reach: 31200, engagement: 2740 },
  { label: 'Sat', reach: 28900, engagement: 2380 },
  { label: 'Sun', reach: 34100, engagement: 3020 },
]

export const PLATFORM_PERFORMANCE: { platform: PlatformId; reach: number; posts: number }[] = [
  { platform: 'tiktok', reach: 128000, posts: 14 },
  { platform: 'instagram', reach: 96500, posts: 18 },
  { platform: 'youtube', reach: 74200, posts: 6 },
  { platform: 'x', reach: 41800, posts: 22 },
  { platform: 'linkedin', reach: 22400, posts: 9 },
  { platform: 'threads', reach: 12100, posts: 11 },
]

export const USAGE = {
  plan: 'Creator',
  aiCreditsUsed: 142,
  aiCreditsTotal: 300,
  postsThisMonth: 47,
  accountsConnected: 6,
  accountsLimit: 6,
}

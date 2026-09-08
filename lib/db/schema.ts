import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

// ---------------------------------------------------------------------------
// Better Auth tables (column names must stay camelCase to match Better Auth)
// ---------------------------------------------------------------------------
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// App tables. Plain `userId` column for per-user scoping (no FK by default).
// ---------------------------------------------------------------------------
export const socialAccounts = pgTable("social_accounts", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  platform: text("platform").notNull(),
  handle: text("handle").notNull(),
  displayName: text("displayName"),
  avatarUrl: text("avatarUrl"),
  followers: integer("followers").notNull().default(0),
  connected: boolean("connected").notNull().default(true),
  // Real OAuth connection fields (null for manually-linked demo accounts).
  platformUserId: text("platformUserId"),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  scope: text("scope"),
  isReal: boolean("isReal").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  idea: text("idea").notNull(),
  status: text("status").notNull().default("draft"),
  scheduledAt: timestamp("scheduledAt"),
  // JSON-encoded MediaItem[] (see lib/media). Shared across all platform variants.
  media: text("media"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const postTargets = pgTable("post_targets", {
  id: serial("id").primaryKey(),
  postId: integer("postId").notNull(),
  userId: text("userId").notNull(),
  platform: text("platform").notNull(),
  caption: text("caption").notNull().default(""),
  hashtags: text("hashtags").notNull().default(""),
  // Per-platform publish state: pending | published | failed | skipped
  status: text("status").notNull().default("pending"),
  externalId: text("externalId"),
  externalUrl: text("externalUrl"),
  publishedAt: timestamp("publishedAt"),
  error: text("error"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  plan: text("plan").notNull(),
  interval: text("interval").notNull().default("month"),
  status: text("status").notNull().default("pending"),
  stripeSessionId: text("stripeSessionId"),
  stripeCustomerId: text("stripeCustomerId"),
  stripeSubscriptionId: text("stripeSubscriptionId"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export type SocialAccount = typeof socialAccounts.$inferSelect
export type Post = typeof posts.$inferSelect
export type PostTarget = typeof postTargets.$inferSelect
export type Subscription = typeof subscriptions.$inferSelect

// =============================================================================
// Digests Schema
// =============================================================================
// Daily digest generation and delivery tracking
// Aggregates important messages into a summary view
// =============================================================================

import {
  pgTable,
  text,
  timestamp,
  jsonb,
  index,
  pgEnum,
  integer,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------
export const digestStatusEnum = pgEnum("digest_status", [
  "pending", // Scheduled but not generated
  "generating", // Currently being generated
  "ready", // Generated, waiting to be sent/viewed
  "sent", // Sent via email
  "viewed", // Viewed in app
  "failed", // Generation failed
]);

export const digestFrequencyEnum = pgEnum("digest_frequency", [
  "daily",
  "weekdays", // Mon-Fri only
  "weekly", // Once a week
  "disabled",
]);

// -----------------------------------------------------------------------------
// Digest Settings Table
// -----------------------------------------------------------------------------
export const digestSettings = pgTable(
  "digest_settings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),

    // Schedule
    frequency: digestFrequencyEnum("frequency").default("daily").notNull(),
    deliveryTime: text("delivery_time").default("08:00").notNull(), // HH:MM format
    timezone: text("timezone").default("UTC").notNull(),
    weeklyDay: integer("weekly_day").default(1), // 0=Sun, 1=Mon, etc.

    // Content preferences
    includeStats: boolean("include_stats").default(true),
    includeUrgent: boolean("include_urgent").default(true),
    includeNeedsReply: boolean("include_needs_reply").default(true),
    includeFyi: boolean("include_fyi").default(true),
    includeNewsletter: boolean("include_newsletter").default(false),
    maxMessages: integer("max_messages").default(20),

    // Delivery method
    sendEmail: boolean("send_email").default(true),
    sendPush: boolean("send_push").default(false),

    // Status
    isEnabled: boolean("is_enabled").default(true),
    lastGeneratedAt: timestamp("last_generated_at"),
    nextScheduledAt: timestamp("next_scheduled_at"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("digest_settings_user_idx").on(table.userId),
    index("digest_settings_next_scheduled_idx").on(table.nextScheduledAt),
  ],
);

// -----------------------------------------------------------------------------
// Digest Table
// -----------------------------------------------------------------------------
export const digest = pgTable(
  "digest",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Period covered
    date: date("date").notNull(),
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),

    // Content
    title: text("title"), // e.g., "Your Daily Digest - Jan 17, 2026"
    summary: text("summary"), // AI-generated overview

    // Stats
    stats: jsonb("stats").$type<{
      totalMessages: number;
      unreadMessages: number;
      urgentCount: number;
      needsReplyCount: number;
      fyiCount: number;
      newsletterCount: number;
      processedCount: number;
    }>(),

    // Highlighted messages (IDs and summaries)
    highlights: jsonb("highlights").$type<{
      urgent: DigestMessageHighlight[];
      needsReply: DigestMessageHighlight[];
      fyi: DigestMessageHighlight[];
    }>(),

    // Top senders/threads
    topSenders: jsonb("top_senders").$type<
      {
        email: string;
        name?: string;
        count: number;
      }[]
    >(),

    // Message IDs included (for reference)
    messageIds: jsonb("message_ids").$type<string[]>().default([]),

    // Status
    status: digestStatusEnum("status").default("pending").notNull(),
    generatedAt: timestamp("generated_at"),
    sentAt: timestamp("sent_at"),
    viewedAt: timestamp("viewed_at"),
    errorMessage: text("error_message"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("digest_user_idx").on(table.userId),
    index("digest_date_idx").on(table.date),
    index("digest_user_date_idx").on(table.userId, table.date),
    index("digest_status_idx").on(table.status),
  ],
);

// -----------------------------------------------------------------------------
// Digest Generation Queue Table
// -----------------------------------------------------------------------------
export const digestQueue = pgTable(
  "digest_queue",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Schedule
    scheduledFor: timestamp("scheduled_for").notNull(),

    // Status
    status: text("status").default("pending").notNull(), // pending, processing, completed, failed
    attempts: integer("attempts").default(0),
    lastError: text("last_error"),

    // Result
    digestId: text("digest_id").references(() => digest.id, {
      onDelete: "set null",
    }),

    // Worker locking
    lockedUntil: timestamp("locked_until"),
    lockedBy: text("locked_by"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    processedAt: timestamp("processed_at"),
  },
  (table) => [
    index("digest_queue_scheduled_idx").on(table.scheduledFor),
    index("digest_queue_status_idx").on(table.status),
    index("digest_queue_user_idx").on(table.userId),
  ],
);

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export type DigestSettings = typeof digestSettings.$inferSelect;
export type NewDigestSettings = typeof digestSettings.$inferInsert;
export type Digest = typeof digest.$inferSelect;
export type NewDigest = typeof digest.$inferInsert;
export type DigestStatus = (typeof digestStatusEnum.enumValues)[number];
export type DigestFrequency = (typeof digestFrequencyEnum.enumValues)[number];
export type DigestQueue = typeof digestQueue.$inferSelect;

// Highlight type for messages in digest
export type DigestMessageHighlight = {
  messageId: string;
  subject?: string;
  from: {
    name?: string;
    email: string;
  };
  snippet: string;
  summary?: string;
  receivedAt: string;
  priority?: string;
};

// Stats type
export type DigestStats = {
  totalMessages: number;
  unreadMessages: number;
  urgentCount: number;
  needsReplyCount: number;
  fyiCount: number;
  newsletterCount: number;
  processedCount: number;
};

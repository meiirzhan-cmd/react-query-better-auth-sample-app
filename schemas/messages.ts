// =============================================================================
// Messages Schema
// =============================================================================
// Core tables for storing email messages and threads
// Supports Gmail and Outlook message formats
// =============================================================================

import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { emailConnection } from "./connections";

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------
export const messagePriorityEnum = pgEnum("message_priority", [
  "urgent",
  "high",
  "normal",
  "low",
]);

export const messageCategoryEnum = pgEnum("message_category", [
  "needs_reply", // Requires user response
  "fyi", // Informational only
  "newsletter", // Newsletters & subscriptions
  "promotional", // Marketing emails
  "transactional", // Receipts, confirmations
  "social", // Social media notifications
  "automated", // Auto-generated emails
  "personal", // Personal correspondence
  "work", // Work-related
  "uncategorized", // Not yet classified
]);

export const messageStatusEnum = pgEnum("message_status", [
  "unread",
  "read",
  "archived",
  "trashed",
  "spam",
]);

// -----------------------------------------------------------------------------
// Thread Table
// -----------------------------------------------------------------------------
// Groups related messages together
export const thread = pgTable(
  "thread",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    connectionId: text("connection_id")
      .notNull()
      .references(() => emailConnection.id, { onDelete: "cascade" }),

    // External reference
    externalId: text("external_id").notNull(), // Gmail/Outlook thread ID

    // Thread metadata
    subject: text("subject"),
    snippet: text("snippet"), // Preview text
    messageCount: integer("message_count").default(1),

    // Participants (aggregated from messages)
    participants: jsonb("participants").$type<
      {
        name?: string;
        email: string;
      }[]
    >(),

    // Status flags
    hasUnread: boolean("has_unread").default(true),
    isStarred: boolean("is_starred").default(false),
    isArchived: boolean("is_archived").default(false),
    isTrashed: boolean("is_trashed").default(false),
    isSpam: boolean("is_spam").default(false),

    // AI classification (aggregated)
    priority: messagePriorityEnum("priority").default("normal"),
    primaryCategory:
      messageCategoryEnum("primary_category").default("uncategorized"),

    // Timestamps
    latestMessageAt: timestamp("latest_message_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("thread_user_idx").on(table.userId),
    index("thread_connection_idx").on(table.connectionId),
    index("thread_external_idx").on(table.externalId),
    index("thread_latest_message_idx").on(table.latestMessageAt),
    index("thread_priority_idx").on(table.priority),
    index("thread_category_idx").on(table.primaryCategory),
    index("thread_status_idx").on(table.isArchived, table.isTrashed),
  ],
);

// -----------------------------------------------------------------------------
// Message Table
// -----------------------------------------------------------------------------
export const message = pgTable(
  "message",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    connectionId: text("connection_id")
      .notNull()
      .references(() => emailConnection.id, { onDelete: "cascade" }),
    threadId: text("thread_id").references(() => thread.id, {
      onDelete: "cascade",
    }),

    // External references
    externalId: text("external_id").notNull(), // Gmail/Outlook message ID
    externalThreadId: text("external_thread_id"), // For linking before thread exists
    internetMessageId: text("internet_message_id"), // RFC 2822 Message-ID header

    // Email headers
    subject: text("subject"),
    from: jsonb("from")
      .$type<{
        name?: string;
        email: string;
      }>()
      .notNull(),
    to: jsonb("to")
      .$type<
        {
          name?: string;
          email: string;
        }[]
      >()
      .default([]),
    cc: jsonb("cc")
      .$type<
        {
          name?: string;
          email: string;
        }[]
      >()
      .default([]),
    bcc: jsonb("bcc")
      .$type<
        {
          name?: string;
          email: string;
        }[]
      >()
      .default([]),
    replyTo: jsonb("reply_to").$type<
      {
        name?: string;
        email: string;
      }[]
    >(),

    // Content
    snippet: text("snippet"), // Short preview (first ~200 chars)
    bodyText: text("body_text"), // Plain text version
    bodyHtml: text("body_html"), // HTML version

    // Status
    status: messageStatusEnum("status").default("unread").notNull(),
    isStarred: boolean("is_starred").default(false),
    isDraft: boolean("is_draft").default(false),
    isSent: boolean("is_sent").default(false), // Sent by the user

    // Attachments
    hasAttachments: boolean("has_attachments").default(false),
    attachments: jsonb("attachments")
      .$type<
        {
          id: string;
          filename: string;
          mimeType: string;
          size: number;
        }[]
      >()
      .default([]),

    // AI classification
    priority: messagePriorityEnum("priority"),
    category: messageCategoryEnum("category"),
    aiProcessedAt: timestamp("ai_processed_at"),

    // Original message metadata
    headers: jsonb("headers").$type<Record<string, string>>(),
    rawSize: integer("raw_size"), // Size in bytes

    // Timestamps
    receivedAt: timestamp("received_at").notNull(),
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("message_user_idx").on(table.userId),
    index("message_connection_idx").on(table.connectionId),
    index("message_thread_idx").on(table.threadId),
    index("message_external_idx").on(table.externalId),
    index("message_received_idx").on(table.receivedAt),
    index("message_status_idx").on(table.status),
    index("message_priority_idx").on(table.priority),
    index("message_category_idx").on(table.category),
    index("message_from_email_idx").on(table.userId), // Would need GIN index for JSONB
  ],
);

// -----------------------------------------------------------------------------
// Reply Draft Table
// -----------------------------------------------------------------------------
// Stores AI-generated and user-edited reply drafts
export const replyDraft = pgTable(
  "reply_draft",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    messageId: text("message_id")
      .notNull()
      .references(() => message.id, { onDelete: "cascade" }),

    // Draft content
    subject: text("subject"),
    bodyText: text("body_text"),
    bodyHtml: text("body_html"),

    // Metadata
    isAiGenerated: boolean("is_ai_generated").default(true),
    aiModel: text("ai_model"),
    aiPrompt: text("ai_prompt"), // For regeneration
    tone: text("tone"), // 'professional', 'casual', 'formal'

    // Status
    isSent: boolean("is_sent").default(false),
    sentAt: timestamp("sent_at"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("draft_user_idx").on(table.userId),
    index("draft_message_idx").on(table.messageId),
  ],
);

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export type Thread = typeof thread.$inferSelect;
export type NewThread = typeof thread.$inferInsert;
export type Message = typeof message.$inferSelect;
export type NewMessage = typeof message.$inferInsert;
export type MessagePriority = (typeof messagePriorityEnum.enumValues)[number];
export type MessageCategory = (typeof messageCategoryEnum.enumValues)[number];
export type MessageStatus = (typeof messageStatusEnum.enumValues)[number];
export type ReplyDraft = typeof replyDraft.$inferSelect;

// Email address type for use across the app
export type EmailAddress = {
  name?: string;
  email: string;
};

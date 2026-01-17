// =============================================================================
// AI Summaries Schema
// =============================================================================
// Stores AI-generated summaries, classifications, and analysis
// Supports multiple AI providers and models
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
} from "drizzle-orm/pg-core";
import { message, thread } from "./messages";
import { user } from "./auth";

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------
export const aiModelEnum = pgEnum("ai_model", [
  "bart-large-cnn", // Summarization
  "flan-t5-base", // Classification
  "flan-t5-large", // Better classification
  "gpt-3.5-turbo", // OpenAI (if used)
  "claude-3-haiku", // Anthropic (if used)
  "custom", // Custom/fine-tuned models
]);

export const sentimentEnum = pgEnum("sentiment", [
  "positive",
  "neutral",
  "negative",
  "mixed",
]);

export const processingStatusEnum = pgEnum("processing_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "skipped", // E.g., message too short
]);

// -----------------------------------------------------------------------------
// Message Summary Table
// -----------------------------------------------------------------------------
export const messageSummary = pgTable(
  "message_summary",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    messageId: text("message_id")
      .notNull()
      .references(() => message.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Summary content
    summary: text("summary").notNull(),
    summaryLength: integer("summary_length"), // For analytics

    // Key information extracted
    keyPoints: jsonb("key_points").$type<string[]>().default([]),
    actionItems: jsonb("action_items")
      .$type<
        {
          text: string;
          completed?: boolean;
          dueDate?: string;
        }[]
      >()
      .default([]),
    questions: jsonb("questions").$type<string[]>().default([]), // Questions asked in email

    // Sentiment analysis
    sentiment: sentimentEnum("sentiment"),
    sentimentScore: integer("sentiment_score"), // -100 to 100

    // Entity extraction
    entities: jsonb("entities").$type<{
      people?: string[];
      companies?: string[];
      dates?: string[];
      amounts?: string[];
      locations?: string[];
    }>(),

    // AI metadata
    model: aiModelEnum("model").notNull(),
    modelVersion: text("model_version"),
    processingTimeMs: integer("processing_time_ms"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),

    // Status
    status: processingStatusEnum("status").default("completed").notNull(),
    errorMessage: text("error_message"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("summary_message_idx").on(table.messageId),
    index("summary_user_idx").on(table.userId),
    index("summary_status_idx").on(table.status),
    index("summary_created_idx").on(table.createdAt),
  ],
);

// -----------------------------------------------------------------------------
// Thread Summary Table
// -----------------------------------------------------------------------------
// Aggregated summary for entire conversation threads
export const threadSummary = pgTable(
  "thread_summary",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    threadId: text("thread_id")
      .notNull()
      .references(() => thread.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Thread overview
    summary: text("summary").notNull(),
    context: text("context"), // Background context for the conversation

    // Conversation analysis
    participants: jsonb("participants").$type<
      {
        email: string;
        name?: string;
        messageCount: number;
        role?: string; // 'initiator', 'responder', etc.
      }[]
    >(),

    // Key information
    decisions: jsonb("decisions").$type<string[]>().default([]),
    openQuestions: jsonb("open_questions").$type<string[]>().default([]),
    nextSteps: jsonb("next_steps").$type<string[]>().default([]),

    // Sentiment trend
    overallSentiment: sentimentEnum("overall_sentiment"),
    sentimentTrend: text("sentiment_trend"), // 'improving', 'declining', 'stable'

    // AI metadata
    model: aiModelEnum("model").notNull(),
    messagesCovered: integer("messages_covered"), // How many messages were analyzed
    lastMessageId: text("last_message_id"), // Last message included

    // Status
    status: processingStatusEnum("status").default("completed").notNull(),
    needsUpdate: boolean("needs_update").default(false), // New messages added

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("thread_summary_thread_idx").on(table.threadId),
    index("thread_summary_user_idx").on(table.userId),
    index("thread_summary_needs_update_idx").on(table.needsUpdate),
  ],
);

// -----------------------------------------------------------------------------
// AI Processing Queue Table
// -----------------------------------------------------------------------------
// Tracks messages waiting to be processed by AI
export const aiProcessingQueue = pgTable(
  "ai_processing_queue",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    messageId: text("message_id")
      .notNull()
      .references(() => message.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Task type
    taskType: text("task_type").notNull(), // 'summarize', 'classify', 'extract', 'reply'
    priority: integer("priority").default(0), // Higher = process first

    // Status
    status: processingStatusEnum("status").default("pending").notNull(),
    attempts: integer("attempts").default(0),
    maxAttempts: integer("max_attempts").default(3),
    lastError: text("last_error"),

    // Scheduling
    scheduledFor: timestamp("scheduled_for").defaultNow(),
    lockedUntil: timestamp("locked_until"), // For worker locking
    lockedBy: text("locked_by"), // Worker ID

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    processedAt: timestamp("processed_at"),
  },
  (table) => [
    index("queue_status_idx").on(table.status),
    index("queue_scheduled_idx").on(table.scheduledFor),
    index("queue_user_idx").on(table.userId),
    index("queue_priority_idx").on(table.priority),
  ],
);

// -----------------------------------------------------------------------------
// AI Usage Log Table
// -----------------------------------------------------------------------------
// Tracks AI API usage for billing and analytics
export const aiUsageLog = pgTable(
  "ai_usage_log",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Usage details
    model: aiModelEnum("model").notNull(),
    taskType: text("task_type").notNull(),
    inputTokens: integer("input_tokens").default(0),
    outputTokens: integer("output_tokens").default(0),

    // Cost tracking (in micro-dollars for precision)
    costMicros: integer("cost_micros").default(0),

    // Request metadata
    requestId: text("request_id"),
    durationMs: integer("duration_ms"),
    success: boolean("success").default(true),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("ai_usage_user_idx").on(table.userId),
    index("ai_usage_created_idx").on(table.createdAt),
    index("ai_usage_model_idx").on(table.model),
  ],
);

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export type MessageSummary = typeof messageSummary.$inferSelect;
export type NewMessageSummary = typeof messageSummary.$inferInsert;
export type ThreadSummary = typeof threadSummary.$inferSelect;
export type AiModel = (typeof aiModelEnum.enumValues)[number];
export type Sentiment = (typeof sentimentEnum.enumValues)[number];
export type ProcessingStatus = (typeof processingStatusEnum.enumValues)[number];
export type AiProcessingQueue = typeof aiProcessingQueue.$inferSelect;
export type AiUsageLog = typeof aiUsageLog.$inferSelect;

// Entity types for extraction
export type ExtractedEntities = {
  people?: string[];
  companies?: string[];
  dates?: string[];
  amounts?: string[];
  locations?: string[];
};

// Action item type
export type ActionItem = {
  text: string;
  completed?: boolean;
  dueDate?: string;
};

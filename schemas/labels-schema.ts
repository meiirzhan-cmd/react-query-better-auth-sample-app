// =============================================================================
// Labels Schema
// =============================================================================
// Custom and system labels for organizing messages
// Supports both user-created and AI-assigned labels
// =============================================================================

import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { message } from "./messages";

export const labelTypeEnum = pgEnum("label_type", [
  "system", // Built-in labels (Inbox, Sent, Drafts, etc.)
  "smart", // AI-managed labels (Urgent, Needs Reply, etc.)
  "custom", // User-created labels
]);

export const labelAssignmentSourceEnum = pgEnum("label_assignment_source", [
  "user", // Manually assigned by user
  "ai", // Automatically assigned by AI
  "rule", // Assigned by user-defined rule
  "sync", // Synced from email provider
]);

// -----------------------------------------------------------------------------
// Label Table
// -----------------------------------------------------------------------------
export const label = pgTable(
  "label",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Label info
    name: text("name").notNull(),
    slug: text("slug").notNull(), // URL-safe version
    description: text("description"),

    // Visual
    color: text("color").notNull().default("#6B7280"), // Tailwind gray-500
    icon: text("icon"), // Lucide icon name

    // Type
    type: labelTypeEnum("type").default("custom").notNull(),

    // Settings
    isVisible: boolean("is_visible").default(true), // Show in sidebar
    showInFilters: boolean("show_in_filters").default(true),
    sortOrder: integer("sort_order").default(0),

    // For smart labels
    aiCriteria: text("ai_criteria"), // Description for AI to match

    // Stats (denormalized for performance)
    messageCount: integer("message_count").default(0),
    unreadCount: integer("unread_count").default(0),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("label_user_idx").on(table.userId),
    index("label_type_idx").on(table.type),
    index("label_user_slug_idx").on(table.userId, table.slug),
  ],
);

// -----------------------------------------------------------------------------
// Message Label Junction Table
// -----------------------------------------------------------------------------
export const messageLabel = pgTable(
  "message_label",
  {
    messageId: text("message_id")
      .notNull()
      .references(() => message.id, { onDelete: "cascade" }),
    labelId: text("label_id")
      .notNull()
      .references(() => label.id, { onDelete: "cascade" }),

    // Assignment metadata
    source: labelAssignmentSourceEnum("source").default("user").notNull(),
    confidence: integer("confidence"), // 0-100, for AI assignments

    // Timestamps
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.messageId, table.labelId] }),
    index("ml_message_idx").on(table.messageId),
    index("ml_label_idx").on(table.labelId),
  ],
);

// -----------------------------------------------------------------------------
// Label Rule Table
// -----------------------------------------------------------------------------
// User-defined rules for auto-labeling
export const labelRule = pgTable(
  "label_rule",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    labelId: text("label_id")
      .notNull()
      .references(() => label.id, { onDelete: "cascade" }),

    // Rule info
    name: text("name").notNull(),
    description: text("description"),

    // Conditions (JSON structure for flexibility)
    // Example: { "from": { "contains": "@company.com" }, "subject": { "startsWith": "[URGENT]" } }
    conditions: text("conditions").notNull(), // JSON string

    // Settings
    isActive: boolean("is_active").default(true),
    applyToExisting: boolean("apply_to_existing").default(false),
    priority: integer("priority").default(0), // Higher = runs first

    // Stats
    timesApplied: integer("times_applied").default(0),
    lastAppliedAt: timestamp("last_applied_at"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("rule_user_idx").on(table.userId),
    index("rule_label_idx").on(table.labelId),
    index("rule_active_idx").on(table.isActive),
  ],
);

// -----------------------------------------------------------------------------
// Default System Labels
// -----------------------------------------------------------------------------
export const DEFAULT_SYSTEM_LABELS = [
  { name: "Inbox", slug: "inbox", icon: "inbox", color: "#3B82F6" },
  { name: "Sent", slug: "sent", icon: "send", color: "#10B981" },
  { name: "Drafts", slug: "drafts", icon: "file-edit", color: "#F59E0B" },
  { name: "Starred", slug: "starred", icon: "star", color: "#EAB308" },
  { name: "Archive", slug: "archive", icon: "archive", color: "#6B7280" },
  { name: "Spam", slug: "spam", icon: "alert-octagon", color: "#EF4444" },
  { name: "Trash", slug: "trash", icon: "trash-2", color: "#6B7280" },
] as const;

export const DEFAULT_SMART_LABELS = [
  {
    name: "Urgent",
    slug: "urgent",
    icon: "alert-circle",
    color: "#EF4444",
    aiCriteria: "Time-sensitive messages requiring immediate attention",
  },
  {
    name: "Needs Reply",
    slug: "needs-reply",
    icon: "reply",
    color: "#F97316",
    aiCriteria: "Messages with questions or requests that need a response",
  },
  {
    name: "FYI",
    slug: "fyi",
    icon: "info",
    color: "#3B82F6",
    aiCriteria: "Informational messages that don't require action",
  },
  {
    name: "Newsletter",
    slug: "newsletter",
    icon: "newspaper",
    color: "#8B5CF6",
    aiCriteria: "Newsletter subscriptions and periodic updates",
  },
  {
    name: "Promotional",
    slug: "promotional",
    icon: "tag",
    color: "#EC4899",
    aiCriteria: "Marketing emails, deals, and promotional content",
  },
] as const;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export type Label = typeof label.$inferSelect;
export type NewLabel = typeof label.$inferInsert;
export type LabelType = (typeof labelTypeEnum.enumValues)[number];
export type LabelAssignmentSource =
  (typeof labelAssignmentSourceEnum.enumValues)[number];
export type MessageLabel = typeof messageLabel.$inferSelect;
export type LabelRule = typeof labelRule.$inferSelect;

// Condition types for label rules
export type RuleConditionOperator =
  | "equals"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "regex"
  | "notEquals"
  | "notContains";

export type RuleCondition = {
  field: "from" | "to" | "subject" | "body";
  operator: RuleConditionOperator;
  value: string;
  caseSensitive?: boolean;
};

export type RuleConditions = {
  match: "all" | "any";
  conditions: RuleCondition[];
};

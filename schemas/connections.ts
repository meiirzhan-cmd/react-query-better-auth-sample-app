// =============================================================================
// Email Connections Schema
// =============================================================================
// Stores OAuth connections to email providers (Gmail, Outlook)
// Each user can have multiple email accounts connected
// =============================================================================

import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------
export const emailProviderEnum = pgEnum("email_provider", [
  "gmail",
  "outlook",
  "mock", // For development/testing
]);

export const connectionStatusEnum = pgEnum("connection_status", [
  "active",
  "expired", // Token expired, needs refresh
  "revoked", // User revoked access
  "error", // Sync error
  "disconnected", // User disconnected
]);

// -----------------------------------------------------------------------------
// Email Connection Table
// -----------------------------------------------------------------------------
export const emailConnection = pgTable(
  "email_connection",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Provider info
    provider: emailProviderEnum("provider").notNull(),
    email: text("email").notNull(),
    displayName: text("display_name"),

    // OAuth tokens (encrypted in production)
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    tokenExpiresAt: timestamp("token_expires_at"),
    scope: text("scope"), // Granted OAuth scopes

    // Sync state
    status: connectionStatusEnum("status").default("active").notNull(),
    syncCursor: text("sync_cursor"), // For incremental sync (Gmail historyId, etc.)
    lastSyncAt: timestamp("last_sync_at"),
    lastSyncError: text("last_sync_error"),
    syncErrorCount: text("sync_error_count").default("0"),

    // Settings
    isDefault: boolean("is_default").default(false), // Default account for sending
    syncEnabled: boolean("sync_enabled").default(true),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("connection_user_idx").on(table.userId),
    index("connection_provider_email_idx").on(table.provider, table.email),
    index("connection_status_idx").on(table.status),
  ],
);

// -----------------------------------------------------------------------------
// Sync History Table
// -----------------------------------------------------------------------------
// Tracks sync operations for debugging and monitoring
export const syncHistory = pgTable(
  "sync_history",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    connectionId: text("connection_id")
      .notNull()
      .references(() => emailConnection.id, { onDelete: "cascade" }),

    // Sync details
    syncType: text("sync_type").notNull(), // 'full', 'incremental', 'manual'
    status: text("status").notNull(), // 'started', 'completed', 'failed'
    messagesProcessed: text("messages_processed").default("0"),
    newMessages: text("new_messages").default("0"),
    errorMessage: text("error_message"),

    // Timing
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    durationMs: text("duration_ms"),
  },
  (table) => [
    index("sync_history_connection_idx").on(table.connectionId),
    index("sync_history_started_idx").on(table.startedAt),
  ],
);

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export type EmailConnection = typeof emailConnection.$inferSelect;
export type NewEmailConnection = typeof emailConnection.$inferInsert;
export type EmailProvider = (typeof emailProviderEnum.enumValues)[number];
export type ConnectionStatus = (typeof connectionStatusEnum.enumValues)[number];
export type SyncHistory = typeof syncHistory.$inferSelect;

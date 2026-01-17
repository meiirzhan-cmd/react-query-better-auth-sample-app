// =============================================================================
// Database Relations
// =============================================================================
// Defines all relationships between tables for Drizzle ORM
// Enables type-safe joins and nested queries
// =============================================================================

import { relations } from "drizzle-orm";

// Auth tables
import { user, session, account } from "./auth";

// Core domain tables
import { emailConnection, syncHistory } from "./connections";
import { thread, message, replyDraft } from "./messages";
import {
  messageSummary,
  threadSummary,
  aiProcessingQueue,
  aiUsageLog,
} from "./summaries";
import { digest, digestSettings, digestQueue } from "./digests";
import {
  subscription,
  usageRecord,
  dailyUsageSummary,
  paymentHistory,
} from "./subscriptions";
import { label, labelRule, messageLabel } from "./labels-schema";

// =============================================================================
// User Relations
// =============================================================================
export const userRelations = relations(user, ({ many, one }) => ({
  // Auth
  sessions: many(session),
  accounts: many(account),

  // Email
  emailConnections: many(emailConnection),
  threads: many(thread),
  messages: many(message),

  // Labels
  labels: many(label),

  // AI
  messageSummaries: many(messageSummary),
  threadSummaries: many(threadSummary),
  aiProcessingQueue: many(aiProcessingQueue),
  aiUsageLogs: many(aiUsageLog),

  // Digest
  digestSettings: one(digestSettings, {
    fields: [user.id],
    references: [digestSettings.userId],
  }),
  digests: many(digest),

  // Billing
  subscription: one(subscription, {
    fields: [user.id],
    references: [subscription.userId],
  }),
  usageRecords: many(usageRecord),
  dailyUsageSummaries: many(dailyUsageSummary),
  paymentHistory: many(paymentHistory),
}));

// =============================================================================
// Auth Relations
// =============================================================================
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// =============================================================================
// Email Connection Relations
// =============================================================================
export const emailConnectionRelations = relations(
  emailConnection,
  ({ one, many }) => ({
    user: one(user, {
      fields: [emailConnection.userId],
      references: [user.id],
    }),
    threads: many(thread),
    messages: many(message),
    syncHistory: many(syncHistory),
  }),
);

export const syncHistoryRelations = relations(syncHistory, ({ one }) => ({
  connection: one(emailConnection, {
    fields: [syncHistory.connectionId],
    references: [emailConnection.id],
  }),
}));

// =============================================================================
// Thread Relations
// =============================================================================
export const threadRelations = relations(thread, ({ one, many }) => ({
  user: one(user, {
    fields: [thread.userId],
    references: [user.id],
  }),
  connection: one(emailConnection, {
    fields: [thread.connectionId],
    references: [emailConnection.id],
  }),
  messages: many(message),
  summary: one(threadSummary, {
    fields: [thread.id],
    references: [threadSummary.threadId],
  }),
}));

// =============================================================================
// Message Relations
// =============================================================================
export const messageRelations = relations(message, ({ one, many }) => ({
  user: one(user, {
    fields: [message.userId],
    references: [user.id],
  }),
  connection: one(emailConnection, {
    fields: [message.connectionId],
    references: [emailConnection.id],
  }),
  thread: one(thread, {
    fields: [message.threadId],
    references: [thread.id],
  }),
  summary: one(messageSummary, {
    fields: [message.id],
    references: [messageSummary.messageId],
  }),
  labels: many(messageLabel),
  replyDrafts: many(replyDraft),
  processingQueue: many(aiProcessingQueue),
}));

export const replyDraftRelations = relations(replyDraft, ({ one }) => ({
  user: one(user, {
    fields: [replyDraft.userId],
    references: [user.id],
  }),
  message: one(message, {
    fields: [replyDraft.messageId],
    references: [message.id],
  }),
}));

// =============================================================================
// Label Relations
// =============================================================================
export const labelRelations = relations(label, ({ one, many }) => ({
  user: one(user, {
    fields: [label.userId],
    references: [user.id],
  }),
  messageLabels: many(messageLabel),
  rules: many(labelRule),
}));

export const messageLabelRelations = relations(messageLabel, ({ one }) => ({
  message: one(message, {
    fields: [messageLabel.messageId],
    references: [message.id],
  }),
  label: one(label, {
    fields: [messageLabel.labelId],
    references: [label.id],
  }),
}));

export const labelRuleRelations = relations(labelRule, ({ one }) => ({
  user: one(user, {
    fields: [labelRule.userId],
    references: [user.id],
  }),
  label: one(label, {
    fields: [labelRule.labelId],
    references: [label.id],
  }),
}));

// =============================================================================
// Summary Relations
// =============================================================================
export const messageSummaryRelations = relations(messageSummary, ({ one }) => ({
  message: one(message, {
    fields: [messageSummary.messageId],
    references: [message.id],
  }),
  user: one(user, {
    fields: [messageSummary.userId],
    references: [user.id],
  }),
}));

export const threadSummaryRelations = relations(threadSummary, ({ one }) => ({
  thread: one(thread, {
    fields: [threadSummary.threadId],
    references: [thread.id],
  }),
  user: one(user, {
    fields: [threadSummary.userId],
    references: [user.id],
  }),
}));

export const aiProcessingQueueRelations = relations(
  aiProcessingQueue,
  ({ one }) => ({
    message: one(message, {
      fields: [aiProcessingQueue.messageId],
      references: [message.id],
    }),
    user: one(user, {
      fields: [aiProcessingQueue.userId],
      references: [user.id],
    }),
  }),
);

export const aiUsageLogRelations = relations(aiUsageLog, ({ one }) => ({
  user: one(user, {
    fields: [aiUsageLog.userId],
    references: [user.id],
  }),
}));

// =============================================================================
// Digest Relations
// =============================================================================
export const digestSettingsRelations = relations(digestSettings, ({ one }) => ({
  user: one(user, {
    fields: [digestSettings.userId],
    references: [user.id],
  }),
}));

export const digestRelations = relations(digest, ({ one }) => ({
  user: one(user, {
    fields: [digest.userId],
    references: [user.id],
  }),
}));

export const digestQueueRelations = relations(digestQueue, ({ one }) => ({
  user: one(user, {
    fields: [digestQueue.userId],
    references: [user.id],
  }),
  digest: one(digest, {
    fields: [digestQueue.digestId],
    references: [digest.id],
  }),
}));

// =============================================================================
// Subscription Relations
// =============================================================================
export const subscriptionRelations = relations(
  subscription,
  ({ one, many }) => ({
    user: one(user, {
      fields: [subscription.userId],
      references: [user.id],
    }),
    usageRecords: many(usageRecord),
    payments: many(paymentHistory),
  }),
);

export const usageRecordRelations = relations(usageRecord, ({ one }) => ({
  user: one(user, {
    fields: [usageRecord.userId],
    references: [user.id],
  }),
  subscription: one(subscription, {
    fields: [usageRecord.subscriptionId],
    references: [subscription.id],
  }),
}));

export const dailyUsageSummaryRelations = relations(
  dailyUsageSummary,
  ({ one }) => ({
    user: one(user, {
      fields: [dailyUsageSummary.userId],
      references: [user.id],
    }),
  }),
);

export const paymentHistoryRelations = relations(paymentHistory, ({ one }) => ({
  user: one(user, {
    fields: [paymentHistory.userId],
    references: [user.id],
  }),
  subscription: one(subscription, {
    fields: [paymentHistory.subscriptionId],
    references: [subscription.id],
  }),
}));

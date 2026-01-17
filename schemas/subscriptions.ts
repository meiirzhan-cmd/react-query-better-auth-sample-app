// =============================================================================
// Subscriptions & Billing Schema
// =============================================================================
// Stripe integration for subscription management
// Tracks plans, usage, and billing history
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
export const planTypeEnum = pgEnum("plan_type", [
  "free",
  "pro",
  "team",
  "enterprise",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
  "unpaid",
  "incomplete",
  "incomplete_expired",
  "trialing",
  "paused",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "succeeded",
  "pending",
  "failed",
  "refunded",
  "canceled",
]);

// -----------------------------------------------------------------------------
// Subscription Table
// -----------------------------------------------------------------------------
export const subscription = pgTable(
  "subscription",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),

    // Stripe IDs
    stripeCustomerId: text("stripe_customer_id").unique(),
    stripeSubscriptionId: text("stripe_subscription_id").unique(),
    stripePriceId: text("stripe_price_id"),
    stripeProductId: text("stripe_product_id"),

    // Plan details
    plan: planTypeEnum("plan").default("free").notNull(),
    status: subscriptionStatusEnum("status").default("active").notNull(),

    // Billing period
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),

    // Trial
    trialStart: timestamp("trial_start"),
    trialEnd: timestamp("trial_end"),

    // Cancellation
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
    canceledAt: timestamp("canceled_at"),
    cancellationReason: text("cancellation_reason"),

    // Metadata
    metadata: jsonb("metadata").$type<Record<string, string>>(),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("subscription_user_idx").on(table.userId),
    index("subscription_stripe_customer_idx").on(table.stripeCustomerId),
    index("subscription_stripe_sub_idx").on(table.stripeSubscriptionId),
    index("subscription_status_idx").on(table.status),
    index("subscription_plan_idx").on(table.plan),
  ],
);

// -----------------------------------------------------------------------------
// Usage Record Table
// -----------------------------------------------------------------------------
// Tracks feature usage for metered billing and limits
export const usageRecord = pgTable(
  "usage_record",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    subscriptionId: text("subscription_id").references(() => subscription.id, {
      onDelete: "set null",
    }),

    // Usage type
    featureType: text("feature_type").notNull(), // 'ai_summary', 'ai_reply', 'ai_classify', 'email_sync'

    // Usage data
    quantity: integer("quantity").default(1).notNull(),

    // Period (for aggregation)
    date: date("date").notNull(),

    // Metadata
    metadata: jsonb("metadata").$type<{
      messageId?: string;
      model?: string;
      tokens?: number;
    }>(),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("usage_user_idx").on(table.userId),
    index("usage_date_idx").on(table.date),
    index("usage_user_date_idx").on(table.userId, table.date),
    index("usage_feature_idx").on(table.featureType),
  ],
);

// -----------------------------------------------------------------------------
// Daily Usage Summary Table
// -----------------------------------------------------------------------------
// Aggregated daily usage for quick limit checks
export const dailyUsageSummary = pgTable(
  "daily_usage_summary",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),

    // Aggregated counts
    aiSummaries: integer("ai_summaries").default(0).notNull(),
    aiReplies: integer("ai_replies").default(0).notNull(),
    aiClassifications: integer("ai_classifications").default(0).notNull(),
    emailsSynced: integer("emails_synced").default(0).notNull(),
    digestsGenerated: integer("digests_generated").default(0).notNull(),

    // Total tokens used (for AI cost tracking)
    totalInputTokens: integer("total_input_tokens").default(0).notNull(),
    totalOutputTokens: integer("total_output_tokens").default(0).notNull(),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("daily_usage_user_date_idx").on(table.userId, table.date)],
);

// -----------------------------------------------------------------------------
// Payment History Table
// -----------------------------------------------------------------------------
export const paymentHistory = pgTable(
  "payment_history",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    subscriptionId: text("subscription_id").references(() => subscription.id, {
      onDelete: "set null",
    }),

    // Stripe IDs
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeInvoiceId: text("stripe_invoice_id"),
    stripeChargeId: text("stripe_charge_id"),

    // Payment details
    amount: integer("amount").notNull(), // In cents
    currency: text("currency").default("usd").notNull(),
    status: paymentStatusEnum("status").notNull(),

    // Description
    description: text("description"),
    invoiceUrl: text("invoice_url"),
    receiptUrl: text("receipt_url"),

    // Metadata
    metadata: jsonb("metadata").$type<Record<string, string>>(),

    // Timestamps
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("payment_user_idx").on(table.userId),
    index("payment_subscription_idx").on(table.subscriptionId),
    index("payment_stripe_pi_idx").on(table.stripePaymentIntentId),
    index("payment_status_idx").on(table.status),
  ],
);

// -----------------------------------------------------------------------------
// Plan Limits Configuration
// -----------------------------------------------------------------------------
export const PLAN_LIMITS = {
  free: {
    name: "Free",
    price: 0,
    limits: {
      emailConnections: 1,
      dailyAiSummaries: 10,
      dailyAiReplies: 5,
      dailyAiClassifications: 20,
      customLabels: 3,
      digestEnabled: false,
      prioritySupport: false,
    },
  },
  pro: {
    name: "Pro",
    price: 900, // $9.00 in cents
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    limits: {
      emailConnections: 3,
      dailyAiSummaries: -1, // -1 = unlimited
      dailyAiReplies: -1,
      dailyAiClassifications: -1,
      customLabels: -1,
      digestEnabled: true,
      prioritySupport: false,
    },
  },
  team: {
    name: "Team",
    price: 2900, // $29.00 in cents
    stripePriceId: process.env.STRIPE_TEAM_PRICE_ID,
    limits: {
      emailConnections: 10,
      dailyAiSummaries: -1,
      dailyAiReplies: -1,
      dailyAiClassifications: -1,
      customLabels: -1,
      digestEnabled: true,
      prioritySupport: true,
      teamMembers: 5,
    },
  },
  enterprise: {
    name: "Enterprise",
    price: -1, // Custom pricing
    limits: {
      emailConnections: -1,
      dailyAiSummaries: -1,
      dailyAiReplies: -1,
      dailyAiClassifications: -1,
      customLabels: -1,
      digestEnabled: true,
      prioritySupport: true,
      teamMembers: -1,
      sso: true,
      customIntegrations: true,
    },
  },
} as const;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export type Subscription = typeof subscription.$inferSelect;
export type NewSubscription = typeof subscription.$inferInsert;
export type UsageRecord = typeof usageRecord.$inferSelect;
export type NewUsageRecord = typeof usageRecord.$inferInsert;
export type DailyUsageSummary = typeof dailyUsageSummary.$inferSelect;
export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type PlanType = (typeof planTypeEnum.enumValues)[number];
export type SubscriptionStatus =
  (typeof subscriptionStatusEnum.enumValues)[number];
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];

// Plan limits type
export type PlanLimits = {
  emailConnections: number;
  dailyAiSummaries: number;
  dailyAiReplies: number;
  dailyAiClassifications: number;
  customLabels: number;
  digestEnabled: boolean;
  prioritySupport: boolean;
  teamMembers?: number;
  sso?: boolean;
  customIntegrations?: boolean;
};

// Feature type for usage tracking
export type FeatureType =
  | "ai_summary"
  | "ai_reply"
  | "ai_classify"
  | "email_sync"
  | "digest";

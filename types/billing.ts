// =============================================================================
// Billing Types
// =============================================================================
// Types for subscriptions, plans, and usage tracking
// =============================================================================

// -----------------------------------------------------------------------------
// Plan Types
// -----------------------------------------------------------------------------
export type PlanType = "free" | "pro" | "team" | "enterprise";

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "paused";

export type PaymentStatus =
  | "succeeded"
  | "pending"
  | "failed"
  | "refunded"
  | "canceled";

// -----------------------------------------------------------------------------
// Plan Configuration
// -----------------------------------------------------------------------------
export interface PlanConfig {
  name: string;
  description: string;
  price: number; // In cents, -1 for custom
  period: "month" | "year" | "forever";
  stripePriceId?: string;
  limits: PlanLimits;
  features: PlanFeature[];
}

export interface PlanLimits {
  emailConnections: number; // -1 = unlimited
  dailyAiSummaries: number;
  dailyAiReplies: number;
  dailyAiClassifications: number;
  customLabels: number;
  digestEnabled: boolean;
  prioritySupport: boolean;
  teamMembers?: number;
  sso?: boolean;
  customIntegrations?: boolean;
}

export interface PlanFeature {
  text: string;
  included: boolean;
  tooltip?: string;
}

// -----------------------------------------------------------------------------
// Plan Configurations
// -----------------------------------------------------------------------------
export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  free: {
    name: "Free",
    description: "Perfect for trying out Inbox Zero",
    price: 0,
    period: "forever",
    limits: {
      emailConnections: 1,
      dailyAiSummaries: 10,
      dailyAiReplies: 5,
      dailyAiClassifications: 20,
      customLabels: 3,
      digestEnabled: false,
      prioritySupport: false,
    },
    features: [
      { text: "1 email account", included: true },
      { text: "10 AI summaries/day", included: true },
      { text: "5 AI reply drafts/day", included: true },
      { text: "3 custom labels", included: true },
      { text: "Daily digest", included: false },
      { text: "Priority support", included: false },
    ],
  },
  pro: {
    name: "Pro",
    description: "For professionals who want inbox mastery",
    price: 900, // $9.00
    period: "month",
    limits: {
      emailConnections: 3,
      dailyAiSummaries: -1,
      dailyAiReplies: -1,
      dailyAiClassifications: -1,
      customLabels: -1,
      digestEnabled: true,
      prioritySupport: false,
    },
    features: [
      { text: "3 email accounts", included: true },
      { text: "Unlimited AI summaries", included: true },
      { text: "Unlimited AI reply drafts", included: true },
      { text: "Unlimited custom labels", included: true },
      { text: "Daily digest", included: true },
      { text: "Priority support", included: false },
    ],
  },
  team: {
    name: "Team",
    description: "For teams that collaborate on email",
    price: 2900, // $29.00
    period: "month",
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
    features: [
      { text: "10 email accounts", included: true },
      { text: "Unlimited AI features", included: true },
      { text: "Team sharing", included: true },
      { text: "5 team members", included: true },
      { text: "Daily digest", included: true },
      { text: "Priority support", included: true },
    ],
  },
  enterprise: {
    name: "Enterprise",
    description: "Custom solutions for large organizations",
    price: -1,
    period: "month",
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
    features: [
      { text: "Unlimited email accounts", included: true },
      { text: "Unlimited everything", included: true },
      { text: "SSO integration", included: true },
      { text: "Custom integrations", included: true },
      { text: "Dedicated support", included: true },
      { text: "SLA guarantee", included: true },
    ],
  },
};

// -----------------------------------------------------------------------------
// Subscription
// -----------------------------------------------------------------------------
export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeProductId?: string;
  plan: PlanType;
  status: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  trialStart?: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Usage Record
// -----------------------------------------------------------------------------
export interface UsageRecord {
  id: string;
  userId: string;
  subscriptionId?: string;
  featureType: FeatureType;
  quantity: number;
  date: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type FeatureType =
  | "ai_summary"
  | "ai_reply"
  | "ai_classify"
  | "email_sync"
  | "digest";

// -----------------------------------------------------------------------------
// Daily Usage Summary
// -----------------------------------------------------------------------------
export interface DailyUsageSummary {
  id: string;
  userId: string;
  date: string;
  aiSummaries: number;
  aiReplies: number;
  aiClassifications: number;
  emailsSynced: number;
  digestsGenerated: number;
  totalInputTokens: number;
  totalOutputTokens: number;
}

// -----------------------------------------------------------------------------
// Current Usage (for UI)
// -----------------------------------------------------------------------------
export interface CurrentUsage {
  plan: PlanType;
  limits: PlanLimits;
  used: {
    aiSummaries: number;
    aiReplies: number;
    aiClassifications: number;
    emailConnections: number;
    customLabels: number;
  };
  percentage: {
    aiSummaries: number;
    aiReplies: number;
    aiClassifications: number;
    emailConnections: number;
    customLabels: number;
  };
  resetDate: string;
}

// -----------------------------------------------------------------------------
// Payment History
// -----------------------------------------------------------------------------
export interface PaymentHistory {
  id: string;
  userId: string;
  subscriptionId?: string;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  paidAt?: string;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// Checkout/Portal
// -----------------------------------------------------------------------------
export interface CreateCheckoutInput {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  url: string;
  sessionId: string;
}

export interface PortalSession {
  url: string;
}

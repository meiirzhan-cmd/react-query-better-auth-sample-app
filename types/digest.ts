// =============================================================================
// Digest Types
// =============================================================================
// Types for daily digest generation and delivery
// =============================================================================

// -----------------------------------------------------------------------------
// Digest Status & Frequency
// -----------------------------------------------------------------------------
export type DigestStatus =
  | "pending"
  | "generating"
  | "ready"
  | "sent"
  | "viewed"
  | "failed";

export type DigestFrequency = "daily" | "weekdays" | "weekly" | "disabled";

// -----------------------------------------------------------------------------
// Digest Settings
// -----------------------------------------------------------------------------
export interface DigestSettings {
  id: string;
  userId: string;
  frequency: DigestFrequency;
  deliveryTime: string; // HH:MM format
  timezone: string;
  weeklyDay: number; // 0=Sun, 1=Mon, etc.

  // Content preferences
  includeStats: boolean;
  includeUrgent: boolean;
  includeNeedsReply: boolean;
  includeFyi: boolean;
  includeNewsletter: boolean;
  maxMessages: number;

  // Delivery method
  sendEmail: boolean;
  sendPush: boolean;

  isEnabled: boolean;
  lastGeneratedAt?: string;
  nextScheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Digest
// -----------------------------------------------------------------------------
export interface Digest {
  id: string;
  userId: string;
  date: string;
  periodStart: string;
  periodEnd: string;
  title?: string;
  summary?: string;
  stats: DigestStats;
  highlights: DigestHighlights;
  topSenders: TopSender[];
  messageIds: string[];
  status: DigestStatus;
  generatedAt?: string;
  sentAt?: string;
  viewedAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Digest Stats
// -----------------------------------------------------------------------------
export interface DigestStats {
  totalMessages: number;
  unreadMessages: number;
  urgentCount: number;
  needsReplyCount: number;
  fyiCount: number;
  newsletterCount: number;
  processedCount: number;
}

// -----------------------------------------------------------------------------
// Digest Highlights
// -----------------------------------------------------------------------------
export interface DigestHighlights {
  urgent: DigestMessageHighlight[];
  needsReply: DigestMessageHighlight[];
  fyi: DigestMessageHighlight[];
}

export interface DigestMessageHighlight {
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
}

// -----------------------------------------------------------------------------
// Top Sender
// -----------------------------------------------------------------------------
export interface TopSender {
  email: string;
  name?: string;
  count: number;
}

// -----------------------------------------------------------------------------
// Digest Preview (for real-time preview)
// -----------------------------------------------------------------------------
export interface DigestPreview {
  periodStart: string;
  periodEnd: string;
  stats: DigestStats;
  highlights: DigestHighlights;
  topSenders: TopSender[];
}

// -----------------------------------------------------------------------------
// Update Settings Input
// -----------------------------------------------------------------------------
export interface UpdateDigestSettingsInput {
  frequency?: DigestFrequency;
  deliveryTime?: string;
  timezone?: string;
  weeklyDay?: number;
  includeStats?: boolean;
  includeUrgent?: boolean;
  includeNeedsReply?: boolean;
  includeFyi?: boolean;
  includeNewsletter?: boolean;
  maxMessages?: number;
  sendEmail?: boolean;
  sendPush?: boolean;
  isEnabled?: boolean;
}

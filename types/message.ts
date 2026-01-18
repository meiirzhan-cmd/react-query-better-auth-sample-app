// =============================================================================
// Message Types
// =============================================================================
// Types for emails, threads, and related entities
// =============================================================================

// -----------------------------------------------------------------------------
// Email Address
// -----------------------------------------------------------------------------
export interface EmailAddress {
  name?: string;
  email: string;
}

// -----------------------------------------------------------------------------
// Priority & Category
// -----------------------------------------------------------------------------
export type MessagePriority = "urgent" | "high" | "normal" | "low";

export type MessageCategory =
  | "needs_reply"
  | "fyi"
  | "newsletter"
  | "promotional"
  | "transactional"
  | "social"
  | "automated"
  | "personal"
  | "work"
  | "uncategorized";

export type MessageStatus = "unread" | "read" | "archived" | "trashed" | "spam";

// -----------------------------------------------------------------------------
// Attachment
// -----------------------------------------------------------------------------
export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

// -----------------------------------------------------------------------------
// Message
// -----------------------------------------------------------------------------
export interface Message {
  id: string;
  userId: string;
  connectionId: string;
  threadId?: string;
  externalId: string;
  externalThreadId?: string;
  internetMessageId?: string;

  // Headers
  subject?: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc: EmailAddress[];
  bcc: EmailAddress[];
  replyTo?: EmailAddress[];

  // Content
  snippet?: string;
  bodyText?: string;
  bodyHtml?: string;

  // Status
  status: MessageStatus;
  isStarred: boolean;
  isDraft: boolean;
  isSent: boolean;

  // Attachments
  hasAttachments: boolean;
  attachments: Attachment[];

  // AI Classification
  priority?: MessagePriority;
  category?: MessageCategory;
  aiProcessedAt?: string;

  // Timestamps
  receivedAt: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Thread
// -----------------------------------------------------------------------------
export interface Thread {
  id: string;
  userId: string;
  connectionId: string;
  externalId: string;

  // Metadata
  subject?: string;
  snippet?: string;
  messageCount: number;
  participants: EmailAddress[];

  // Status
  hasUnread: boolean;
  isStarred: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  isSpam: boolean;

  // AI Classification
  priority?: MessagePriority;
  primaryCategory?: MessageCategory;

  // Timestamps
  latestMessageAt: string;
  createdAt: string;
  updatedAt: string;

  // Relations (populated when needed)
  messages?: Message[];
  summary?: ThreadSummary;
}

// -----------------------------------------------------------------------------
// Message Summary (AI Generated)
// -----------------------------------------------------------------------------
export interface MessageSummary {
  id: string;
  messageId: string;
  userId: string;

  summary: string;
  summaryLength?: number;

  keyPoints: string[];
  actionItems: ActionItem[];
  questions: string[];

  sentiment?: Sentiment;
  sentimentScore?: number;

  entities?: ExtractedEntities;

  model: AIModel;
  modelVersion?: string;
  processingTimeMs?: number;

  status: ProcessingStatus;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Thread Summary (AI Generated)
// -----------------------------------------------------------------------------
export interface ThreadSummary {
  id: string;
  threadId: string;
  userId: string;

  summary: string;
  context?: string;

  participants: ThreadParticipant[];

  decisions: string[];
  openQuestions: string[];
  nextSteps: string[];

  overallSentiment?: Sentiment;
  sentimentTrend?: "improving" | "declining" | "stable";

  model: AIModel;
  messagesCovered?: number;
  lastMessageId?: string;

  status: ProcessingStatus;
  needsUpdate: boolean;

  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Reply Draft
// -----------------------------------------------------------------------------
export interface ReplyDraft {
  id: string;
  userId: string;
  messageId: string;

  subject?: string;
  bodyText?: string;
  bodyHtml?: string;

  isAiGenerated: boolean;
  aiModel?: string;
  aiPrompt?: string;
  tone?: ReplyTone;

  isSent: boolean;
  sentAt?: string;

  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Supporting Types
// -----------------------------------------------------------------------------
export interface ActionItem {
  text: string;
  completed?: boolean;
  dueDate?: string;
}

export interface ExtractedEntities {
  people?: string[];
  companies?: string[];
  dates?: string[];
  amounts?: string[];
  locations?: string[];
}

export interface ThreadParticipant {
  email: string;
  name?: string;
  messageCount: number;
  role?: "initiator" | "responder" | "cc";
}

export type Sentiment = "positive" | "neutral" | "negative" | "mixed";

export type AIModel =
  | "bart-large-cnn"
  | "flan-t5-base"
  | "flan-t5-large"
  | "gpt-3.5-turbo"
  | "claude-3-haiku"
  | "custom";

export type ProcessingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "skipped";

export type ReplyTone = "professional" | "casual" | "formal" | "friendly";

// -----------------------------------------------------------------------------
// Message with Relations (Enriched)
// -----------------------------------------------------------------------------
export interface MessageWithSummary extends Message {
  summary?: MessageSummary;
  labels?: LabelAssignment[];
  thread?: Thread;
}

export interface LabelAssignment {
  labelId: string;
  labelName: string;
  labelColor: string;
  source: "user" | "ai" | "rule" | "sync";
  confidence?: number;
  assignedAt: string;
}

// -----------------------------------------------------------------------------
// Message Filters & Sorting
// -----------------------------------------------------------------------------
export interface MessageFilters {
  status?: MessageStatus | MessageStatus[];
  priority?: MessagePriority | MessagePriority[];
  category?: MessageCategory | MessageCategory[];
  labelIds?: string[];
  connectionId?: string;
  search?: string;
  hasAttachments?: boolean;
  isStarred?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export type MessageSortField =
  | "receivedAt"
  | "sentAt"
  | "priority"
  | "from"
  | "subject";

export type SortOrder = "asc" | "desc";

export interface MessageSort {
  field: MessageSortField;
  order: SortOrder;
}

// -----------------------------------------------------------------------------
// Bulk Actions
// -----------------------------------------------------------------------------
export type BulkAction =
  | "archive"
  | "trash"
  | "markRead"
  | "markUnread"
  | "star"
  | "unstar"
  | "addLabel"
  | "removeLabel"
  | "markSpam";

export interface BulkActionPayload {
  action: BulkAction;
  messageIds: string[];
  labelId?: string; // For addLabel/removeLabel
}

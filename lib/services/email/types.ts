// =============================================================================
// Email Service Types
// =============================================================================
// Shared types for Gmail, Outlook, and other email providers
// =============================================================================

import {
  MessageFilters,
  MessageSort,
  MessageWithSummary,
} from "@/types/message";
import { gmail_v1 } from "googleapis";

// -----------------------------------------------------------------------------
// Email Address
// -----------------------------------------------------------------------------
export interface EmailAddress {
  name?: string;
  email: string;
}

// -----------------------------------------------------------------------------
// Gmail API Types
// -----------------------------------------------------------------------------
export type GmailMessage = gmail_v1.Schema$Message;
export type GmailThread = gmail_v1.Schema$Thread;
export type GmailLabel = gmail_v1.Schema$Label;

// -----------------------------------------------------------------------------
// Parsed Email (Provider-agnostic)
// -----------------------------------------------------------------------------
export interface ParsedEmail {
  id: string;
  threadId: string;
  externalId: string;
  historyId?: string;

  // Headers
  subject: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc: EmailAddress[];
  bcc: EmailAddress[];
  replyTo?: EmailAddress[];

  // Content
  snippet: string;
  bodyText?: string;
  bodyHtml?: string;

  // Gmail labels
  labelIds: string[];
  isUnread: boolean;
  isStarred: boolean;
  isTrash: boolean;
  isSpam: boolean;
  isDraft: boolean;
  isSent: boolean;

  // Attachments
  hasAttachments: boolean;
  attachments: ParsedAttachment[];

  // Timestamps
  internalDate: Date;

  // Message threading
  internetMessageId?: string;
  inReplyTo?: string;
  references?: string;

  // Size
  sizeEstimate: number;
}

// -----------------------------------------------------------------------------
// Parsed Attachment
// -----------------------------------------------------------------------------
export interface ParsedAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

// -----------------------------------------------------------------------------
// Sync Result
// -----------------------------------------------------------------------------
export interface SyncResult {
  success: boolean;
  messages: ParsedEmail[];
  newMessages: number;
  updatedMessages: number;
  deletedMessages: number;
  deletedMessageIds?: string[];
  historyId?: string;
  syncType: "full" | "incremental";
  durationMs: number;
  error?: string;
  requiresFullSync?: boolean;
}

// -----------------------------------------------------------------------------
// Sync Options
// -----------------------------------------------------------------------------
export interface SyncOptions {
  fullSync?: boolean;
  maxMessages?: number;
  query?: string;
  onProgress?: (progress: SyncProgress) => void;
}

export interface SyncProgress {
  phase: "listing" | "fetching" | "processing";
  current: number;
  total: number;
  message?: string;
}

// -----------------------------------------------------------------------------
// Email Provider Interface
// -----------------------------------------------------------------------------
export interface EmailProvider {
  // Connection
  connect(): Promise<{ authUrl: string }>;
  disconnect(): Promise<void>;
  refreshTokens(): Promise<void>;

  // Messages
  listMessages(options: ListMessagesOptions): Promise<ListMessagesResult>;
  getMessage(messageId: string): Promise<ParsedEmail>;
  getMessages(messageIds: string[]): Promise<ParsedEmail[]>;

  // Message Actions
  markAsRead(messageId: string): Promise<void>;
  markAsUnread(messageId: string): Promise<void>;
  star(messageId: string): Promise<void>;
  unstar(messageId: string): Promise<void>;
  archive(messageId: string): Promise<void>;
  trash(messageId: string): Promise<void>;
  delete(messageId: string): Promise<void>;

  // Bulk Actions
  batchMarkAsRead(messageIds: string[]): Promise<void>;
  batchArchive(messageIds: string[]): Promise<void>;
  batchTrash(messageIds: string[]): Promise<void>;

  // Send
  send(options: SendOptions): Promise<ParsedEmail>;
  reply(messageId: string, options: ReplyOptions): Promise<ParsedEmail>;

  // Sync
  fullSync(options?: SyncOptions): Promise<SyncResult>;
  incrementalSync(historyId: string): Promise<SyncResult>;

  // Labels
  listLabels(): Promise<ProviderLabel[]>;
  addLabel(messageId: string, labelId: string): Promise<void>;
  removeLabel(messageId: string, labelId: string): Promise<void>;
}

// -----------------------------------------------------------------------------
// List Messages
// -----------------------------------------------------------------------------
export interface ListMessagesOptions {
  maxResults?: number;
  pageToken?: string;
  query?: string;
  labelIds?: string[];
  folder?: string;
}

export interface ListMessagesResult {
  messages: ParsedEmail[];
  nextPageToken?: string;
  totalEstimate?: number;
}

// -----------------------------------------------------------------------------
// Send/Reply Options
// -----------------------------------------------------------------------------
export interface SendOptions {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  bodyHtml?: string;
  attachments?: SendAttachment[];
}

export interface ReplyOptions {
  body: string;
  bodyHtml?: string;
  replyAll?: boolean;
  attachments?: SendAttachment[];
}

export interface SendAttachment {
  filename: string;
  mimeType: string;
  content: Buffer | string;
}

export interface ListMessagesParams {
  page?: number;
  pageSize?: number;
  filters?: MessageFilters;
  sort?: MessageSort;
  folder?: string;
}

export interface ListMessagesResponse {
  success: boolean;
  data: MessageWithSummary[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface MessageResponse {
  success: boolean;
  data: MessageWithSummary;
}

export interface BulkActionResponse {
  success: boolean;
  data: {
    processed: number;
    failed: number;
    errors: { messageId: string; error: string }[];
  };
}

export interface SyncResponse {
  success: boolean;
  message: string;
  results: {
    connectionId: string;
    email: string;
    success: boolean;
    newMessages?: number;
    error?: string;
  }[];
}

// -----------------------------------------------------------------------------
// Provider Label
// -----------------------------------------------------------------------------
export interface ProviderLabel {
  id: string;
  name: string;
  type: "system" | "user";
  messageListVisibility?: "show" | "hide";
  labelListVisibility?: "labelShow" | "labelHide";
  color?: {
    textColor?: string;
    backgroundColor?: string;
  };
}

// -----------------------------------------------------------------------------
// Message Status Mapping
// -----------------------------------------------------------------------------
export type MessageStatusFromProvider =
  | "unread"
  | "read"
  | "archived"
  | "trashed"
  | "spam";

export function mapGmailLabelsToStatus(
  labelIds: string[],
): MessageStatusFromProvider {
  if (labelIds.includes("TRASH")) return "trashed";
  if (labelIds.includes("SPAM")) return "spam";
  if (!labelIds.includes("INBOX")) return "archived";
  if (labelIds.includes("UNREAD")) return "unread";
  return "read";
}

// -----------------------------------------------------------------------------
// Gmail Label IDs
// -----------------------------------------------------------------------------
export const GMAIL_SYSTEM_LABELS = {
  INBOX: "INBOX",
  SENT: "SENT",
  DRAFT: "DRAFT",
  SPAM: "SPAM",
  TRASH: "TRASH",
  UNREAD: "UNREAD",
  STARRED: "STARRED",
  IMPORTANT: "IMPORTANT",
  CATEGORY_PERSONAL: "CATEGORY_PERSONAL",
  CATEGORY_SOCIAL: "CATEGORY_SOCIAL",
  CATEGORY_PROMOTIONS: "CATEGORY_PROMOTIONS",
  CATEGORY_UPDATES: "CATEGORY_UPDATES",
  CATEGORY_FORUMS: "CATEGORY_FORUMS",
} as const;

// -----------------------------------------------------------------------------
// Error Types
// -----------------------------------------------------------------------------
export class EmailSyncError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider: string,
    public requiresReauth?: boolean,
  ) {
    super(message);
    this.name = "EmailSyncError";
  }
}

export class TokenExpiredError extends EmailSyncError {
  constructor(provider: string) {
    super("Access token expired", "TOKEN_EXPIRED", provider, true);
    this.name = "TokenExpiredError";
  }
}

export class RateLimitError extends EmailSyncError {
  constructor(provider: string, retryAfter?: number) {
    super(
      `Rate limit exceeded${retryAfter ? `, retry after ${retryAfter}s` : ""}`,
      "RATE_LIMITED",
      provider,
    );
    this.name = "RateLimitError";
  }
}

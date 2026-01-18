// =============================================================================
// API Types
// =============================================================================
// Types for API requests, responses, and error handling
// =============================================================================

// -----------------------------------------------------------------------------
// Generic API Response
// -----------------------------------------------------------------------------
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  field?: string; // For validation errors
}

export interface ResponseMeta {
  requestId?: string;
  timestamp?: string;
  duration?: number;
}

// -----------------------------------------------------------------------------
// Error Codes
// -----------------------------------------------------------------------------
export type ErrorCode =
  // Auth errors
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "SESSION_EXPIRED"
  | "INVALID_TOKEN"
  // Validation errors
  | "VALIDATION_ERROR"
  | "INVALID_INPUT"
  | "MISSING_FIELD"
  // Resource errors
  | "NOT_FOUND"
  | "ALREADY_EXISTS"
  | "CONFLICT"
  // Rate limiting
  | "RATE_LIMITED"
  | "QUOTA_EXCEEDED"
  // Provider errors
  | "PROVIDER_ERROR"
  | "SYNC_FAILED"
  | "TOKEN_EXPIRED"
  // AI errors
  | "AI_ERROR"
  | "AI_RATE_LIMITED"
  // Payment errors
  | "PAYMENT_FAILED"
  | "SUBSCRIPTION_REQUIRED"
  // Generic errors
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "UNKNOWN_ERROR";

// -----------------------------------------------------------------------------
// Paginated Response
// -----------------------------------------------------------------------------
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
  error?: ApiError;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  cursor?: string;
}

// -----------------------------------------------------------------------------
// List Request Params
// -----------------------------------------------------------------------------
export interface ListParams<
  TFilter = unknown,
  TSort = unknown,
> extends PaginationParams {
  filters?: TFilter;
  sort?: TSort;
  search?: string;
}

// -----------------------------------------------------------------------------
// WebSocket Events
// -----------------------------------------------------------------------------
export type WebSocketEvent =
  | { type: "message:new"; payload: { messageId: string; threadId?: string } }
  | { type: "message:updated"; payload: { messageId: string } }
  | { type: "message:deleted"; payload: { messageId: string } }
  | { type: "sync:started"; payload: { connectionId: string } }
  | {
      type: "sync:progress";
      payload: { connectionId: string; progress: number };
    }
  | {
      type: "sync:completed";
      payload: { connectionId: string; newMessages: number };
    }
  | { type: "sync:failed"; payload: { connectionId: string; error: string } }
  | { type: "ai:processing"; payload: { messageId: string } }
  | { type: "ai:completed"; payload: { messageId: string } }
  | { type: "digest:ready"; payload: { digestId: string } }
  | {
      type: "connection:status";
      payload: { connectionId: string; status: string };
    }
  | { type: "subscription:updated"; payload: { plan: string } };

// -----------------------------------------------------------------------------
// Request Configuration
// -----------------------------------------------------------------------------
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
}

// -----------------------------------------------------------------------------
// Batch Request/Response
// -----------------------------------------------------------------------------
export interface BatchRequest<T = unknown> {
  id: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  body?: T;
}

export interface BatchResponse<T = unknown> {
  id: string;
  status: number;
  data?: T;
  error?: ApiError;
}

// -----------------------------------------------------------------------------
// API Endpoints Type Map
// -----------------------------------------------------------------------------
export interface ApiEndpoints {
  // Messages
  "GET /api/messages": {
    params: ListParams<MessageFiltersParam, MessageSortParam>;
    response: PaginatedResponse<MessageListResponse>;
  };
  "GET /api/messages/:id": {
    params: { id: string };
    response: ApiResponse<MessageDetailResponse>;
  };
  "PATCH /api/messages/:id": {
    params: { id: string };
    body: UpdateMessageInput;
    response: ApiResponse<MessageDetailResponse>;
  };
  "DELETE /api/messages/:id": {
    params: { id: string };
    response: ApiResponse<void>;
  };
  "POST /api/messages/bulk": {
    body: BulkMessagesInput;
    response: ApiResponse<BulkActionResult>;
  };
  "POST /api/messages/:id/summarize": {
    params: { id: string };
    response: ApiResponse<SummarizeResponse>;
  };
  "POST /api/messages/:id/reply": {
    params: { id: string };
    body: GenerateReplyInput;
    response: ApiResponse<ReplyDraftResponse>;
  };

  // Connections
  "GET /api/connections": {
    response: ApiResponse<ConnectionListResponse>;
  };
  "POST /api/connections/:provider/connect": {
    params: { provider: string };
    response: ApiResponse<{ authUrl: string }>;
  };
  "DELETE /api/connections/:id": {
    params: { id: string };
    response: ApiResponse<void>;
  };
  "POST /api/messages/sync": {
    body: SyncInput;
    response: ApiResponse<SyncResponse>;
  };

  // Labels
  "GET /api/labels": {
    response: ApiResponse<LabelListResponse>;
  };
  "POST /api/labels": {
    body: CreateLabelInput;
    response: ApiResponse<LabelResponse>;
  };
  "PATCH /api/labels/:id": {
    params: { id: string };
    body: UpdateLabelInput;
    response: ApiResponse<LabelResponse>;
  };
  "DELETE /api/labels/:id": {
    params: { id: string };
    response: ApiResponse<void>;
  };

  // Billing
  "GET /api/billing/usage": {
    response: ApiResponse<UsageResponse>;
  };
  "POST /api/billing/checkout": {
    body: CheckoutInput;
    response: ApiResponse<CheckoutResponse>;
  };
  "POST /api/billing/portal": {
    response: ApiResponse<PortalResponse>;
  };
}

// -----------------------------------------------------------------------------
// Request/Response Types (abbreviated)
// -----------------------------------------------------------------------------
export interface MessageFiltersParam {
  status?: string;
  priority?: string;
  category?: string;
  labelIds?: string;
  search?: string;
}

export interface MessageSortParam {
  field?: string;
  order?: "asc" | "desc";
}

export interface MessageListResponse {
  id: string;
  from: { name?: string; email: string };
  subject?: string;
  snippet?: string;
  receivedAt: string;
  status: string;
  isStarred: boolean;
  hasAttachments: boolean;
  priority?: string;
  category?: string;
  summary?: string;
}

export interface MessageDetailResponse {
  id: string;
  subject?: string;
  from: { name?: string; email: string };
  to: { name?: string; email: string }[];
  cc?: { name?: string; email: string }[];
  bodyHtml?: string;
  bodyText?: string;
  receivedAt: string;
  attachments: { id: string; filename: string; size: number }[];
  summary?: {
    summary: string;
    keyPoints: string[];
    actionItems: { text: string; completed?: boolean }[];
  };
}

export interface UpdateMessageInput {
  status?: string;
  isStarred?: boolean;
  labelIds?: string[];
}

export interface BulkMessagesInput {
  messageIds: string[];
  action: string;
  labelId?: string;
}

export interface BulkActionResult {
  processed: number;
  failed: number;
  errors?: { messageId: string; error: string }[];
}

export interface SummarizeResponse {
  summary: string;
  keyPoints: string[];
  actionItems: { text: string }[];
  sentiment: string;
}

export interface GenerateReplyInput {
  tone?: string;
  context?: string;
}

export interface ReplyDraftResponse {
  id: string;
  subject: string;
  body: string;
  tone: string;
}

export interface ConnectionListResponse {
  id: string;
  provider: string;
  email: string;
  status: string;
  lastSyncAt?: string;
}

export interface SyncInput {
  connectionId?: string;
  fullSync?: boolean;
}

export interface SyncResponse {
  started: boolean;
  estimatedMessages?: number;
}

export interface LabelListResponse {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon?: string;
  type: string;
  messageCount: number;
  unreadCount: number;
}

export interface CreateLabelInput {
  name: string;
  color: string;
  icon?: string;
}

export interface UpdateLabelInput {
  name?: string;
  color?: string;
  icon?: string;
}

export interface LabelResponse {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export interface UsageResponse {
  plan: string;
  used: Record<string, number>;
  limits: Record<string, number>;
  resetDate: string;
}

export interface CheckoutInput {
  priceId: string;
}

export interface CheckoutResponse {
  url: string;
}

export interface PortalResponse {
  url: string;
}

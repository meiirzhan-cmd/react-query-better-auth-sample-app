// =============================================================================
// Label Types
// =============================================================================
// Types for system, smart, and custom labels
// =============================================================================

// -----------------------------------------------------------------------------
// Label Type
// -----------------------------------------------------------------------------
export type LabelType = "system" | "smart" | "custom";
export type LabelAssignmentSource = "user" | "ai" | "rule" | "sync";

// -----------------------------------------------------------------------------
// Label
// -----------------------------------------------------------------------------
export interface Label {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  type: LabelType;
  isVisible: boolean;
  showInFilters: boolean;
  sortOrder: number;
  aiCriteria?: string;
  messageCount: number;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// System Labels
// -----------------------------------------------------------------------------
export const SYSTEM_LABELS = {
  inbox: { name: "Inbox", slug: "inbox", icon: "inbox", color: "#3B82F6" },
  sent: { name: "Sent", slug: "sent", icon: "send", color: "#10B981" },
  drafts: {
    name: "Drafts",
    slug: "drafts",
    icon: "file-edit",
    color: "#F59E0B",
  },
  starred: { name: "Starred", slug: "starred", icon: "star", color: "#EAB308" },
  archive: {
    name: "Archive",
    slug: "archive",
    icon: "archive",
    color: "#6B7280",
  },
  spam: { name: "Spam", slug: "spam", icon: "alert-octagon", color: "#EF4444" },
  trash: { name: "Trash", slug: "trash", icon: "trash-2", color: "#6B7280" },
} as const;

export type SystemLabelSlug = keyof typeof SYSTEM_LABELS;

// -----------------------------------------------------------------------------
// Smart Labels
// -----------------------------------------------------------------------------
export const SMART_LABELS = {
  urgent: {
    name: "Urgent",
    slug: "urgent",
    icon: "alert-circle",
    color: "#EF4444",
    aiCriteria: "Time-sensitive messages requiring immediate attention",
  },
  "needs-reply": {
    name: "Needs Reply",
    slug: "needs-reply",
    icon: "reply",
    color: "#F97316",
    aiCriteria: "Messages with questions or requests that need a response",
  },
  fyi: {
    name: "FYI",
    slug: "fyi",
    icon: "info",
    color: "#3B82F6",
    aiCriteria: "Informational messages that don't require action",
  },
  newsletter: {
    name: "Newsletter",
    slug: "newsletter",
    icon: "newspaper",
    color: "#8B5CF6",
    aiCriteria: "Newsletter subscriptions and periodic updates",
  },
  promotional: {
    name: "Promotional",
    slug: "promotional",
    icon: "tag",
    color: "#EC4899",
    aiCriteria: "Marketing emails, deals, and promotional content",
  },
} as const;

export type SmartLabelSlug = keyof typeof SMART_LABELS;

// -----------------------------------------------------------------------------
// Label Rule
// -----------------------------------------------------------------------------
export interface LabelRule {
  id: string;
  userId: string;
  labelId: string;
  name: string;
  description?: string;
  conditions: RuleConditions;
  isActive: boolean;
  applyToExisting: boolean;
  priority: number;
  timesApplied: number;
  lastAppliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RuleConditions {
  match: "all" | "any";
  conditions: RuleCondition[];
}

export interface RuleCondition {
  field: "from" | "to" | "subject" | "body";
  operator: RuleConditionOperator;
  value: string;
  caseSensitive?: boolean;
}

export type RuleConditionOperator =
  | "equals"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "regex"
  | "notEquals"
  | "notContains";

// -----------------------------------------------------------------------------
// Label Assignment
// -----------------------------------------------------------------------------
export interface MessageLabelAssignment {
  messageId: string;
  labelId: string;
  source: LabelAssignmentSource;
  confidence?: number;
  assignedAt: string;
}

// -----------------------------------------------------------------------------
// Create/Update DTOs
// -----------------------------------------------------------------------------
export interface CreateLabelInput {
  name: string;
  color: string;
  icon?: string;
  description?: string;
}

export interface UpdateLabelInput {
  name?: string;
  color?: string;
  icon?: string;
  description?: string;
  isVisible?: boolean;
  showInFilters?: boolean;
  sortOrder?: number;
}

export interface CreateLabelRuleInput {
  labelId: string;
  name: string;
  description?: string;
  conditions: RuleConditions;
  applyToExisting?: boolean;
  priority?: number;
}

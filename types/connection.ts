// =============================================================================
// Connection Types
// =============================================================================
// Types for email provider connections (Gmail, Outlook)
// =============================================================================

// -----------------------------------------------------------------------------
// Email Provider
// -----------------------------------------------------------------------------
export type EmailProvider = "gmail" | "outlook" | "mock";

export type ConnectionStatus =
  | "active"
  | "expired"
  | "revoked"
  | "error"
  | "disconnected";

// -----------------------------------------------------------------------------
// Email Connection
// -----------------------------------------------------------------------------
export interface EmailConnection {
  id: string;
  userId: string;
  provider: EmailProvider;
  email: string;
  displayName?: string;
  status: ConnectionStatus;
  isDefault: boolean;
  syncEnabled: boolean;
  lastSyncAt?: string;
  lastSyncError?: string;
  syncErrorCount: number;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Sync History
// -----------------------------------------------------------------------------
export interface SyncHistory {
  id: string;
  connectionId: string;
  syncType: SyncType;
  status: SyncStatus;
  messagesProcessed: number;
  newMessages: number;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
}

export type SyncType = "full" | "incremental" | "manual";
export type SyncStatus = "started" | "completed" | "failed";

// -----------------------------------------------------------------------------
// Provider Metadata
// -----------------------------------------------------------------------------
export const PROVIDER_METADATA: Record<
  EmailProvider,
  {
    name: string;
    icon: string;
    color: string;
    description: string;
    scopes: string[];
  }
> = {
  gmail: {
    name: "Gmail",
    icon: "mail",
    color: "#EA4335",
    description: "Connect your Google Gmail account",
    scopes: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.labels",
    ],
  },
  outlook: {
    name: "Outlook",
    icon: "mail",
    color: "#0078D4",
    description: "Connect your Microsoft Outlook account",
    scopes: ["Mail.Read", "Mail.ReadWrite", "Mail.Send"],
  },
  mock: {
    name: "Mock Provider",
    icon: "test-tube",
    color: "#6B7280",
    description: "Development testing provider",
    scopes: [],
  },
};

// -----------------------------------------------------------------------------
// Connection Actions
// -----------------------------------------------------------------------------
export interface ConnectProviderInput {
  provider: EmailProvider;
  redirectUrl?: string;
}

export interface DisconnectConnectionInput {
  connectionId: string;
  removeData?: boolean;
}

export interface SyncConnectionInput {
  connectionId: string;
  fullSync?: boolean;
}

// -----------------------------------------------------------------------------
// Connection Stats
// -----------------------------------------------------------------------------
export interface ConnectionStats {
  connectionId: string;
  totalMessages: number;
  unreadMessages: number;
  lastSyncAt?: string;
  syncStatus: ConnectionStatus;
  messagesThisMonth: number;
}

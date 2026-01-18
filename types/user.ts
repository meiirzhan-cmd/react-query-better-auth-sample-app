// =============================================================================
// User Types
// =============================================================================
// Types for users, sessions, and preferences
// =============================================================================

// -----------------------------------------------------------------------------
// User
// -----------------------------------------------------------------------------
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  timezone?: string;
  digestTime?: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Session
// -----------------------------------------------------------------------------
export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Auth State (for client)
// -----------------------------------------------------------------------------
export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// -----------------------------------------------------------------------------
// User Preferences
// -----------------------------------------------------------------------------
export interface UserPreferences {
  // Theme
  theme: "light" | "dark" | "system";

  // Notifications
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    urgentOnly: boolean;
  };

  // Inbox settings
  inbox: {
    defaultView: InboxView;
    messagesPerPage: number;
    showSnippets: boolean;
    groupByThread: boolean;
    autoMarkRead: boolean;
    autoMarkReadDelay: number; // seconds
    confirmBeforeArchive: boolean;
    confirmBeforeDelete: boolean;
  };

  // AI settings
  ai: {
    autoSummarize: boolean;
    autoClassify: boolean;
    suggestReplies: boolean;
    defaultReplyTone: "professional" | "casual" | "formal" | "friendly";
  };

  // Keyboard shortcuts
  keyboardShortcuts: boolean;
}

export type InboxView = "list" | "split" | "conversation";

// -----------------------------------------------------------------------------
// Default Preferences
// -----------------------------------------------------------------------------
export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "system",
  notifications: {
    email: true,
    push: false,
    desktop: true,
    urgentOnly: false,
  },
  inbox: {
    defaultView: "split",
    messagesPerPage: 25,
    showSnippets: true,
    groupByThread: true,
    autoMarkRead: true,
    autoMarkReadDelay: 3,
    confirmBeforeArchive: false,
    confirmBeforeDelete: true,
  },
  ai: {
    autoSummarize: true,
    autoClassify: true,
    suggestReplies: true,
    defaultReplyTone: "professional",
  },
  keyboardShortcuts: true,
};

// -----------------------------------------------------------------------------
// Onboarding State
// -----------------------------------------------------------------------------
export interface OnboardingState {
  completed: boolean;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  skippedSteps: OnboardingStep[];
}

export type OnboardingStep =
  | "welcome"
  | "connect-email"
  | "initial-sync"
  | "setup-preferences"
  | "tour"
  | "complete";

// -----------------------------------------------------------------------------
// Update User Input
// -----------------------------------------------------------------------------
export interface UpdateUserInput {
  name?: string;
  image?: string;
  timezone?: string;
  digestTime?: string;
}

export interface UpdatePreferencesInput {
  theme?: UserPreferences["theme"];
  notifications?: Partial<UserPreferences["notifications"]>;
  inbox?: Partial<UserPreferences["inbox"]>;
  ai?: Partial<UserPreferences["ai"]>;
  keyboardShortcuts?: boolean;
}

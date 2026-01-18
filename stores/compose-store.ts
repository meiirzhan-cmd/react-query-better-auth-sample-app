// =============================================================================
// Compose Store
// =============================================================================
// Email composition, drafts, and AI reply suggestions
// =============================================================================

import { EmailAddress } from "@/schemas";
import { Attachment, ReplyTone } from "@/types/message";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type ComposeMode = "new" | "reply" | "replyAll" | "forward";

export interface ComposeDraft {
  id: string;
  mode: ComposeMode;

  //Original message reference (for reply/forward)
  replyToMessageId?: string;
  replyToThreadId?: string;

  //Recipients
  to: EmailAddress[];
  cc: EmailAddress[];
  bcc: EmailAddress[];

  //Content
  subject: string;
  body: string;
  bodyHtml?: string;

  //Attachments
  attachments: Attachment[];

  //AI
  aiSuggestion?: string;
  aiTone?: ReplyTone;

  //Status
  isDirty: boolean;
  lastSavedAt?: string;

  //Connection (which email account to send from)
  connectionId?: string;
}

export interface ContactSuggestion {
  email: string;
  name?: string;
  frequency: number;
  lastContactedAt?: string;
}

// -----------------------------------------------------------------------------
// State Interface
// -----------------------------------------------------------------------------
interface ComposeState {
  // Compose window
  isComposeOpen: boolean;
  activeDraft: ComposeDraft | null;

  // Multiple drafts
  drafts: Map<string, ComposeDraft>;
  savingDraftId: string | null;

  // AI suggestions
  isGeneratingAi: boolean;
  aiSuggestion: string | null;
  aiError: string | null;
  selectedTone: ReplyTone;

  // Send state
  isSending: boolean;
  sendError: string | null;

  // Contact autocomplete
  recentContacts: ContactSuggestion[];
  suggestedContacts: ContactSuggestion[];
  isLoadingContacts: boolean;

  // Expanded state
  isMinimized: boolean;
  isFullscreen: boolean;
}

type fieldType = "to" | "cc" | "bcc";

// -----------------------------------------------------------------------------
// Actions Interface
// -----------------------------------------------------------------------------
interface ComposeActions {
  //Compose window actions
  openCompose: (options?: {
    mode?: ComposeMode;
    replyToMessageId?: string;
    replyToThreadId?: string;
    to?: EmailAddress[];
    subject?: string;
    body?: string;
    connectionId?: string;
  }) => void;
  closeCompose: (saveDraft?: boolean) => void;
  minimizeCompose: () => void;
  maximizeCompose: () => void;
  toggleFullscreen: () => void;

  //Draft actions
  createDraft: (mode?: ComposeMode) => string;
  updateDraft: (updates: Partial<ComposeDraft>) => void;
  saveDraft: () => Promise<void>;
  deleteDraft: (id: string) => void;
  loadDraft: (id: string) => void;

  //Recipient actions
  addRecipient: (field: fieldType, recipient: EmailAddress) => void;
  removeRecipient: (field: fieldType, email: string) => void;
  clearRecipients: (field: fieldType) => void;

  // Content actions
  setSubject: (subject: string) => void;
  setBody: (body: string) => void;
  setBodyHtml: (html: string) => void;

  // Attachment actions
  addAttachment: (attachment: Attachment) => void;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;

  // AI actions
  requestAiSuggestion: (messageId: string, tone?: ReplyTone) => Promise<void>;
  applyAiSuggestion: () => void;
  clearAiSuggestion: () => void;
  setSelectedTone: (tone: ReplyTone) => void;

  // Send actions
  sendEmail: () => Promise<boolean>;

  // Contact actions
  searchContacts: (query: string) => Promise<void>;
  setRecentContacts: (contacts: ContactSuggestion[]) => void;

  // Reset
  reset: () => void;
}

// -----------------------------------------------------------------------------
// Initial State
// -----------------------------------------------------------------------------
const initialState: ComposeState = {
  isComposeOpen: false,
  activeDraft: null,

  drafts: new Map(),
  savingDraftId: null,

  isGeneratingAi: false,
  aiSuggestion: null,
  aiError: null,
  selectedTone: "professional",

  isSending: false,
  sendError: null,

  recentContacts: [],
  suggestedContacts: [],
  isLoadingContacts: false,

  isMinimized: false,
  isFullscreen: false,
};

const createEmptyDraft = (mode: ComposeMode = "new"): ComposeDraft => ({
  id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  mode,
  to: [],
  cc: [],
  bcc: [],
  subject: "",
  body: "",
  attachments: [],
  isDirty: false,
});

// -----------------------------------------------------------------------------
// Store
// -----------------------------------------------------------------------------
export const useComposeStore = create<ComposeState & ComposeActions>()(
  devtools(
    (set, get) => ({
      ...initialState,
      // Compose window actions
      openCompose: (options = {}) => {
        const draft = createEmptyDraft(options.mode ?? "new");

        if (options.replyToMessageId) {
          draft.replyToMessageId = options.replyToMessageId;
        }
        if (options.replyToThreadId) {
          draft.replyToThreadId = options.replyToThreadId;
        }
        if (options.to) {
          draft.to = options.to;
        }
        if (options.subject) {
          draft.subject = options.subject;
        }
        if (options.body) {
          draft.body = options.body;
        }
        if (options.connectionId) {
          draft.connectionId = options.connectionId;
        }

        set({
          isComposeOpen: true,
          activeDraft: draft,
          isMinimized: false,
          aiSuggestion: null,
          aiError: null,
          sendError: null,
        });
      },

      closeCompose: (saveDraft = true) => {
        const { activeDraft, drafts } = get();

        if (saveDraft && activeDraft && activeDraft.isDirty) {
          // Save draft before closing
          drafts.set(activeDraft.id, activeDraft);
          set({ drafts: new Map(drafts) });
        }

        set({
          isComposeOpen: false,
          activeDraft: null,
          isMinimized: false,
          isFullscreen: false,
          aiSuggestion: null,
          aiError: null,
          sendError: null,
        });
      },

      minimizeCompose: () => set({ isMinimized: true }),

      maximizeCompose: () => set({ isMinimized: false }),

      toggleFullscreen: () =>
        set((state) => ({ isFullscreen: !state.isFullscreen })),

      // Draft actions
      createDraft: (mode = "new") => {
        const draft = createEmptyDraft(mode);
        const { drafts } = get();
        drafts.set(draft.id, draft);
        set({ drafts: new Map(drafts) });
        return draft.id;
      },

      updateDraft: (updates) =>
        set((state) => {
          if (!state.activeDraft) return state;
          return {
            activeDraft: {
              ...state.activeDraft,
              ...updates,
              isDirty: true,
            },
          };
        }),

      saveDraft: async () => {
        const { activeDraft, drafts } = get();
        if (!activeDraft) return;

        set({ savingDraftId: activeDraft.id });

        try {
          // TODO: Save to server
          await new Promise((resolve) => setTimeout(resolve, 500));

          const updatedDraft = {
            ...activeDraft,
            lastSavedAt: new Date().toISOString(),
            isDirty: false,
          };

          drafts.set(activeDraft.id, updatedDraft);
          set({
            drafts: new Map(drafts),
            activeDraft: updatedDraft,
            savingDraftId: null,
          });
        } catch {
          set({ savingDraftId: null });
          throw new Error("Failed to save draft");
        }
      },

      deleteDraft: (id) => {
        const { drafts, activeDraft } = get();
        drafts.delete(id);
        set({
          drafts: new Map(drafts),
          activeDraft: activeDraft?.id === id ? null : activeDraft,
          isComposeOpen: activeDraft?.id === id ? false : get().isComposeOpen,
        });
      },

      loadDraft: (id) => {
        const { drafts } = get();
        const draft = drafts.get(id);
        if (draft) {
          set({
            activeDraft: draft,
            isComposeOpen: true,
            isMinimized: false,
          });
        }
      },

      // Recipient actions
      addRecipient: (field, recipient) =>
        set((state) => {
          if (!state.activeDraft) return state;
          const existing = state.activeDraft[field].find(
            (r) => r.email === recipient.email,
          );
          if (existing) return state;
          return {
            activeDraft: {
              ...state.activeDraft,
              [field]: [...state.activeDraft[field], recipient],
              isDirty: true,
            },
          };
        }),

      removeRecipient: (field, email) =>
        set((state) => {
          if (!state.activeDraft) return state;
          return {
            activeDraft: {
              ...state.activeDraft,
              [field]: state.activeDraft[field].filter(
                (r) => r.email !== email,
              ),
              isDirty: true,
            },
          };
        }),

      clearRecipients: (field) =>
        set((state) => {
          if (!state.activeDraft) return state;
          return {
            activeDraft: {
              ...state.activeDraft,
              [field]: [],
              isDirty: true,
            },
          };
        }),

      // Content actions
      setSubject: (subject) =>
        set((state) => {
          if (!state.activeDraft) return state;
          return {
            activeDraft: {
              ...state.activeDraft,
              subject,
              isDirty: true,
            },
          };
        }),

      setBody: (body) =>
        set((state) => {
          if (!state.activeDraft) return state;
          return {
            activeDraft: {
              ...state.activeDraft,
              body,
              isDirty: true,
            },
          };
        }),

      setBodyHtml: (html) =>
        set((state) => {
          if (!state.activeDraft) return state;
          return {
            activeDraft: {
              ...state.activeDraft,
              bodyHtml: html,
              isDirty: true,
            },
          };
        }),

      // Attachment actions
      addAttachment: (attachment) =>
        set((state) => {
          if (!state.activeDraft) return state;
          return {
            activeDraft: {
              ...state.activeDraft,
              attachments: [...state.activeDraft.attachments, attachment],
              isDirty: true,
            },
          };
        }),

      removeAttachment: (id) =>
        set((state) => {
          if (!state.activeDraft) return state;
          return {
            activeDraft: {
              ...state.activeDraft,
              attachments: state.activeDraft.attachments.filter(
                (a) => a.id !== id,
              ),
              isDirty: true,
            },
          };
        }),

      clearAttachments: () =>
        set((state) => {
          if (!state.activeDraft) return state;
          return {
            activeDraft: {
              ...state.activeDraft,
              attachments: [],
              isDirty: true,
            },
          };
        }),

      // AI actions
      requestAiSuggestion: async (messageId, tone) => {
        const selectedTone = tone ?? get().selectedTone;
        set({
          isGeneratingAi: true,
          aiError: null,
          selectedTone,
        });

        try {
          // TODO: Call AI API
          await new Promise((resolve) => setTimeout(resolve, 1500));

          const mockSuggestion = `Thank you for your email. I've reviewed the details and would be happy to discuss this further. Please let me know your availability for a call this week.\n\nBest regards`;

          set({
            isGeneratingAi: false,
            aiSuggestion: mockSuggestion,
          });
        } catch (error) {
          set({
            isGeneratingAi: false,
            aiError:
              error instanceof Error
                ? error.message
                : "Failed to generate suggestion",
          });
        }
      },

      applyAiSuggestion: () => {
        const { aiSuggestion, activeDraft } = get();
        if (!aiSuggestion || !activeDraft) return;

        set({
          activeDraft: {
            ...activeDraft,
            body: aiSuggestion,
            aiSuggestion,
            aiTone: get().selectedTone,
            isDirty: true,
          },
          aiSuggestion: null,
        });
      },

      clearAiSuggestion: () => set({ aiSuggestion: null, aiError: null }),

      setSelectedTone: (tone) => set({ selectedTone: tone }),

      // Send actions
      sendEmail: async () => {
        const { activeDraft } = get();
        if (!activeDraft) return false;

        // Validation
        if (activeDraft.to.length === 0) {
          set({ sendError: "Please add at least one recipient" });
          return false;
        }

        if (!activeDraft.subject.trim()) {
          set({ sendError: "Please add a subject" });
          return false;
        }

        set({ isSending: true, sendError: null });

        try {
          // TODO: Call send API
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Remove from drafts and close
          const { drafts } = get();
          drafts.delete(activeDraft.id);

          set({
            isSending: false,
            drafts: new Map(drafts),
            isComposeOpen: false,
            activeDraft: null,
          });

          return true;
        } catch (error) {
          set({
            isSending: false,
            sendError:
              error instanceof Error ? error.message : "Failed to send email",
          });
          return false;
        }
      },

      // Contact actions
      searchContacts: async (query) => {
        if (!query.trim()) {
          set({ suggestedContacts: [], isLoadingContacts: false });
          return;
        }

        set({ isLoadingContacts: true });

        try {
          // TODO: Call contacts API
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Mock suggestions
          const mockContacts: ContactSuggestion[] = [
            { email: "john@example.com", name: "John Doe", frequency: 5 },
            { email: "jane@example.com", name: "Jane Smith", frequency: 3 },
          ].filter(
            (c) =>
              c.email.includes(query.toLowerCase()) ||
              c.name?.toLowerCase().includes(query.toLowerCase()),
          );

          set({
            suggestedContacts: mockContacts,
            isLoadingContacts: false,
          });
        } catch {
          set({ isLoadingContacts: false });
        }
      },

      setRecentContacts: (contacts) => set({ recentContacts: contacts }),

      // Reset
      reset: () => set(initialState),
    }),
    { name: "ComposeStore" },
  ),
);

// -----------------------------------------------------------------------------
// Selectors
// -----------------------------------------------------------------------------
export const selectDraftCount = (state: ComposeState) => state.drafts.size;

export const selectCanSend = (state: ComposeState) =>
  state.activeDraft !== null &&
  state.activeDraft.to.length > 0 &&
  state.activeDraft.subject.trim().length > 0 &&
  !state.isSending;

export const selectHasUnsavedChanges = (state: ComposeState) =>
  state.activeDraft?.isDirty ?? false;

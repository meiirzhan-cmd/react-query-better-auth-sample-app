// =============================================================================
// UI Store
// =============================================================================
// Global UI state management: sidebar, modals, toasts, command palette
// =============================================================================

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export type SidebarView = "default" | "collapsed" | "hidden";

export type ModalType =
  | "compose"
  | "settings"
  | "labelCreate"
  | "labelEdit"
  | "connectionAdd"
  | "confirmDelete"
  | "confirmArchive"
  | "upgrade"
  | "keyboardShortcuts"
  | "messageDetail"
  | "search";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info" | "loading";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

export interface Modal {
  type: ModalType;
  props?: Record<string, unknown>;
}

// -----------------------------------------------------------------------------
// State Interface
// -----------------------------------------------------------------------------
interface UIState {
  // Sidebar
  sidebarView: SidebarView;
  sidebarWidth: number;
  isMobileSidebarOpen: boolean;
  collapsedSections: string[];

  // Command Palette
  isCommandPaletteOpen: boolean;
  commandPaletteQuery: string;

  // Modals
  activeModal: Modal | null;
  modalStack: Modal[];

  // Toasts
  toasts: Toast[];

  // Search
  globalSearchQuery: string;
  isSearchFocused: boolean;

  // Layout
  isCompactMode: boolean;
  showMessagePreview: boolean;
  messageListWidth: number;

  // Loading
  isGlobalLoading: boolean;
  loadingMessage: string | null;

  // Theme (persisted)
  theme: "light" | "dark" | "system";
}

// -----------------------------------------------------------------------------
// Actions Interface
// -----------------------------------------------------------------------------
interface UIActions {
  // Sidebar actions
  setSidebarView: (view: SidebarView) => void;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleSection: (sectionId: string) => void;

  // Command Palette actions
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  setCommandPaletteQuery: (query: string) => void;

  // Modal actions
  openModal: (modal: Modal) => void;
  closeModal: () => void;
  closeAllModals: () => void;
  pushModal: (modal: Modal) => void;
  popModal: () => void;

  // Toast actions
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Search actions
  setGlobalSearchQuery: (query: string) => void;
  setSearchFocused: (focused: boolean) => void;
  clearSearch: () => void;

  // Layout actions
  toggleCompactMode: () => void;
  toggleMessagePreview: () => void;
  setMessageListWidth: (width: number) => void;

  // Loading actions
  setGlobalLoading: (loading: boolean, message?: string) => void;

  // Theme actions
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Reset
  reset: () => void;
}

// -----------------------------------------------------------------------------
// Initial State
// -----------------------------------------------------------------------------
const initialState: UIState = {
  sidebarView: "default",
  sidebarWidth: 256,
  isMobileSidebarOpen: false,
  collapsedSections: [],

  isCommandPaletteOpen: false,
  commandPaletteQuery: "",

  activeModal: null,
  modalStack: [],

  toasts: [],

  globalSearchQuery: "",
  isSearchFocused: false,

  isCompactMode: false,
  showMessagePreview: true,
  messageListWidth: 384,

  isGlobalLoading: false,
  loadingMessage: null,

  theme: "system",
};

// -----------------------------------------------------------------------------
// Store
// -----------------------------------------------------------------------------
export const useUIStore = create<UIState & UIActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Sidebar actions
        setSidebarView: (view) => set({ sidebarView: view }),

        toggleSidebar: () =>
          set((state) => ({
            sidebarView:
              state.sidebarView === "collapsed" ? "default" : "collapsed",
          })),

        setSidebarWidth: (width) => set({ sidebarWidth: width }),

        toggleMobileSidebar: () =>
          set((state) => ({
            isMobileSidebarOpen: !state.isMobileSidebarOpen,
          })),

        setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),

        toggleSection: (sectionId) =>
          set((state) => ({
            collapsedSections: state.collapsedSections.includes(sectionId)
              ? state.collapsedSections.filter((id) => id !== sectionId)
              : [...state.collapsedSections, sectionId],
          })),

        // Command Palette actions
        openCommandPalette: () =>
          set({ isCommandPaletteOpen: true, commandPaletteQuery: "" }),

        closeCommandPalette: () =>
          set({ isCommandPaletteOpen: false, commandPaletteQuery: "" }),

        toggleCommandPalette: () =>
          set((state) => ({
            isCommandPaletteOpen: !state.isCommandPaletteOpen,
            commandPaletteQuery: "",
          })),

        setCommandPaletteQuery: (query) => set({ commandPaletteQuery: query }),

        // Modal actions
        openModal: (modal) => set({ activeModal: modal }),

        closeModal: () => {
          const { modalStack } = get();
          if (modalStack.length > 0) {
            set({
              activeModal: modalStack[modalStack.length - 1],
              modalStack: modalStack.slice(0, -1),
            });
          } else {
            set({ activeModal: null });
          }
        },

        closeAllModals: () => set({ activeModal: null, modalStack: [] }),

        pushModal: (modal) =>
          set((state) => ({
            modalStack: state.activeModal
              ? [...state.modalStack, state.activeModal]
              : state.modalStack,
            activeModal: modal,
          })),

        popModal: () => {
          const { modalStack } = get();
          if (modalStack.length > 0) {
            set({
              activeModal: modalStack[modalStack.length - 1],
              modalStack: modalStack.slice(0, -1),
            });
          } else {
            set({ activeModal: null });
          }
        },

        // Toast actions
        addToast: (toast) => {
          const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          const newToast: Toast = {
            ...toast,
            id,
            duration: toast.duration ?? 5000,
            dismissible: toast.dismissible ?? true,
          };

          set((state) => ({
            toasts: [...state.toasts, newToast],
          }));

          // Auto-remove after duration (unless it's a loading toast)
          if (
            newToast.type !== "loading" &&
            newToast.duration &&
            newToast.duration > 0
          ) {
            setTimeout(() => {
              get().removeToast(id);
            }, newToast.duration);
          }
        },

        removeToast: (id) =>
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          })),

        clearToasts: () => set({ toasts: [] }),

        // Search actions
        setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),

        setSearchFocused: (focused) => set({ isSearchFocused: focused }),

        clearSearch: () =>
          set({ globalSearchQuery: "", isSearchFocused: false }),

        // Layout actions
        toggleCompactMode: () =>
          set((state) => ({ isCompactMode: !state.isCompactMode })),

        toggleMessagePreview: () =>
          set((state) => ({ showMessagePreview: !state.showMessagePreview })),

        setMessageListWidth: (width) => set({ messageListWidth: width }),

        // Loading actions
        setGlobalLoading: (loading, message) =>
          set({
            isGlobalLoading: loading,
            loadingMessage: loading ? (message ?? null) : null,
          }),

        // Theme actions
        setTheme: (theme) => set({ theme }),

        // Reset
        reset: () => set(initialState),
      }),
      {
        name: "inbox-zero-ui",
        partialize: (state) => ({
          sidebarView: state.sidebarView,
          sidebarWidth: state.sidebarWidth,
          collapsedSections: state.collapsedSections,
          isCompactMode: state.isCompactMode,
          showMessagePreview: state.showMessagePreview,
          messageListWidth: state.messageListWidth,
          theme: state.theme,
        }),
      },
    ),
    { name: "UIStore" },
  ),
);

// -----------------------------------------------------------------------------
// Selectors
// -----------------------------------------------------------------------------
export const selectSidebarCollapsed = (state: UIState) =>
  state.sidebarView === "collapsed";

export const selectHasActiveModal = (state: UIState) =>
  state.activeModal !== null;

export const selectToastCount = (state: UIState) => state.toasts.length;

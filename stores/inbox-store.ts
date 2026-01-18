// =============================================================================
// Inbox Store
// =============================================================================
// Message selection, filtering, sorting, and view management
// =============================================================================

import {
  MessageCategory,
  MessageFilters,
  MessagePriority,
  MessageSort,
  MessageStatus,
} from "@/types/message";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export type InboxView = "list" | "split" | "conversation";

export type FolderType =
  | "inbox"
  | "sent"
  | "drafts"
  | "starred"
  | "archive"
  | "spam"
  | "trash";

export type SmartFolder =
  | "urgent"
  | "needs-reply"
  | "fyi"
  | "newsletter"
  | "promotional";

export type ActiveFolder = FolderType | SmartFolder | `label:${string}`;

export interface ActiveFilter {
  id: string;
  type: "status" | "priority" | "category" | "label" | "has" | "date";
  label: string;
  value: string | string[];
}

export interface PendingAction {
  id: string;
  type: "archive" | "trash" | "read" | "unread" | "star" | "unstar" | "label";
  messageIds: string[];
  timestamp: number;
  data?: Record<string, unknown>;
}

// -----------------------------------------------------------------------------
// State Interface
// -----------------------------------------------------------------------------
interface InboxState {
  // View
  view: InboxView;
  activeFolder: ActiveFolder;

  // Selection
  selectedMessageId: string | null;
  selectedMessageIds: Set<string>;
  isMultiSelectMode: boolean;
  lastSelectedId: string | null;

  // Filters
  filters: MessageFilters;
  activeFilters: ActiveFilter[];

  // Sorting
  sort: MessageSort;

  // Search
  searchQuery: string;
  isSearching: boolean;

  // Pagination
  currentPage: number;
  pageSize: number;
  totalMessages: number;
  totalPages: number;

  // Optimistic updates
  pendingActions: Map<string, PendingAction>;

  // Read tracking
  recentlyReadIds: Set<string>;
}

// -----------------------------------------------------------------------------
// Actions Interface
// -----------------------------------------------------------------------------
interface InboxActions {
  // View actions
  setView: (view: InboxView) => void;
  setActiveFolder: (folder: ActiveFolder) => void;

  // Selection actions
  selectMessage: (id: string | null) => void;
  toggleMessageSelection: (id: string) => void;
  selectRange: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  toggleMultiSelectMode: () => void;

  // Filter actions
  setFilters: (filters: MessageFilters) => void;
  addFilter: (filter: ActiveFilter) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;
  toggleStatusFilter: (status: MessageStatus) => void;
  togglePriorityFilter: (priority: MessagePriority) => void;
  toggleCategoryFilter: (category: MessageCategory) => void;
  toggleLabelFilter: (labelId: string, labelName: string) => void;

  // Sort actions
  setSort: (sort: MessageSort) => void;
  toggleSortOrder: () => void;

  // Search actions
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  setIsSearching: (isSearching: boolean) => void;

  // Pagination actions
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalMessages: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  // Optimistic update actions
  addPendingAction: (action: Omit<PendingAction, "id" | "timestamp">) => string;
  removePendingAction: (id: string) => void;
  clearPendingActions: () => void;

  // Read tracking actions
  markAsRead: (ids: string[]) => void;
  markAsUnread: (ids: string[]) => void;
  clearRecentlyRead: () => void;

  // Reset
  reset: () => void;
}

// -----------------------------------------------------------------------------
// Initial State
// -----------------------------------------------------------------------------
const initialState: InboxState = {
  view: "split",
  activeFolder: "inbox",

  selectedMessageId: null,
  selectedMessageIds: new Set(),
  isMultiSelectMode: false,
  lastSelectedId: null,

  filters: {},
  activeFilters: [],

  sort: { field: "receivedAt", order: "desc" },

  searchQuery: "",
  isSearching: false,

  currentPage: 1,
  pageSize: 25,
  totalMessages: 0,
  totalPages: 0,

  pendingActions: new Map(),

  recentlyReadIds: new Set(),
};

// -----------------------------------------------------------------------------
// Store
// -----------------------------------------------------------------------------
export const useInboxStore = create<InboxState & InboxActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // View actions
        setView: (view) => set({ view }),

        setActiveFolder: (folder) =>
          set({
            activeFolder: folder,
            selectedMessageId: null,
            selectedMessageIds: new Set(),
            isMultiSelectMode: false,
            currentPage: 1,
            filters: {},
            activeFilters: [],
          }),

        // Selection actions
        selectMessage: (id) =>
          set({
            selectedMessageId: id,
            lastSelectedId: id,
            // Exit multi-select when clicking a single message
            isMultiSelectMode: false,
            selectedMessageIds: new Set(),
          }),

        toggleMessageSelection: (id) =>
          set((state) => {
            const newSelection = new Set(state.selectedMessageIds);
            if (newSelection.has(id)) {
              newSelection.delete(id);
            } else {
              newSelection.add(id);
            }
            return {
              selectedMessageIds: newSelection,
              isMultiSelectMode: newSelection.size > 0,
              lastSelectedId: id,
            };
          }),

        selectRange: (id) =>
          set((state) => {
            // Implement shift+click range selection
            // This requires knowing the full list of visible message IDs
            // For now, just toggle the single item
            const newSelection = new Set(state.selectedMessageIds);
            newSelection.add(id);
            return {
              selectedMessageIds: newSelection,
              isMultiSelectMode: true,
              lastSelectedId: id,
            };
          }),

        selectAll: (ids) =>
          set({
            selectedMessageIds: new Set(ids),
            isMultiSelectMode: ids.length > 0,
          }),

        clearSelection: () =>
          set({
            selectedMessageId: null,
            selectedMessageIds: new Set(),
            isMultiSelectMode: false,
            lastSelectedId: null,
          }),

        toggleMultiSelectMode: () =>
          set((state) => ({
            isMultiSelectMode: !state.isMultiSelectMode,
            selectedMessageIds: state.isMultiSelectMode
              ? new Set()
              : state.selectedMessageIds,
          })),

        // Filter actions
        setFilters: (filters) => set({ filters, currentPage: 1 }),

        addFilter: (filter) =>
          set((state) => {
            // Check if filter already exists
            const exists = state.activeFilters.some((f) => f.id === filter.id);
            if (exists) return state;

            // Update filters object based on filter type
            const newFilters = { ...state.filters };
            switch (filter.type) {
              case "status":
                newFilters.status = [
                  ...(Array.isArray(newFilters.status)
                    ? newFilters.status
                    : []),
                  filter.value as MessageStatus,
                ];
                break;
              case "priority":
                newFilters.priority = [
                  ...(Array.isArray(newFilters.priority)
                    ? newFilters.priority
                    : []),
                  filter.value as MessagePriority,
                ];
                break;
              case "category":
                newFilters.category = [
                  ...(Array.isArray(newFilters.category)
                    ? newFilters.category
                    : []),
                  filter.value as MessageCategory,
                ];
                break;
              case "label":
                newFilters.labelIds = [
                  ...(newFilters.labelIds ?? []),
                  filter.value as string,
                ];
                break;
              case "has":
                if (filter.value === "attachments") {
                  newFilters.hasAttachments = true;
                } else if (filter.value === "starred") {
                  newFilters.isStarred = true;
                }
                break;
            }

            return {
              activeFilters: [...state.activeFilters, filter],
              filters: newFilters,
              currentPage: 1,
            };
          }),

        removeFilter: (filterId) =>
          set((state) => {
            const filter = state.activeFilters.find((f) => f.id === filterId);
            if (!filter) return state;

            const newFilters = { ...state.filters };
            switch (filter.type) {
              case "status":
                newFilters.status = Array.isArray(newFilters.status)
                  ? newFilters.status.filter((s) => s !== filter.value)
                  : undefined;
                break;
              case "priority":
                newFilters.priority = Array.isArray(newFilters.priority)
                  ? newFilters.priority.filter((p) => p !== filter.value)
                  : undefined;
                break;
              case "category":
                newFilters.category = Array.isArray(newFilters.category)
                  ? newFilters.category.filter((c) => c !== filter.value)
                  : undefined;
                break;
              case "label":
                newFilters.labelIds = newFilters.labelIds?.filter(
                  (id) => id !== filter.value,
                );
                break;
              case "has":
                if (filter.value === "attachments") {
                  delete newFilters.hasAttachments;
                } else if (filter.value === "starred") {
                  delete newFilters.isStarred;
                }
                break;
            }

            return {
              activeFilters: state.activeFilters.filter(
                (f) => f.id !== filterId,
              ),
              filters: newFilters,
              currentPage: 1,
            };
          }),

        clearFilters: () =>
          set({
            filters: {},
            activeFilters: [],
            currentPage: 1,
          }),

        toggleStatusFilter: (status) =>
          set((state) => {
            const filterId = `status-${status}`;
            const exists = state.activeFilters.some((f) => f.id === filterId);

            if (exists) {
              get().removeFilter(filterId);
              return {};
            }

            get().addFilter({
              id: filterId,
              type: "status",
              label: status.charAt(0).toUpperCase() + status.slice(1),
              value: status,
            });
            return {};
          }),

        togglePriorityFilter: (priority) =>
          set((state) => {
            const filterId = `priority-${priority}`;
            const exists = state.activeFilters.some((f) => f.id === filterId);

            if (exists) {
              get().removeFilter(filterId);
              return {};
            }

            get().addFilter({
              id: filterId,
              type: "priority",
              label: priority.charAt(0).toUpperCase() + priority.slice(1),
              value: priority,
            });
            return {};
          }),

        toggleCategoryFilter: (category) =>
          set((state) => {
            const filterId = `category-${category}`;
            const exists = state.activeFilters.some((f) => f.id === filterId);

            if (exists) {
              get().removeFilter(filterId);
              return {};
            }

            const label = category
              .split("_")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");

            get().addFilter({
              id: filterId,
              type: "category",
              label,
              value: category,
            });
            return {};
          }),

        toggleLabelFilter: (labelId, labelName) =>
          set((state) => {
            const filterId = `label-${labelId}`;
            const exists = state.activeFilters.some((f) => f.id === filterId);

            if (exists) {
              get().removeFilter(filterId);
              return {};
            }

            get().addFilter({
              id: filterId,
              type: "label",
              label: labelName,
              value: labelId,
            });
            return {};
          }),

        // Sort actions
        setSort: (sort) => set({ sort, currentPage: 1 }),

        toggleSortOrder: () =>
          set((state) => ({
            sort: {
              ...state.sort,
              order: state.sort.order === "asc" ? "desc" : "asc",
            },
          })),

        // Search actions
        setSearchQuery: (query) =>
          set({
            searchQuery: query,
            currentPage: 1,
          }),

        clearSearch: () =>
          set({
            searchQuery: "",
            isSearching: false,
            currentPage: 1,
          }),

        setIsSearching: (isSearching) => set({ isSearching }),

        // Pagination actions
        setPage: (page) => set({ currentPage: page }),

        setPageSize: (size) => set({ pageSize: size, currentPage: 1 }),

        setTotalMessages: (total) =>
          set((state) => ({
            totalMessages: total,
            totalPages: Math.ceil(total / state.pageSize),
          })),

        nextPage: () =>
          set((state) => {
            if (state.currentPage < state.totalPages) {
              return { currentPage: state.currentPage + 1 };
            }
            return {};
          }),

        prevPage: () =>
          set((state) => {
            if (state.currentPage > 1) {
              return { currentPage: state.currentPage - 1 };
            }
            return {};
          }),

        // Optimistic update actions
        addPendingAction: (action) => {
          const id = `action-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          const pendingAction: PendingAction = {
            ...action,
            id,
            timestamp: Date.now(),
          };

          set((state) => ({
            pendingActions: new Map(state.pendingActions).set(
              id,
              pendingAction,
            ),
          }));

          return id;
        },

        removePendingAction: (id) =>
          set((state) => {
            const newPendingActions = new Map(state.pendingActions);
            newPendingActions.delete(id);
            return { pendingActions: newPendingActions };
          }),

        clearPendingActions: () => set({ pendingActions: new Map() }),

        // Read tracking actions
        markAsRead: (ids) =>
          set((state) => ({
            recentlyReadIds: new Set([...state.recentlyReadIds, ...ids]),
          })),

        markAsUnread: (ids) =>
          set((state) => {
            const newRecentlyRead = new Set(state.recentlyReadIds);
            ids.forEach((id) => newRecentlyRead.delete(id));
            return { recentlyReadIds: newRecentlyRead };
          }),

        clearRecentlyRead: () => set({ recentlyReadIds: new Set() }),

        // Reset
        reset: () => set(initialState),
      }),
      {
        name: "inbox-zero-inbox",
        partialize: (state) => ({
          view: state.view,
          pageSize: state.pageSize,
          sort: state.sort,
        }),
      },
    ),
    { name: "InboxStore" },
  ),
);

// -----------------------------------------------------------------------------
// Selectors
// -----------------------------------------------------------------------------
export const selectSelectedCount = (state: InboxState) =>
  state.selectedMessageIds.size;

export const selectHasSelection = (state: InboxState) =>
  state.selectedMessageIds.size > 0 || state.selectedMessageId !== null;

export const selectIsMessageSelected = (state: InboxState, id: string) =>
  state.selectedMessageIds.has(id) || state.selectedMessageId === id;

export const selectActiveFilterCount = (state: InboxState) =>
  state.activeFilters.length;

export const selectHasFilters = (state: InboxState) =>
  state.activeFilters.length > 0 || state.searchQuery.length > 0;

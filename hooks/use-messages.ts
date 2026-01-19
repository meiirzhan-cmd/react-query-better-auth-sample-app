// =============================================================================
// Message Hooks (React Query)
// =============================================================================
// Custom hooks for fetching, mutating, and syncing messages
// =============================================================================

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  MessageWithSummary,
  MessageFilters,
  MessageSort,
  BulkAction,
} from "@/types/message";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
interface ListMessagesParams {
  page?: number;
  pageSize?: number;
  filters?: MessageFilters;
  sort?: MessageSort;
  folder?: string;
}

interface ListMessagesResponse {
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

interface MessageResponse {
  success: boolean;
  data: MessageWithSummary;
}

interface BulkActionResponse {
  success: boolean;
  data: {
    processed: number;
    failed: number;
    errors: { messageId: string; error: string }[];
  };
}

interface SyncResponse {
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
// Query Keys
// -----------------------------------------------------------------------------
export const messageKeys = {
  all: ["messages"] as const,
  lists: () => [...messageKeys.all, "list"] as const,
  list: (params: ListMessagesParams) =>
    [...messageKeys.lists(), params] as const,
  details: () => [...messageKeys.all, "detail"] as const,
  detail: (id: string) => [...messageKeys.details(), id] as const,
};

function applyFilters(searchParams: URLSearchParams, filters: MessageFilters) {
  const simpleFilters = {
    status: filters.status,
    priority: filters.priority,
    category: filters.category,
    search: filters.search,
  } as const;

  for (const [key, value] of Object.entries(simpleFilters)) {
    if (value != null) {
      searchParams.set(key, Array.isArray(value) ? value[0] : String(value));
    }
  }

  if (filters.isStarred !== undefined) {
    searchParams.set("isStarred", String(filters.isStarred));
  }
  if (filters.hasAttachments !== undefined) {
    searchParams.set("hasAttachments", String(filters.hasAttachments));
  }
}

async function fetchMessages(
  params: ListMessagesParams,
): Promise<ListMessagesResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.folder) searchParams.set("folder", params.folder);
  if (params.filters) applyFilters(searchParams, params.filters);
  if (params.sort) {
    searchParams.set("sortField", params.sort.field);
    searchParams.set("sortOrder", params.sort.order);
  }

  const response = await fetch(`/api/messages?${searchParams.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch messages");
  }
  return response.json();
}

async function fetchMessage(id: string): Promise<MessageResponse> {
  const response = await fetch(`/api/messages/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch message");
  }

  return response.json();
}

async function updateMessage(
  id: string,
  data: Partial<MessageWithSummary>,
): Promise<MessageResponse> {
  const response = await fetch(`/api/messages/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update message");
  }

  return response.json();
}

async function deleteMessage(
  id: string,
  permanent = false,
): Promise<{ success: boolean }> {
  const response = await fetch(
    `/api/messages/${id}${permanent ? "?permanent=true" : ""}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete message");
  }

  return response.json();
}

async function bulkAction(
  messageIds: string[],
  action: BulkAction,
  labelId?: string,
): Promise<BulkActionResponse> {
  const response = await fetch("/api/messages/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messageIds, action, labelId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to perform bulk action");
  }

  return response.json();
}

async function syncMessages(
  connectionId?: string,
  fullSync = false,
): Promise<SyncResponse> {
  const response = await fetch("/api/messages/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ connectionId, fullSync }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to sync messages");
  }

  return response.json();
}

// -----------------------------------------------------------------------------
// Hooks
// -----------------------------------------------------------------------------

/**
 * Fetch paginated messages with filters
 */
export function useMessages(params: ListMessagesParams = {}) {
  return useQuery({
    queryKey: messageKeys.list(params),
    queryFn: () => fetchMessages(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fetch messages with infinite scrolling
 */
export function useInfiniteMessages(
  params: Omit<ListMessagesParams, "page"> = {},
) {
  return useInfiniteQuery({
    queryKey: [...messageKeys.lists(), "infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      fetchMessages({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch single message with details
 */
export function useMessage(id: string | null) {
  return useQuery({
    queryKey: messageKeys.detail(id || ""),
    queryFn: () => fetchMessage(id!),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Update message mutation
 */
export function useUpdateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<MessageWithSummary>;
    }) => updateMessage(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: messageKeys.detail(id) });

      // Snapshot previous value
      const previousMessage = queryClient.getQueryData(messageKeys.detail(id));

      // Optimistically update
      queryClient.setQueryData(
        messageKeys.detail(id),
        (old: MessageResponse | undefined) => ({
          ...old,
          data: { ...old?.data, ...data },
        }),
      );

      return { previousMessage };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousMessage) {
        queryClient.setQueryData(
          messageKeys.detail(id),
          context.previousMessage,
        );
      }
    },
    onSettled: (_, __, { id }) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: messageKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() });
    },
  });
}

/**
 * Delete message mutation
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      permanent = false,
    }: {
      id: string;
      permanent?: boolean;
    }) => deleteMessage(id, permanent),
    onSuccess: (_, { id }) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: messageKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() });
    },
  });
}

/**
 * Bulk action mutation
 */
export function useBulkAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageIds,
      action,
      labelId,
    }: {
      messageIds: string[];
      action: BulkAction;
      labelId?: string;
    }) => bulkAction(messageIds, action, labelId),
    onSuccess: () => {
      // Invalidate all message queries
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
}

/**
 * Star/unstar message mutation
 */
export function useStarMessage() {
  const updateMessage = useUpdateMessage();
  const { isPending, isError, error, isSuccess, reset } = updateMessage;

  return {
    mutate: (id: string, isStarred: boolean) =>
      updateMessage.mutate({ id, data: { isStarred } }),
    mutateAsync: (id: string, isStarred: boolean) =>
      updateMessage.mutateAsync({ id, data: { isStarred } }),
    isPending,
    isError,
    error,
    isSuccess,
    reset,
  };
}
/**
 * Mark as read/unread mutation
 */
export function useMarkAsRead() {
  const updateMessage = useUpdateMessage();

  return {
    markAsRead: (id: string) =>
      updateMessage.mutate({ id, data: { status: "read" } }),
    markAsUnread: (id: string) =>
      updateMessage.mutate({ id, data: { status: "unread" } }),
    ...updateMessage,
  };
}

/**
 * Archive message mutation
 */
export function useArchiveMessage() {
  const updateMessage = useUpdateMessage();

  return {
    archive: (id: string) =>
      updateMessage.mutate({ id, data: { status: "archived" } }),
    unarchive: (id: string) =>
      updateMessage.mutate({ id, data: { status: "read" } }),
    ...updateMessage,
  };
}

/**
 * Sync messages mutation
 */
export function useSyncMessages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      connectionId,
      fullSync = false,
    }: {
      connectionId?: string;
      fullSync?: boolean;
    } = {}) => syncMessages(connectionId, fullSync),
    onSuccess: () => {
      // Invalidate all message queries after sync
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
}

// -----------------------------------------------------------------------------
// Prefetch Helpers
// -----------------------------------------------------------------------------

/**
 * Prefetch messages for a folder
 */
export function usePrefetchMessages(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  return (params: ListMessagesParams) => {
    queryClient.prefetchQuery({
      queryKey: messageKeys.list(params),
      queryFn: () => fetchMessages(params),
      staleTime: 30 * 1000,
    });
  };
}

/**
 * Prefetch single message
 */
export function usePrefetchMessage(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: messageKeys.detail(id),
      queryFn: () => fetchMessage(id),
      staleTime: 60 * 1000,
    });
  };
}

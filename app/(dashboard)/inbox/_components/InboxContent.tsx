"use client";

import { cn } from "@/lib/utils/utils";
import { useComposeStore } from "@/stores/compose-store";
import { useInboxStore } from "@/stores/inbox-store";
import { MessageWithSummary } from "@/types/message";
import { AnimatePresence, motion } from "motion/react";
import React, { useCallback, useEffect } from "react";
import FilterBar from "./FilterBar";
import MessageActions from "./MessageActions";
import MessageDetail from "./MessageDetail";
import MessageList from "./MessageList";
import {
  useMessages,
  useUpdateMessage,
  useDeleteMessage,
  useBulkAction,
  useSyncMessages,
} from "@/hooks/use-messages";
import { useDefaultConnection } from "@/hooks/use-connections";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const InboxContent = () => {
  const {
    selectedMessageId,
    selectMessage,
    activeFolder,
    filters,
    sort,
    currentPage,
    pageSize,
    searchQuery,
    setTotalMessages,
  } = useInboxStore();
  const { openCompose } = useComposeStore();

  // Get default connection
  const { data: defaultConnection, isLoading: isLoadingConnection } =
    useDefaultConnection();

  // Fetch messages from API
  const {
    data: messagesData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useMessages({
    page: currentPage,
    pageSize,
    folder: activeFolder,
    filters: {
      ...filters,
      search: searchQuery || undefined,
    },
    sort,
  });

  // Mutations
  const updateMessage = useUpdateMessage();
  const deleteMessage = useDeleteMessage();
  const bulkAction = useBulkAction();
  const syncMessages = useSyncMessages();

  // Update total count when data changes
  useEffect(() => {
    if (messagesData?.pagination) {
      setTotalMessages(messagesData.pagination.totalItems);
    }
  }, [messagesData?.pagination, setTotalMessages]);

  // Get messages from response
  const messages = (messagesData?.data || []) as MessageWithSummary[];

  // Find selected message
  const selectedMessage = selectedMessageId
    ? (messages.find((m) => m.id === selectedMessageId) ?? null)
    : null;

  // Handlers
  const handleStarMessage = useCallback(
    (id: string) => {
      const message = messages.find((m) => m.id === id);
      if (message) {
        updateMessage.mutate({
          id,
          data: { isStarred: !message.isStarred },
        });
      }
    },
    [messages, updateMessage],
  );

  const handleArchiveMessage = useCallback(
    (id: string) => {
      updateMessage.mutate({
        id,
        data: { status: "archived" },
      });
      if (selectedMessageId === id) {
        selectMessage(null);
      }
    },
    [selectedMessageId, selectMessage, updateMessage],
  );

  const handleDeleteMessage = useCallback(
    (id: string) => {
      deleteMessage.mutate({ id });
      if (selectedMessageId === id) {
        selectMessage(null);
      }
    },
    [selectedMessageId, selectMessage, deleteMessage],
  );

  const handleReply = useCallback(
    (id: string) => {
      const message = messages.find((m) => m.id === id);
      if (message) {
        openCompose({
          mode: "reply",
          replyToMessageId: id,
          to: [message.from],
          subject: `Re: ${message.subject}`,
        });
      }
    },
    [messages, openCompose],
  );

  const handleBulkArchive = useCallback(
    (ids: string[]) => {
      bulkAction.mutate({ messageIds: ids, action: "archive" });
      useInboxStore.getState().clearSelection();
    },
    [bulkAction],
  );

  const handleBulkDelete = useCallback(
    (ids: string[]) => {
      bulkAction.mutate({ messageIds: ids, action: "trash" });
      useInboxStore.getState().clearSelection();
    },
    [bulkAction],
  );

  const handleBulkMarkRead = useCallback(
    (ids: string[]) => {
      bulkAction.mutate({ messageIds: ids, action: "markRead" });
    },
    [bulkAction],
  );

  const handleBulkMarkUnread = useCallback(
    (ids: string[]) => {
      bulkAction.mutate({ messageIds: ids, action: "markUnread" });
    },
    [bulkAction],
  );

  const handleBulkStar = useCallback(
    (ids: string[]) => {
      bulkAction.mutate({ messageIds: ids, action: "star" });
    },
    [bulkAction],
  );

  const handleBulkUnstar = useCallback(
    (ids: string[]) => {
      bulkAction.mutate({ messageIds: ids, action: "unstar" });
    },
    [bulkAction],
  );

  const handleCloseDetail = useCallback(() => {
    selectMessage(null);
  }, [selectMessage]);

  const handleSync = useCallback(() => {
    syncMessages.mutate({});
  }, [syncMessages]);

  // Show connect prompt if no connection
  if (!isLoadingConnection && !defaultConnection) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 p-8 dark:from-violet-900/30 dark:to-blue-900/30">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Connect your email
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Connect your Gmail or Outlook account to start managing your emails
            with AI-powered insights.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              onClick={() =>
                (window.location.href = "/api/connections/gmail/connect")
              }
              className="bg-gradient-to-r from-violet-600 to-blue-600"
            >
              Connect Gmail
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="rounded-2xl bg-red-50 p-8 dark:bg-red-900/20">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">
            Failed to load messages
          </h2>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <MessageActions
        totalCount={messages.length}
        onArchive={handleBulkArchive}
        onDelete={handleBulkDelete}
        onMarkRead={handleBulkMarkRead}
        onMarkUnread={handleBulkMarkUnread}
        onStar={handleBulkStar}
        onUnstar={handleBulkUnstar}
      />

      <div
        className={cn(
          "flex flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
          selectedMessageId
            ? "hidden w-full lg:flex lg:w-420px"
            : "w-full lg:w-420px",
        )}
      >
        {/* Sync Button */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-sm text-zinc-500">
            {defaultConnection?.email || "Loading..."}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={syncMessages.isPending || isFetching}
            className="gap-1.5"
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                (syncMessages.isPending || isFetching) && "animate-spin",
              )}
            />
            {syncMessages.isPending ? "Syncing..." : "Sync"}
          </Button>
        </div>

        <FilterBar />
        <div className="flex-1 overflow-y-auto">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            onStarMessage={handleStarMessage}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMessageId || "empty"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "flex-1 bg-white dark:bg-zinc-900",
            selectedMessageId ? "flex" : "hidden lg:flex",
          )}
        >
          <MessageDetail
            message={selectedMessage}
            isLoading={false}
            onClose={handleCloseDetail}
            onArchive={handleArchiveMessage}
            onDelete={handleDeleteMessage}
            onStar={handleStarMessage}
            onReply={handleReply}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default InboxContent;

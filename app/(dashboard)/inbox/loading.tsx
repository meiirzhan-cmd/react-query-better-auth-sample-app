"use client";

import { cn } from "@/lib/utils/utils";
import { useComposeStore } from "@/stores/compose-store";
import { useInboxStore } from "@/stores/inbox-store";
import { MessageWithSummary } from "@/types/message";
import { AnimatePresence, motion } from "motion/react";
import React, { useCallback, useMemo } from "react";
import { useMessages, useSyncMessages } from "@/hooks/use-messages";
import { useConnections } from "@/hooks/use-connections";
import { RefreshCw, Mail, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import MessageActions from "./_components/MessageActions";
import FilterBar from "./_components/FilterBar";
import MessageList from "./_components/MessageList";
import MessageDetail from "./_components/MessageDetail";

const InboxContent = () => {
  const {
    selectedMessageId,
    selectMessage,
    activeFolder,
    sort,
    activeFilters,
  } = useInboxStore();
  const { openCompose } = useComposeStore();

  // Fetch connections to check if user has Gmail connected
  const { data: connectionsData, isLoading: isLoadingConnections } =
    useConnections();
  const connections = connectionsData?.data ?? [];
  const hasActiveConnection = connections.some((c) => c.status === "active");

  // Build filters from activeFilters
  const filters = useMemo(() => {
    return activeFilters.reduce(
      (acc, filter) => {
        if (filter.type === "status") acc.status = filter.value as never;
        if (filter.type === "priority") acc.priority = filter.value as never;
        if (filter.type === "category") acc.category = filter.value as never;
        if (filter.type === "has" && filter.value === "starred")
          acc.isStarred = true;
        if (filter.type === "has" && filter.value === "attachments")
          acc.hasAttachments = true;
        return acc;
      },
      {} as Record<string, unknown>,
    );
  }, [activeFilters]);

  // Fetch messages from API
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useMessages({
    folder: activeFolder,
    sort,
    filters,
  });

  // Sync mutation
  const { mutate: syncMessages, isPending: isSyncing } = useSyncMessages();

  const messages: MessageWithSummary[] = messagesData?.data ?? [];
  const isLoading = isLoadingConnections || isLoadingMessages;

  // Handle sync
  const handleSync = useCallback(() => {
    syncMessages(
      {},
      {
        onSuccess: () => {
          refetchMessages();
        },
      },
    );
  }, [syncMessages, refetchMessages]);

  // Derive selected message from messages array
  const selectedMessage = useMemo(() => {
    if (!selectedMessageId) return null;
    return messages.find((m) => m.id === selectedMessageId) ?? null;
  }, [selectedMessageId, messages]);

  // Handlers - now using API mutations
  const handleStarMessage = useCallback((id: string) => {
    // TODO: Implement with useUpdateMessage hook
    console.log("Star message:", id);
  }, []);

  const handleArchiveMessage = useCallback(
    (id: string) => {
      // TODO: Implement with useUpdateMessage hook
      console.log("Archive message:", id);
      if (selectedMessageId === id) {
        selectMessage(null);
      }
    },
    [selectedMessageId, selectMessage],
  );

  const handleDeleteMessage = useCallback(
    (id: string) => {
      // TODO: Implement with useDeleteMessage hook
      console.log("Delete message:", id);
      if (selectedMessageId === id) {
        selectMessage(null);
      }
    },
    [selectedMessageId, selectMessage],
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

  const handleBulkArchive = useCallback((ids: string[]) => {
    // TODO: Implement with useBulkAction hook
    console.log("Bulk archive:", ids);
    useInboxStore.getState().clearSelection();
  }, []);

  const handleBulkDelete = useCallback((ids: string[]) => {
    // TODO: Implement with useBulkAction hook
    console.log("Bulk delete:", ids);
    useInboxStore.getState().clearSelection();
  }, []);

  const handleBulkMarkRead = useCallback((ids: string[]) => {
    // TODO: Implement with useBulkAction hook
    console.log("Bulk mark read:", ids);
  }, []);

  const handleBulkMarkUnread = useCallback((ids: string[]) => {
    // TODO: Implement with useBulkAction hook
    console.log("Bulk mark unread:", ids);
  }, []);

  const handleBulkStar = useCallback((ids: string[]) => {
    // TODO: Implement with useBulkAction hook
    console.log("Bulk star:", ids);
  }, []);

  const handleBulkUnstar = useCallback((ids: string[]) => {
    // TODO: Implement with useBulkAction hook
    console.log("Bulk unstar:", ids);
  }, []);

  const handleCloseDetail = useCallback(() => {
    selectMessage(null);
  }, [selectMessage]);

  // Show connection required state
  if (!isLoadingConnections && !hasActiveConnection) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30">
          <Mail className="h-10 w-10 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Connect Your Email
          </h2>
          <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
            Connect your Gmail account to start managing your emails with
            AI-powered insights.
          </p>
        </div>
        <Link href="/api/messages/connections/gmail/connect?redirect=/inbox">
          <Button className="bg-linear-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30">
            <Mail className="mr-2 h-4 w-4" />
            Connect Gmail
          </Button>
        </Link>
      </div>
    );
  }

  // Show error state
  if (messagesError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
          <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Failed to Load Messages
          </h2>
          <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
            {messagesError instanceof Error
              ? messagesError.message
              : "An error occurred while loading your messages."}
          </p>
        </div>
        <Button
          onClick={() => refetchMessages()}
          variant="outline"
          className="border-violet-200 hover:border-violet-300 hover:bg-violet-50"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
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
        {/* Sync Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {connections[0]?.email || "Inbox"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            className="gap-1.5"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isSyncing ? "Syncing..." : "Sync"}
          </Button>
        </div>

        <FilterBar />
        <div className="flex-1 overflow-y-auto">
          <MessageList
            messages={messages}
            isLoading={isLoading || isSyncing}
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

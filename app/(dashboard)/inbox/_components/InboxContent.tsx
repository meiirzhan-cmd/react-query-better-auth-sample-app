"use client";

import { cn } from "@/lib/utils/utils";
import { useComposeStore } from "@/stores/compose-store";
import { useInboxStore } from "@/stores/inbox-store";
import { MessageWithSummary } from "@/types/message";
import { AnimatePresence, motion } from "motion/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { mockMessages } from "./data";
import FilterBar from "./FilterBar";
import MessageActions from "./MessageActions";
import MessageDetail from "./MessageDetail";
import MessageList from "./MessageList";

const InboxContent = () => {
  const [messages, setMessages] = useState<MessageWithSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { selectedMessageId, selectMessage } = useInboxStore();
  const { openCompose } = useComposeStore();

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages(mockMessages);
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Derive selected message from messages array (no loading needed - it's instant)
  const selectedMessage = useMemo(() => {
    if (!selectedMessageId) return null;
    return messages.find((m) => m.id === selectedMessageId) ?? null;
  }, [selectedMessageId, messages]);

  // Handlers
  const handleStarMessage = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isStarred: !m.isStarred } : m)),
    );
  }, []);

  const handleArchiveMessage = useCallback(
    (id: string) => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessageId === id) {
        selectMessage(null);
      }
    },
    [selectedMessageId, selectMessage],
  );

  const handleDeleteMessage = useCallback(
    (id: string) => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
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
    setMessages((prev) => prev.filter((m) => !ids.includes(m.id)));
    useInboxStore.getState().clearSelection();
  }, []);

  const handleBulkDelete = useCallback((ids: string[]) => {
    setMessages((prev) => prev.filter((m) => !ids.includes(m.id)));
    useInboxStore.getState().clearSelection();
  }, []);

  const handleBulkMarkRead = useCallback((ids: string[]) => {
    setMessages((prev) =>
      prev.map((m) =>
        ids.includes(m.id) ? { ...m, status: "read" as const } : m,
      ),
    );
  }, []);

  const handleBulkMarkUnread = useCallback((ids: string[]) => {
    setMessages((prev) =>
      prev.map((m) =>
        ids.includes(m.id) ? { ...m, status: "unread" as const } : m,
      ),
    );
  }, []);

  const handleBulkStar = useCallback((ids: string[]) => {
    setMessages((prev) =>
      prev.map((m) => (ids.includes(m.id) ? { ...m, isStarred: true } : m)),
    );
  }, []);

  const handleCloseDetail = useCallback(() => {
    selectMessage(null);
  }, [selectMessage]);

  return (
    <div className="relative flex h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <MessageActions
        totalCount={messages.length}
        onArchive={handleBulkArchive}
        onDelete={handleBulkDelete}
        onMarkRead={handleBulkMarkRead}
        onMarkUnread={handleBulkMarkUnread}
        onStar={handleBulkStar}
      />

      <div
        className={cn(
          "flex flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
          selectedMessageId
            ? "hidden w-full lg:flex lg:w-420px"
            : "w-full lg:w-420px",
        )}
      >
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

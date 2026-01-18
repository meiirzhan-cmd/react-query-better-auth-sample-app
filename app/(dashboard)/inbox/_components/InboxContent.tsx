"use client";

import { cn } from "@/lib/utils/utils";
import { useComposeStore } from "@/stores/compose-store";
import { useInboxStore } from "@/stores/inbox-store";
import { MessageWithSummary } from "@/types/message";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { mockMessages } from "./data";
import FilterBar from "./FilterBar";
import MessageActions from "./MessageActions";
import MessageDetail from "./MessageDetail";
import MessageList from "./MessageList";

const InboxContent = () => {
  const [messages, setMessages] = useState<MessageWithSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] =
    useState<MessageWithSummary | null>(null);

  const { selectedMessageId, selectMessage, selectedMessageIds, view } =
    useInboxStore();
  const { openCompose } = useComposeStore();

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages(mockMessages);
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Load selected message details
  useEffect(() => {
    if (selectedMessageId) {
      setIsDetailLoading(true);
      const timer = setTimeout(() => {
        const message = messages.find((m) => m.id === selectedMessageId);
        setSelectedMessage(message || null);
        setIsDetailLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSelectedMessage(null);
    }
  }, [selectedMessageId, messages]);

  // Handlers
  const handleStarMessage = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isStarred: !m.isStarred } : m)),
    );
    if (selectedMessage?.id === id) {
      setSelectedMessage((prev) =>
        prev ? { ...prev, isStarred: !prev.isStarred } : null,
      );
    }
  };

  const handleArchiveMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selectedMessageId === id) {
      selectMessage(null);
    }
  };

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selectedMessageId === id) {
      selectMessage(null);
    }
  };

  const handleReply = (id: string) => {
    const message = messages.find((m) => m.id === id);
    if (message) {
      openCompose({
        mode: "reply",
        replyToMessageId: id,
        to: [message.from],
        subject: `Re: ${message.subject}`,
      });
    }
  };

  const handleBulkArchive = (ids: string[]) => {
    setMessages((prev) => prev.filter((m) => !ids.includes(m.id)));
    useInboxStore.getState().clearSelection();
  };

  const handleBulkDelete = (ids: string[]) => {
    setMessages((prev) => prev.filter((m) => !ids.includes(m.id)));
    useInboxStore.getState().clearSelection();
  };

  const handleBulkMarkRead = (ids: string[]) => {
    setMessages((prev) =>
      prev.map((m) =>
        ids.includes(m.id) ? { ...m, status: "read" as const } : m,
      ),
    );
  };

  const handleBulkMarkUnread = (ids: string[]) => {
    setMessages((prev) =>
      prev.map((m) =>
        ids.includes(m.id) ? { ...m, status: "unread" as const } : m,
      ),
    );
  };

  const handleBulkStar = (ids: string[]) => {
    setMessages((prev) =>
      prev.map((m) => (ids.includes(m.id) ? { ...m, isStarred: true } : m)),
    );
  };

  const handleBulkUnstar = (ids: string[]) => {
    setMessages((prev) =>
      prev.map((m) => (ids.includes(m.id) ? { ...m, isStarred: false } : m)),
    );
  };

  return (
    <div className="relative flex h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Bulk actions bar */}
      <MessageActions
        totalCount={messages.length}
        onArchive={handleBulkArchive}
        onDelete={handleBulkDelete}
        onMarkRead={handleBulkMarkRead}
        onMarkUnread={handleBulkMarkUnread}
        onStar={handleBulkStar}
        onUnstar={handleBulkUnstar}
      />

      {/* Message list panel */}
      <div
        className={cn(
          "flex flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
          // Responsive width
          selectedMessageId
            ? "hidden w-full lg:flex lg:w-[420px]"
            : "w-full lg:w-[420px]",
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

      {/* Message detail panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMessageId || "empty"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "flex-1 bg-white dark:bg-zinc-900",
            // Show/hide on mobile
            selectedMessageId ? "flex" : "hidden lg:flex",
          )}
        >
          <MessageDetail
            message={selectedMessage}
            isLoading={isDetailLoading}
            onClose={() => selectMessage(null)}
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

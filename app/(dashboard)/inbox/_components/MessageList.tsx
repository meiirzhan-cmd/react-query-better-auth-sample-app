"use client";

import { MessageWithSummary } from "@/types/message";
import { useInboxStore } from "@/stores/inbox-store";
import { AnimatePresence, motion } from "motion/react";
import { MessageItem } from "./MessageItem";
import { Inbox, Search, Archive, Trash2, Star, LucideIcon } from "lucide-react";
import { getEmptyDescription, getEmptyTitle, getFolderTitle } from "../utils";
import EmptyState from "./EmptyState";
import MessageListSkeleton from "./skeletons/MessageListSkeleton";

interface MessageListProps {
  messages: MessageWithSummary[];
  isLoading: boolean;
  onStarMessage: (id: string) => void;
}

const folderIcons: Record<string, LucideIcon> = {
  inbox: Inbox,
  archive: Archive,
  trash: Trash2,
  starred: Star,
};

export function MessageList({
  messages,
  isLoading,
  onStarMessage,
}: Readonly<MessageListProps>) {
  const {
    selectedMessageId,
    selectedMessageIds,
    isMultiSelectMode,
    activeFolder,
    searchQuery,
    selectMessage,
    toggleMessageSelection,
  } = useInboxStore();

  // Show loading skeleton
  if (isLoading) {
    return <MessageListSkeleton count={8} />;
  }

  // Show empty state
  if (messages.length === 0) {
    const FolderIcon = folderIcons[activeFolder.replace("label:", "")] || Inbox;

    if (searchQuery) {
      return (
        <EmptyState
          icon={Search}
          title="No results found"
          description={`We couldn't find any emails matching "${searchQuery}". Try adjusting your search terms.`}
          action={{
            label: "Clear search",
            onClick: () => useInboxStore.getState().clearSearch(),
          }}
        />
      );
    }

    return (
      <EmptyState
        icon={FolderIcon}
        title={getEmptyTitle(activeFolder)}
        description={getEmptyDescription(activeFolder)}
      />
    );
  }

  return (
    <div className="flex flex-col">
      {/* List header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            {getFolderTitle(activeFolder)}
          </h2>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {messages.length} {messages.length === 1 ? "email" : "emails"}
          </span>
        </div>

        {selectedMessageIds.size > 0 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
          >
            {selectedMessageIds.size} selected
          </motion.span>
        )}
      </div>

      {/* Message list */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{
                duration: 0.2,
                delay: index * 0.03,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <MessageItem
                message={message}
                isSelected={selectedMessageId === message.id}
                isMultiSelectMode={isMultiSelectMode}
                isChecked={selectedMessageIds.has(message.id)}
                onSelect={() => selectMessage(message.id)}
                onToggleCheck={() => toggleMessageSelection(message.id)}
                onStar={() => onStarMessage(message.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MessageList;

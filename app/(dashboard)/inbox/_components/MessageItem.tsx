"use client";

import { cn } from "@/lib/utils/utils";
import { MessageWithSummary } from "@/types/message";
import {
  Star,
  Paperclip,
  AlertCircle,
  Reply,
  Info,
  Newspaper,
  Tag,
  Check,
} from "lucide-react";
import { motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { getAvatarColor } from "../utils";

interface MessageItemProps {
  message: MessageWithSummary;
  isSelected: boolean;
  isMultiSelectMode: boolean;
  isChecked: boolean;
  onSelect: () => void;
  onToggleCheck: () => void;
  onStar: () => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  needs_reply: Reply,
  fyi: Info,
  newsletter: Newspaper,
  promotional: Tag,
};

const priorityColors: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  normal: "bg-blue-500",
  low: "bg-zinc-400",
};

export function MessageItem({
  message,
  isSelected,
  isMultiSelectMode,
  isChecked,
  onSelect,
  onToggleCheck,
  onStar,
}: Readonly<MessageItemProps>) {
  const isUnread = message.status === "unread";
  const CategoryIcon = message.category
    ? categoryIcons[message.category]
    : null;

  const handleClick = () => {
    if (isMultiSelectMode) {
      onToggleCheck();
    } else {
      onSelect();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStar();
  };

  const handleStarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      onStar();
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCheck();
  };

  const handleCheckboxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      onToggleCheck();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      transition={{ duration: 0.15 }}
    >
      {/* Using div with role="button" to avoid nested button issue */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "group relative flex w-full cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200",
          "hover:shadow-lg hover:shadow-zinc-900/5 dark:hover:shadow-black/20",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
          isSelected
            ? "border-violet-300 bg-violet-50/80 shadow-md shadow-violet-500/10 dark:border-violet-700 dark:bg-violet-950/30"
            : "border-zinc-200/60 bg-white hover:border-zinc-300 dark:border-zinc-800/60 dark:bg-zinc-900/50 dark:hover:border-zinc-700",
          isUnread && !isSelected && "border-l-4 border-l-violet-500",
        )}
      >
        {/* Checkbox / Avatar */}
        <div className="relative shrink-0">
          {/* Checkbox overlay on hover or multi-select mode */}
          <div
            role="checkbox"
            aria-checked={isChecked}
            aria-label={`Select email from ${message.from.name || message.from.email}`}
            tabIndex={isMultiSelectMode || isChecked ? 0 : -1}
            onClick={handleCheckboxClick}
            onKeyDown={handleCheckboxKeyDown}
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-full transition-opacity",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
              isMultiSelectMode || isChecked
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100",
            )}
          >
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all cursor-pointer",
                isChecked
                  ? "border-violet-500 bg-violet-500 text-white"
                  : "border-zinc-300 bg-white hover:border-violet-400 dark:border-zinc-600 dark:bg-zinc-800",
              )}
            >
              {isChecked && <Check className="h-4 w-4" />}
            </div>
          </div>

          {/* Avatar */}
          <div
            aria-hidden="true"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-opacity",
              isMultiSelectMode || isChecked
                ? "opacity-0"
                : "opacity-100 group-hover:opacity-0",
              getAvatarColor(message.from.email),
            )}
          >
            {message.from.name?.charAt(0).toUpperCase() ||
              message.from.email.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1">
          {/* Top row: From, Labels, Time */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={cn(
                  "truncate text-sm",
                  isUnread
                    ? "font-semibold text-zinc-900 dark:text-white"
                    : "font-medium text-zinc-700 dark:text-zinc-300",
                )}
              >
                {message.from.name || message.from.email}
              </span>

              {/* Priority indicator */}
              {message.priority && message.priority !== "normal" && (
                <span
                  aria-label={`Priority: ${message.priority}`}
                  className={cn(
                    "h-2 w-2 rounded-full shrink-0",
                    priorityColors[message.priority],
                  )}
                />
              )}

              {/* Category badge */}
              {CategoryIcon && (
                <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  <CategoryIcon className="h-3 w-3" />
                </span>
              )}
            </div>

            <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-500">
              {formatDistanceToNow(new Date(message.receivedAt), {
                addSuffix: false,
              })}
            </span>
          </div>

          {/* Subject */}
          <p
            className={cn(
              "truncate text-sm",
              isUnread
                ? "font-medium text-zinc-900 dark:text-white"
                : "text-zinc-700 dark:text-zinc-300",
            )}
          >
            {message.subject || "(No subject)"}
          </p>

          {/* Snippet / Summary */}
          <p className="truncate text-sm text-zinc-500 dark:text-zinc-500">
            {message.summary?.summary ||
              message.snippet ||
              "No preview available"}
          </p>

          {/* Labels */}
          {message.labels && message.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {message.labels.slice(0, 3).map((label) => (
                <span
                  key={label.labelId}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: `${label.labelColor}20`,
                    color: label.labelColor,
                  }}
                >
                  {label.labelName}
                </span>
              ))}
              {message.labels.length > 3 && (
                <span className="text-xs text-zinc-500">
                  +{message.labels.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          {/* Star button - using div with role to avoid nested button */}
          <div
            role="button"
            tabIndex={0}
            aria-label={message.isStarred ? "Unstar email" : "Star email"}
            aria-pressed={message.isStarred}
            onClick={handleStarClick}
            onKeyDown={handleStarKeyDown}
            className={cn(
              "rounded-full p-1.5 transition-all cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
              message.isStarred
                ? "text-amber-500 hover:text-amber-600"
                : "text-zinc-300 hover:text-amber-500 dark:text-zinc-600 dark:hover:text-amber-500",
            )}
          >
            <Star
              className={cn("h-4 w-4", message.isStarred && "fill-current")}
            />
          </div>

          {/* Attachment indicator */}
          {message.hasAttachments && (
            <Paperclip
              aria-label="Has attachments"
              className="h-4 w-4 text-zinc-400 dark:text-zinc-500"
            />
          )}

          {/* Urgent indicator */}
          {message.priority === "urgent" && (
            <AlertCircle aria-label="Urgent" className="h-4 w-4 text-red-500" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default MessageItem;

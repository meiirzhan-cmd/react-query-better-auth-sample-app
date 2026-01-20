import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { MessageWithSummary } from "@/types/message";
import {
  Sparkles,
  ArrowLeft,
  Archive,
  Trash2,
  Star,
  Tag,
  MoreHorizontal,
  X,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Clock,
  Paperclip,
  Reply,
  ReplyAll,
  Forward,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import React, { useState } from "react";
import { getAvatarColor, formatFileSize } from "../utils";
import MessageDetailSkeleton from "./skeletons/MessageDetailSkeleton";

interface MessageDetailProps {
  message: MessageWithSummary | null;
  isLoading: boolean;
  onClose: () => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onStar: (id: string) => void;
  onReply: (id: string) => void;
}

const MessageDetail = ({
  message,
  isLoading,
  onClose,
  onArchive,
  onDelete,
  onStar,
  onReply,
}: MessageDetailProps) => {
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(true);

  // Loading state
  if (isLoading) {
    return <MessageDetailSkeleton />;
  }

  // No message selected
  if (!message) {
    return (
      <div className="flex  h-full flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30">
            <Sparkles className="h-8 w-8 text-violet-600 dark:text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Select an email
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Choose an email from the list to read it here
          </p>
        </motion.div>
      </div>
    );
  }

  const hasSummary = message.summary?.summary;

  return (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full w-full flex-col"
    >
      {/* Header */}
      <div className="shrink-0 border-b border-zinc-200 p-4 dark:border-zinc-800">
        {/* Actions bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Mobile back button */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={onClose}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onArchive(message.id)}
              className="text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
            >
              <Archive className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(message.id)}
              className="text-zinc-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onStar(message.id)}
              className={cn(
                "transition-colors",
                message.isStarred
                  ? "text-amber-500 hover:text-amber-600"
                  : "text-zinc-600 hover:text-amber-500 dark:text-zinc-400",
              )}
            >
              <Star
                className={cn("h-4 w-4", message.isStarred && "fill-current")}
              />
            </Button>

            <div className="mx-2 h-4 w-px bg-zinc-200 dark:bg-zinc-700" />

            <Button variant="ghost" size="icon-sm">
              <Tag className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation / Close */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="hidden lg:flex"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Subject */}
        <h1 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">
          {message.subject || "(No subject)"}
        </h1>

        {/* Sender info */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold",
              getAvatarColor(message.from.email),
            )}
          >
            {message.from.name?.charAt(0).toUpperCase() ||
              message.from.email.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {message.from.name || message.from.email}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {message.from.email}
                </p>
              </div>
              <p className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
                {format(
                  new Date(message.receivedAt),
                  "MMM d, yyyy 'at' h:mm a",
                )}
              </p>
            </div>

            {/* Recipients toggle */}
            <button
              onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
              className="mt-2 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              <span>to {message.to?.[0]?.email || "me"}</span>
              {message.to && message.to.length > 1 && (
                <span>and {message.to.length - 1} others</span>
              )}
              {isHeaderExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>

            {/* Expanded recipients */}
            <AnimatePresence>
              {isHeaderExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 overflow-hidden rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-800/50"
                >
                  <div className="space-y-1">
                    <p>
                      <span className="text-zinc-500 dark:text-zinc-400">
                        From:{" "}
                      </span>
                      <span className="text-zinc-900 dark:text-white">
                        {message.from.name} &lt;{message.from.email}&gt;
                      </span>
                    </p>
                    <p>
                      <span className="text-zinc-500 dark:text-zinc-400">
                        To:{" "}
                      </span>
                      <span className="text-zinc-900 dark:text-white">
                        {message.to?.map((r) => r.email).join(", ")}
                      </span>
                    </p>
                    {message.cc && message.cc.length > 0 && (
                      <p>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          Cc:{" "}
                        </span>
                        <span className="text-zinc-900 dark:text-white">
                          {message.cc.map((r) => r.email).join(", ")}
                        </span>
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Labels */}
        {message.labels && message.labels.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.labels.map((label) => (
              <span
                key={label.labelId}
                className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                style={{
                  backgroundColor: `${label.labelColor}20`,
                  color: label.labelColor,
                }}
              >
                {label.labelName}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* AI Summary Card */}
      {hasSummary && showAiSummary && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 shrink-0"
        >
          <div className="relative overflow-hidden rounded-xl border border-violet-200 bg-linear-to-br from-violet-50 to-blue-50 p-4 dark:border-violet-800/50 dark:from-violet-950/30 dark:to-blue-950/30">
            {/* Dismiss button */}
            <button
              onClick={() => setShowAiSummary(false)}
              className="absolute right-2 top-2 rounded-full p-1 text-violet-400 hover:bg-violet-100 hover:text-violet-600 dark:hover:bg-violet-900/50"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">AI Summary</span>
            </div>

            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              {message.summary?.summary}
            </p>

            {/* Key points */}
            {message.summary?.keyPoints &&
              message.summary.keyPoints.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Key Points
                  </p>
                  <ul className="mt-1 space-y-1">
                    {message.summary.keyPoints.map((point, index) => (
                      <li
                        key={point + " " + index}
                        className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                      >
                        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Action items */}
            {message.summary?.actionItems &&
              message.summary.actionItems.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Action Items
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {message.summary.actionItems.map((item, index) => (
                      <span
                        key={item.dueDate + " " + index}
                        className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                      >
                        <Clock className="h-3 w-3" />
                        {item.text}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </motion.div>
      )}

      {/* Attachments */}
      {message.hasAttachments && message.attachments.length > 0 && (
        <div className="mx-4 mt-4 shrink-0">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <Paperclip className="h-4 w-4" />
              <span>{message.attachments.length} attachment(s)</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {message.attachments.map((attachment) => (
                <button
                  key={attachment.id}
                  className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm transition-colors hover:border-violet-300 hover:bg-violet-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-violet-700 dark:hover:bg-violet-950/30"
                >
                  <Paperclip className="h-4 w-4 text-zinc-500" />
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {attachment.filename}
                  </span>
                  <span className="text-xs text-zinc-500">
                    ({formatFileSize(attachment.size)})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Email body */}
      <div className="flex-1 overflow-y-auto p-4">
        {message.bodyHtml ? (
          <div
            className="prose prose-sm max-w-none dark:prose-invert prose-a:text-violet-600 dark:prose-a:text-violet-400"
            dangerouslySetInnerHTML={{ __html: message.bodyHtml }}
          />
        ) : (
          <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-700 dark:text-zinc-300">
            {message.bodyText || message.snippet || "No content"}
          </pre>
        )}
      </div>

      {/* Reply actions */}
      <div className="shrink-0 border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onReply(message.id)}
            className="flex-1 bg-linear-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30"
          >
            <Reply className="mr-2 h-4 w-4" />
            Reply
          </Button>
          <Button variant="outline">
            <ReplyAll className="mr-2 h-4 w-4" />
            Reply All
          </Button>
          <Button variant="outline">
            <Forward className="mr-2 h-4 w-4" />
            Forward
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageDetail;

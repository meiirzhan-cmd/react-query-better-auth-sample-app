"use client";

import { Button } from "@/components/ui/button";
import { useInboxStore } from "@/stores/inbox-store";
import { motion, AnimatePresence } from "motion/react";
import {
  Archive,
  Trash2,
  Mail,
  MailOpen,
  Star,
  Tag,
  X,
  CheckSquare,
  Square,
} from "lucide-react";
import { useState } from "react";
import ActionButton from "./ActionButton";

interface MessageActionsProps {
  totalCount: number;
  onArchive: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;
  onMarkRead: (ids: string[]) => void;
  onMarkUnread: (ids: string[]) => void;
  onStar: (ids: string[]) => void;
  onUnstar: (ids: string[]) => void;
}

export function MessageActions({
  totalCount,
  onArchive,
  onDelete,
  onMarkRead,
  onMarkUnread,
  onStar,
  onUnstar,
}: Readonly<MessageActionsProps>) {
  const { selectedMessageIds, toggleMultiSelectMode, clearSelection } =
    useInboxStore();

  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const selectedCount = selectedMessageIds.size;
  const allSelected = selectedCount === totalCount && totalCount > 0;

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      // This would need the actual message IDs
      // For now, we'll toggle multi-select mode
      toggleMultiSelectMode();
    }
  };

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-0 right-0 top-0 z-20 border-b border-zinc-200 bg-white/95 px-4 py-2 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/95"
        >
          <div className="flex items-center justify-between">
            {/* Left: Selection info */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSelectAll}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                {allSelected ? (
                  <CheckSquare className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                  {selectedCount} selected
                </span>

                <button
                  onClick={clearSelection}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              </motion.div>
            </div>

            {/* Center: Actions */}
            <div className="flex items-center gap-1">
              <ActionButton
                icon={Archive}
                label="Archive"
                onClick={() => onArchive(Array.from(selectedMessageIds))}
                variant="default"
              />
              <ActionButton
                icon={Trash2}
                label="Delete"
                onClick={() => onDelete(Array.from(selectedMessageIds))}
                variant="danger"
              />

              <div className="mx-2 h-5 w-px bg-zinc-200 dark:bg-zinc-700" />

              <ActionButton
                icon={MailOpen}
                label="Mark read"
                onClick={() => onMarkRead(Array.from(selectedMessageIds))}
              />
              <ActionButton
                icon={Mail}
                label="Mark unread"
                onClick={() => onMarkUnread(Array.from(selectedMessageIds))}
              />

              <div className="mx-2 h-5 w-px bg-zinc-200 dark:bg-zinc-700" />

              <ActionButton
                icon={Star}
                label="Star"
                onClick={() => onStar(Array.from(selectedMessageIds))}
              />

              {/* Label dropdown */}
              <div className="relative">
                <ActionButton
                  icon={Tag}
                  label="Label"
                  onClick={() => setShowLabelMenu(!showLabelMenu)}
                  hasDropdown
                />

                <AnimatePresence>
                  {showLabelMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <p className="mb-2 px-2 text-xs font-semibold text-zinc-500">
                        Apply label
                      </p>
                      {/* Sample labels - would come from store */}
                      {[
                        { name: "Urgent", color: "#EF4444" },
                        { name: "Work", color: "#3B82F6" },
                        { name: "Personal", color: "#10B981" },
                      ].map((label) => (
                        <button
                          key={label.name}
                          onClick={() => setShowLabelMenu(false)}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        >
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: label.color }}
                          />
                          {label.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: Close */}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Done
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MessageActions;

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Inbox,
  Send,
  Star,
  Archive,
  Trash2,
  AlertCircle,
  Reply,
  Settings,
  Plus,
  RefreshCw,
  Moon,
  Sun,
  LogOut,
  FileEdit,
  Tag,
  Sparkles,
  User,
  CreditCard,
  Link as LinkIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils/utils";
import { useUIStore } from "@/stores/ui-store";
import { useInboxStore } from "@/stores/inbox-store";
import { useComposeStore } from "@/stores/compose-store";

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  category: string;
  keywords?: string[];
  shortcut?: string;
  action: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const {
    isCommandPaletteOpen,
    closeCommandPalette,
    commandPaletteQuery,
    setCommandPaletteQuery,
  } = useUIStore();
  const { setActiveFolder } = useInboxStore();
  const { openCompose } = useComposeStore();

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Define commands
  const commands = useMemo<CommandItem[]>(() => {
    return [
      // Quick Actions
      {
        id: "compose",
        title: "Compose New Email",
        icon: Plus,
        category: "Quick Actions",
        shortcut: "C",
        keywords: ["new", "write", "create"],
        action: () => {
          openCompose({ mode: "new" });
          closeCommandPalette();
        },
      },
      {
        id: "sync",
        title: "Sync Emails",
        icon: RefreshCw,
        category: "Quick Actions",
        shortcut: "R",
        keywords: ["refresh", "fetch", "update"],
        action: () => {
          // Trigger sync
          closeCommandPalette();
        },
      },

      // Navigation
      {
        id: "inbox",
        title: "Go to Inbox",
        icon: Inbox,
        category: "Navigation",
        shortcut: "G I",
        keywords: ["home", "main"],
        action: () => {
          router.push("/inbox");
          setActiveFolder("inbox");
          closeCommandPalette();
        },
      },
      {
        id: "sent",
        title: "Go to Sent",
        icon: Send,
        category: "Navigation",
        shortcut: "G S",
        action: () => {
          router.push("/inbox?folder=sent");
          setActiveFolder("sent");
          closeCommandPalette();
        },
      },
      {
        id: "drafts",
        title: "Go to Drafts",
        icon: FileEdit,
        category: "Navigation",
        shortcut: "G D",
        action: () => {
          router.push("/inbox?folder=drafts");
          setActiveFolder("drafts");
          closeCommandPalette();
        },
      },
      {
        id: "starred",
        title: "Go to Starred",
        icon: Star,
        category: "Navigation",
        keywords: ["favorites", "important"],
        action: () => {
          router.push("/inbox?folder=starred");
          setActiveFolder("starred");
          closeCommandPalette();
        },
      },
      {
        id: "archive",
        title: "Go to Archive",
        icon: Archive,
        category: "Navigation",
        action: () => {
          router.push("/inbox?folder=archive");
          setActiveFolder("archive");
          closeCommandPalette();
        },
      },
      {
        id: "trash",
        title: "Go to Trash",
        icon: Trash2,
        category: "Navigation",
        action: () => {
          router.push("/inbox?folder=trash");
          setActiveFolder("trash");
          closeCommandPalette();
        },
      },
      {
        id: "digest",
        title: "Go to Daily Digest",
        icon: Sparkles,
        category: "Navigation",
        keywords: ["summary", "overview"],
        action: () => {
          router.push("/digest");
          closeCommandPalette();
        },
      },

      // Smart Labels
      {
        id: "urgent",
        title: "View Urgent Emails",
        subtitle: "3 emails",
        icon: AlertCircle,
        category: "Smart Labels",
        keywords: ["important", "critical"],
        action: () => {
          router.push("/inbox?label=urgent");
          closeCommandPalette();
        },
      },
      {
        id: "needs-reply",
        title: "View Needs Reply",
        subtitle: "5 emails",
        icon: Reply,
        category: "Smart Labels",
        keywords: ["respond", "answer"],
        action: () => {
          router.push("/inbox?label=needs-reply");
          closeCommandPalette();
        },
      },

      // Settings
      {
        id: "settings",
        title: "Settings",
        icon: Settings,
        category: "Settings",
        keywords: ["preferences", "options"],
        action: () => {
          router.push("/settings");
          closeCommandPalette();
        },
      },
      {
        id: "account",
        title: "Account Settings",
        icon: User,
        category: "Settings",
        keywords: ["profile"],
        action: () => {
          router.push("/settings/account");
          closeCommandPalette();
        },
      },
      {
        id: "connections",
        title: "Email Connections",
        icon: LinkIcon,
        category: "Settings",
        keywords: ["gmail", "outlook", "link"],
        action: () => {
          router.push("/settings/connections");
          closeCommandPalette();
        },
      },
      {
        id: "billing",
        title: "Billing & Plans",
        icon: CreditCard,
        category: "Settings",
        keywords: ["subscription", "payment"],
        action: () => {
          router.push("/settings/billing");
          closeCommandPalette();
        },
      },
      {
        id: "labels",
        title: "Manage Labels",
        icon: Tag,
        category: "Settings",
        keywords: ["tags", "categories"],
        action: () => {
          router.push("/settings/labels");
          closeCommandPalette();
        },
      },

      // Theme
      {
        id: "theme-light",
        title: "Switch to Light Mode",
        icon: Sun,
        category: "Appearance",
        keywords: ["bright", "day"],
        action: () => {
          setTheme("light");
          closeCommandPalette();
        },
      },
      {
        id: "theme-dark",
        title: "Switch to Dark Mode",
        icon: Moon,
        category: "Appearance",
        keywords: ["night"],
        action: () => {
          setTheme("dark");
          closeCommandPalette();
        },
      },

      // Account
      {
        id: "logout",
        title: "Sign Out",
        icon: LogOut,
        category: "Account",
        keywords: ["exit", "leave"],
        action: () => {
          // Handle logout
          closeCommandPalette();
        },
      },
    ];
  }, [closeCommandPalette, openCompose, router, setActiveFolder, setTheme]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!commandPaletteQuery) return commands;

    const query = commandPaletteQuery.toLowerCase();
    return commands.filter((cmd) => {
      const searchText = [
        cmd.title,
        cmd.subtitle,
        cmd.category,
        ...(cmd.keywords || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchText.includes(query);
    });
  }, [commands, commandPaletteQuery]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isCommandPaletteOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case "Escape":
          e.preventDefault();
          closeCommandPalette();
          break;
      }
    },
    [
      isCommandPaletteOpen,
      filteredCommands,
      selectedIndex,
      closeCommandPalette,
    ],
  );

  // Global keyboard shortcut (Cmd+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isCommandPaletteOpen) {
          closeCommandPalette();
        } else {
          setCommandPaletteQuery("");
          setSelectedIndex(0);
          // Open via store
          useUIStore.getState().openCommandPalette();
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isCommandPaletteOpen, closeCommandPalette, setCommandPaletteQuery]);

  // Navigation keyboard listener
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [commandPaletteQuery]);

  if (!isCommandPaletteOpen) return null;

  let itemIndex = 0;

  return (
    <>
      {/* Backdrop */}
      <button
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={closeCommandPalette}
      />

      {/* Command Palette */}
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2">
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-800">
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b border-zinc-200 px-4 dark:border-zinc-700">
            <Search className="h-5 w-5 text-zinc-400" />
            <input
              type="text"
              value={commandPaletteQuery}
              onChange={(e) => setCommandPaletteQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="h-14 flex-1 bg-transparent text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
              autoFocus
            />
            <kbd className="rounded border border-zinc-200 bg-zinc-100 px-2 py-1 text-xs text-zinc-500 dark:border-zinc-600 dark:bg-zinc-700">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="py-8 text-center text-sm text-zinc-500">
                No results found for &quot;{commandPaletteQuery}&quot;
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, items]) => (
                <div key={category}>
                  <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {category}
                  </div>
                  {items.map((item) => {
                    const currentIndex = itemIndex++;
                    const isSelected = currentIndex === selectedIndex;

                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                          isSelected
                            ? "bg-violet-100 text-violet-900 dark:bg-violet-900/50 dark:text-violet-100"
                            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isSelected
                              ? "text-violet-600 dark:text-violet-400"
                              : "text-zinc-500",
                          )}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {item.title}
                          </div>
                          {item.subtitle && (
                            <div className="text-xs text-zinc-500">
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                        {item.shortcut && (
                          <kbd className="rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:border-zinc-600 dark:bg-zinc-700">
                            {item.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-200 px-4 py-2 dark:border-zinc-700">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-zinc-200 bg-zinc-100 px-1 dark:border-zinc-600 dark:bg-zinc-700">
                    ↑↓
                  </kbd>
                  {""}to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-zinc-200 bg-zinc-100 px-1 dark:border-zinc-600 dark:bg-zinc-700">
                    ↵
                  </kbd>
                  {""}to select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-zinc-200 bg-zinc-100 px-1 dark:border-zinc-600 dark:bg-zinc-700">
                  ⌘K
                </kbd>
                {""}to toggle
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

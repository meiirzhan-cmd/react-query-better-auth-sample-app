"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { useComposeStore } from "@/stores/compose-store";
import { useUIStore } from "@/stores/ui-store";
import {
  PanelLeft,
  PanelLeftClose,
  Plus,
  Settings,
  Sparkles,
  Tag,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SectionHeader from "./sidebar/SectionHeader";
import NavLink from "./sidebar/NavLink";
import { mainNavItems, smartLabels } from "./sidebar/data";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface SidebarProps {
  user: User;
}

const Sidebar = ({ user }: Readonly<SidebarProps>) => {
  const pathname = usePathname();
  const {
    sidebarView,
    setSidebarView,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
  } = useUIStore();
  const { openCompose } = useComposeStore();

  const [isSmartLabelsOpen, setIsSmartLabelsOpen] = useState(true);
  const [isCustomLabelsOpen, setIsCustomLabelsOpen] = useState(true);

  const isCollapsed = sidebarView === "collapsed";

  // Close mobile sidebar on navigation
  const handleNavClick = () => {
    if (isMobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex h-full flex-col border-r border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900",
          isCollapsed ? "w-16" : "w-64",
          // Mobile positioning
          "fixed left-0 top-0 z-50 lg:relative",
          isMobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo & Toggle */}
        <div
          className={cn(
            "flex h-14 items-center border-b border-zinc-200 dark:border-zinc-800",
            isCollapsed ? "justify-center px-2" : "justify-between px-4",
          )}
        >
          {!isCollapsed && (
            <Link
              href="/inbox"
              className="flex items-center gap-2"
              onClick={handleNavClick}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-600 to-blue-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-zinc-900 dark:text-white">
                Inbox Zero
              </span>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              setSidebarView(isCollapsed ? "default" : "collapsed")
            }
            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Compose Button */}
        <div className={cn("p-3", isCollapsed && "px-2")}>
          <Button
            onClick={() => openCompose({ mode: "new" })}
            className={cn(
              "bg-linear-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30",
              isCollapsed ? "w-full justify-center px-0" : "w-full",
            )}
          >
            <Plus className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Compose</span>}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3">
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.name}
                item={item}
                isActive={
                  pathname === item.href ||
                  (item.href === "/inbox" &&
                    pathname.startsWith("/inbox") &&
                    !pathname.includes("?"))
                }
                isCollapsed={isCollapsed}
                onClick={handleNavClick}
              />
            ))}
          </div>

          {/* Smart Labels Section */}
          <div className="mt-6">
            <SectionHeader
              title="Smart Labels"
              icon={Zap}
              isOpen={isSmartLabelsOpen}
              onToggle={() => setIsSmartLabelsOpen(!isSmartLabelsOpen)}
              isCollapsed={isCollapsed}
            />
            {isSmartLabelsOpen && (
              <div className="mt-1 space-y-1">
                {smartLabels.map((item) => (
                  <NavLink
                    key={item.name}
                    item={item}
                    isActive={pathname.includes(
                      `label=${item.name.toLowerCase()}`,
                    )}
                    isCollapsed={isCollapsed}
                    onClick={handleNavClick}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Custom Labels Section */}
          <div className="mt-6">
            <SectionHeader
              title="Labels"
              icon={Tag}
              isOpen={isCustomLabelsOpen}
              onToggle={() => setIsCustomLabelsOpen(!isCustomLabelsOpen)}
              isCollapsed={isCollapsed}
              action={
                !isCollapsed && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-5 w-5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )
              }
            />
            {isCustomLabelsOpen && !isCollapsed && (
              <div className="mt-1 space-y-1">
                <p className="px-3 py-2 text-xs text-zinc-500">
                  No custom labels yet
                </p>
              </div>
            )}
          </div>
        </nav>

        {/* Digest Preview */}
        {!isCollapsed && (
          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
            <Link
              href="/digest"
              className="block rounded-lg border border-zinc-200 bg-linear-to-br from-violet-50 to-blue-50 p-3 transition-all hover:border-violet-300 dark:border-zinc-700 dark:from-violet-950/50 dark:to-blue-950/50 dark:hover:border-violet-700"
              onClick={handleNavClick}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white">
                <Sparkles className="h-4 w-4 text-violet-600" />
                Daily Digest
              </div>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                3 urgent, 5 need reply
              </p>
            </Link>
          </div>
        )}

        {/* User & Settings */}
        <div
          className={cn(
            "border-t border-zinc-200 dark:border-zinc-800",
            isCollapsed ? "p-2" : "p-4",
          )}
        >
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Button variant="ghost" size="icon-sm" asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-violet-600 to-blue-600 text-xs font-medium text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-violet-600 to-blue-600 text-sm font-medium text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                  {user.name}
                </p>
                <p className="truncate text-xs text-zinc-500">{user.email}</p>
              </div>
              <Button variant="ghost" size="icon-sm" asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

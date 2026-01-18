"use client";

import { logout } from "@/app/(auth)/logout/action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/utils";
import { useInboxStore } from "@/stores/inbox-store";
import { useUIStore } from "@/stores/ui-store";
import {
  Menu,
  Search,
  RefreshCw,
  Command,
  Bell,
  Sun,
  Moon,
  Laptop,
  User,
  Settings,
  Keyboard,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import NotificationItem from "./header/NotificationItem";
import ProfileMenuItem from "./header/ProfileMenuItem";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface HeaderProps {
  user: User;
}

export function Header({ user }: Readonly<HeaderProps>) {
  const { setMobileSidebarOpen, openCommandPalette, openModal } = useUIStore();
  const { searchQuery, setSearchQuery, setIsSearching } = useInboxStore();
  const { theme, setTheme } = useTheme();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    // Trigger search - in real app, this would make API call
    setTimeout(() => setIsSearching(false), 500);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    // Mock sync - in real app, this would trigger email sync
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSyncing(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="search"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-9 md:w-80"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none rounded border border-zinc-200 bg-zinc-100 px-1.5 font-mono text-[10px] font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 sm:block">
            ⌘K
          </kbd>
        </form>

        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="sm:hidden"
          onClick={openCommandPalette}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Sync Button */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleSync}
          disabled={isSyncing}
          className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
        </Button>

        {/* Command Palette Button */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={openCommandPalette}
          className="hidden text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white sm:flex"
        >
          <Command className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              3
            </span>
          </Button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <>
              <button
                className="fixed inset-0 z-40"
                onClick={() => setIsNotificationsOpen(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-white">
                  Notifications
                </h3>
                <div className="mt-3 space-y-3">
                  <NotificationItem
                    title="Sync completed"
                    description="156 new emails processed"
                    time="2 min ago"
                    type="success"
                  />
                  <NotificationItem
                    title="Digest ready"
                    description="Your daily digest is ready to view"
                    time="8:00 AM"
                    type="info"
                  />
                  <NotificationItem
                    title="Urgent emails"
                    description="3 urgent emails need your attention"
                    time="Yesterday"
                    type="warning"
                  />
                </div>
                <Button variant="ghost" className="mt-3 w-full text-sm">
                  View all notifications
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-violet-600 to-blue-600 text-sm font-medium text-white hover:opacity-90"
          >
            {user.name.charAt(0).toUpperCase()}
          </Button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <>
              <button
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                {/* User Info */}
                <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-xs text-zinc-500">{user.email}</p>
                </div>

                {/* Theme Switcher */}
                <div className="border-b border-zinc-200 px-2 py-2 dark:border-zinc-700">
                  <p className="px-2 py-1 text-xs font-medium text-zinc-500">
                    Theme
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant={theme === "light" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setTheme("light")}
                      className="flex-1"
                    >
                      <Sun className="mr-1 h-3 w-3" />
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setTheme("dark")}
                      className="flex-1"
                    >
                      <Moon className="mr-1 h-3 w-3" />
                      Dark
                    </Button>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <ProfileMenuItem href="/settings/account" icon={User}>
                    Account Settings
                  </ProfileMenuItem>
                  <ProfileMenuItem href="/settings" icon={Settings}>
                    Preferences
                  </ProfileMenuItem>
                  <ProfileMenuItem
                    onClick={() => openModal({ type: "keyboardShortcuts" })}
                    icon={Keyboard}
                  >
                    Keyboard Shortcuts
                  </ProfileMenuItem>
                  <ProfileMenuItem href="/help" icon={HelpCircle}>
                    Help & Support
                  </ProfileMenuItem>
                </div>

                {/* Logout */}
                <div className="border-t border-zinc-200 py-1 dark:border-zinc-700">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

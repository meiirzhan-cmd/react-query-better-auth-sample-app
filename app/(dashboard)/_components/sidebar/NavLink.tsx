import Link from "next/link";
import { NavItem } from "./type";
import React from "react";
import { cn } from "@/lib/utils/utils";

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}

const NavLink = ({ item, isActive, isCollapsed, onClick }: NavLinkProps) => {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        isCollapsed && "justify-center px-2",
        isActive
          ? "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
      )}
    >
      <item.icon
        className="h-4 w-4 shrink-0"
        style={item.color ? { color: item.color } : undefined}
      />
      {!isCollapsed && (
        <>
          <span className="flex-1">{item.name}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                isActive
                  ? "bg-violet-200 text-violet-700 dark:bg-violet-800 dark:text-violet-200"
                  : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400",
              )}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
};

export default NavLink;

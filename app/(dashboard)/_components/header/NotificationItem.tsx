import { cn } from "@/lib/utils/utils";
import React from "react";

interface NotificationItemProps {
  title: string;
  description: string;
  time: string;
  type: "success" | "info" | "warning" | "error";
}

const NotificationItem = ({
  title,
  description,
  time,
  type,
}: NotificationItemProps) => {
  const colors = {
    success:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400",
    info: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
    warning:
      "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400",
    error: "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400",
  };

  return (
    <div className="flex gap-3">
      <div className={cn("h-2 w-2 rounded-full mt-2", colors[type])} />
      <div className="flex-1">
        <p className="text-sm font-medium text-zinc-900 dark:text-white">
          {title}
        </p>
        <p className="text-xs text-zinc-500">{description}</p>
        <p className="mt-1 text-xs text-zinc-400">{time}</p>
      </div>
    </div>
  );
};

export default NotificationItem;

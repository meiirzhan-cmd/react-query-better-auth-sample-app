"use client";

import MessageItemSkeleton from "./MessageItemSkeleton";
import { Skeleton } from "./Skeleton";

interface MessageListSkeletonProps {
  count?: number;
}

export function MessageListSkeleton({
  count = 5,
}: Readonly<MessageListSkeletonProps>) {
  return (
    <div className="flex flex-col">
      {/* Header skeleton */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>

      {/* Message skeletons */}
      <div className="flex-1 space-y-2 p-4">
        {Array.from({ length: count }).map((_, index) => (
          <MessageItemSkeleton key={count + " " + index} delay={index * 0.05} />
        ))}
      </div>
    </div>
  );
}

export default MessageListSkeleton;

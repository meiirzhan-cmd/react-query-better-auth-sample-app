import { Skeleton } from "./Skeleton";
import { motion } from "motion/react";

interface MessageItemSkeletonProps {
  delay?: number;
}

const MessageItemSkeleton = ({ delay = 0 }: MessageItemSkeletonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="relative flex items-start gap-3 rounded-xl border border-zinc-200/60 bg-white p-4 dark:border-zinc-800/60 dark:bg-zinc-900/50"
    >
      {/* Avatar skeleton */}
      <Skeleton className="h-9 w-9 rounded-full shrink-0" />

      {/* Content skeleton */}
      <div className="min-w-0 flex-1 space-y-2">
        {/* Top row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <Skeleton className="h-3 w-12" />
        </div>

        {/* Subject */}
        <Skeleton className="h-4 w-3/4" />

        {/* Snippet */}
        <Skeleton className="h-3 w-full" />

        {/* Labels */}
        <div className="flex gap-1.5 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>

      {/* Right actions skeleton */}
      <div className="flex flex-col items-center gap-2 shrink-0">
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>

      {/* Shimmer effect overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
        <motion.div
          className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent"
          animate={{
            translateX: ["100%", "-100%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
            delay: delay,
          }}
        />
      </div>
    </motion.div>
  );
};

export default MessageItemSkeleton;

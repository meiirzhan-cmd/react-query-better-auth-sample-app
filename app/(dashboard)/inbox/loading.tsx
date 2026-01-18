import { motion } from "motion/react";
import React from "react";
import { Skeleton } from "./_components/skeletons/Skeleton";
import MessageDetailSkeleton from "./_components/skeletons/MessageDetailSkeleton";

const loading = () => {
  return (
    <div className="flex h-full">
      {/* Message list skeleton */}
      <div className="w-full border-r border-zinc-200 dark:border-zinc-800 lg:w-420px">
        {/* Filter bar skeleton */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>

        {/* Header skeleton */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>

        {/* Message list skeleton */}
        <div className="space-y-2 p-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <MessageSkeletonItem key={index} delay={index * 0.05} />
          ))}
        </div>
      </div>

      {/* Detail panel skeleton - hidden on mobile */}
      <div className="hidden flex-1 lg:flex">
        <MessageDetailSkeleton />
      </div>
    </div>
  );
};

function MessageSkeletonItem({ delay }: Readonly<{ delay: number }>) {
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
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <div className="flex gap-1.5 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>

      {/* Right side skeleton */}
      <div className="flex flex-col items-center gap-2 shrink-0">
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>

      {/* Shimmer overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
        <motion.div
          className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/5 to-transparent dark:via-white/10"
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
}

export default loading;

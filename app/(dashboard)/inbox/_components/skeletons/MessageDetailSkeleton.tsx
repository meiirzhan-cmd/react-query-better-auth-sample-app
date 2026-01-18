"use client";

import { motion } from "motion/react";
import { Skeleton } from "./Skeleton";

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5"];

const MessageDetailSkeleton = () => {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        {/* Actions bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {SKELETON_KEYS.map((key) => (
              <Skeleton key={key} className="h-8 w-8 rounded-lg" />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>

        {/* Subject */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Skeleton className="h-7 w-3/4 mb-4" />
        </motion.div>

        {/* Sender info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex items-start gap-4"
        >
          <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mx-4 mt-4"
      >
        <div className="rounded-xl border border-violet-200 bg-linear-to-br from-violet-50 to-blue-50 p-4 dark:border-violet-800/50 dark:from-violet-950/30 dark:to-blue-950/30">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-2" />
          <Skeleton className="h-4 w-4/6" />

          <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-6 w-40 rounded-full" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Email body */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="flex-1 overflow-y-auto p-4"
      >
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/6" />
          <div className="py-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <div className="py-2" />
          <Skeleton className="h-4 w-2/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </motion.div>

      {/* Reply action */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="border-t border-zinc-200 p-4 dark:border-zinc-800"
      >
        <Skeleton className="h-12 w-full rounded-xl" />
      </motion.div>
    </div>
  );
};

export default MessageDetailSkeleton;

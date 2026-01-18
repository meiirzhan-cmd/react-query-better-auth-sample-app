"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: Readonly<EmptyStateProps>) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex h-full flex-col items-center justify-center p-8 text-center",
        className,
      )}
    >
      {/* Animated icon container */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.1,
        }}
        className="relative"
      >
        {/* Background glow */}
        <div className="absolute inset-0 -m-4 rounded-full bg-linear-to-br from-violet-200 to-blue-200 opacity-40 blur-2xl dark:from-violet-900/50 dark:to-blue-900/50" />

        {/* Icon container */}
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-violet-100 to-blue-100 shadow-lg shadow-violet-500/10 dark:from-violet-900/50 dark:to-blue-900/50"
        >
          <Icon className="h-10 w-10 text-violet-600 dark:text-violet-400" />
        </motion.div>

        {/* Decorative particles */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-2 -top-2 h-3 w-3 rounded-full bg-violet-400 dark:bg-violet-500"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute -bottom-1 -left-3 h-2 w-2 rounded-full bg-blue-400 dark:bg-blue-500"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-2 right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 dark:bg-emerald-500"
        />
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-8"
      >
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
          {title}
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </motion.div>

      {/* Action button */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6"
        >
          <Button
            onClick={action.onClick}
            variant="outline"
            className="border-violet-200 hover:border-violet-300 hover:bg-violet-50 dark:border-violet-800 dark:hover:border-violet-700 dark:hover:bg-violet-950/50"
          >
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default EmptyState;

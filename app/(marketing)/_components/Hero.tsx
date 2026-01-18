"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Mail,
  Sparkles,
  Zap,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { motion } from "motion/react";
import { itemVariants } from "../motion";
import { cn } from "@/lib/utils/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-32 sm:pb-32 sm:pt-40">
      <motion.div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Email Management
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl lg:text-7xl"
          >
            Achieve{" "}
            <span className="relative">
              <span className="relative z-10 bg-linear-to-r from-violet-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
                Inbox Zero
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-linear-to-r from-violet-200 to-blue-200 opacity-50 blur-sm dark:from-violet-800 dark:to-blue-800" />
            </span>{" "}
            <br className="hidden sm:block" />
            Without the Stress
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-xl"
          >
            Let AI handle your email overload. Get smart summaries, intelligent
            labeling, and daily digests that help you focus on what matters.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="group h-12 bg-linear-to-r from-violet-600 to-blue-600 px-8 text-base font-semibold text-white shadow-xl shadow-violet-500/25 transition-all hover:shadow-2xl hover:shadow-violet-500/30"
            >
              <Link href="/register">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 border-zinc-300 px-8 text-base font-semibold dark:border-zinc-700"
            >
              <Link href="#features">See How It Works</Link>
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8"
          >
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Setup in 2 minutes
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Works with Gmail & Outlook
            </div>
          </motion.div>
        </div>

        {/* Hero Illustration */}
        <motion.div
          variants={itemVariants}
          className="relative mx-auto mt-20 max-w-5xl"
        >
          {/* Main Dashboard Preview */}
          <div className="relative rounded-2xl border border-zinc-200/50 bg-white/80 p-2 shadow-2xl shadow-zinc-900/10 backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-900/80 dark:shadow-black/20">
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-100 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="ml-4 flex-1 rounded-lg bg-white px-4 py-1.5 text-xs text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
                  app.inboxzero.ai/inbox
                </div>
              </div>

              {/* App Preview */}
              <div className="flex h-400px sm:h-500px">
                {/* Sidebar */}
                <div className="hidden w-64 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:block">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-violet-600 to-blue-600">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      Inbox Zero
                    </span>
                  </div>
                  <nav className="space-y-1">
                    {[
                      { icon: Mail, label: "Inbox", count: 12, active: true },
                      { icon: Zap, label: "Urgent", count: 3 },
                      { icon: Shield, label: "Needs Reply", count: 5 },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                          item.active
                            ? "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300"
                            : "text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            item.active
                              ? "bg-violet-200 text-violet-700 dark:bg-violet-800 dark:text-violet-200"
                              : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
                          }`}
                        >
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </nav>
                </div>

                {/* Email List */}
                <div className="flex-1 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                      Today&apos;s Digest
                    </h2>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                      AI Summarized
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        from: "Product Team",
                        subject: "Q1 Launch Timeline",
                        summary: "Review needed for feature specs",
                        priority: "urgent",
                        time: "2h ago",
                      },
                      {
                        from: "Sarah Chen",
                        subject: "Re: Partnership Proposal",
                        summary: "Confirmed meeting for Thursday",
                        priority: "normal",
                        time: "4h ago",
                      },
                      {
                        from: "GitHub",
                        subject: "PR Review Requested",
                        summary: "3 new pull requests awaiting review",
                        priority: "fyi",
                        time: "5h ago",
                      },
                    ].map((email, i) => (
                      <motion.div
                        key={email.subject + i}
                        variants={floatingVariants}
                        animate="animate"
                        style={{ animationDelay: `${i * 0.5}s` }}
                        className="group cursor-pointer rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-violet-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-violet-700"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-zinc-900 dark:text-white">
                                {email.from}
                              </span>
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
                                  email.priority === "urgent" &&
                                    "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
                                  email.priority === "fyi" &&
                                    "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
                                  email.priority === "normal" &&
                                    "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400",
                                )}
                              >
                                {email.priority}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                              {email.subject}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                              <Sparkles className="mr-1 inline-block h-3 w-3 text-violet-500" />
                              {email.summary}
                            </p>
                          </div>
                          <span className="text-xs text-zinc-400">
                            {email.time}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <motion.div
            animate={{
              y: [-5, 5, -5],
              rotate: [-2, 2, -2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -left-8 top-1/4 hidden rounded-xl border border-emerald-200 bg-white p-4 shadow-xl dark:border-emerald-800 dark:bg-zinc-900 lg:block"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  +47% productivity
                </p>
                <p className="text-xs text-zinc-500">this week</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{
              y: [5, -5, 5],
              rotate: [2, -2, 2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute -right-8 bottom-1/4 hidden rounded-xl border border-violet-200 bg-white p-4 shadow-xl dark:border-violet-800 dark:bg-zinc-900 lg:block"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900">
                <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  156 emails processed
                </p>
                <p className="text-xs text-zinc-500">AI summarized today</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

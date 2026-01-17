"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Sparkles, Zap, Mail, Bot } from "lucide-react";
import { features } from "../data/index";
import { itemVariants } from "../motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-24 sm:py-32">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-500px w-500px rounded-full bg-linear-to-b from-blue-100/40 to-transparent blur-3xl dark:from-blue-900/20" />
        <div className="absolute bottom-0 right-1/4 h-500px w-500px rounded-full bg-linear-to-t from-violet-100/40 to-transparent blur-3xl dark:from-violet-900/20" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
            <Bot className="h-3.5 w-3.5" />
            Powered by AI
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl lg:text-5xl">
            Everything you need to{" "}
            <span className="bg-linear-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              conquer your inbox
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Intelligent features that work together to give you back your time
            and peace of mind.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 grid gap-6 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200/50 bg-white/80 p-6 backdrop-blur-sm transition-all duration-300 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-900/5 dark:border-zinc-800/50 dark:bg-zinc-900/80 dark:hover:border-zinc-700"
            >
              {/* Gradient hover effect */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.08]`}
              />

              {/* Icon */}
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${feature.gradient} shadow-lg`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>

              {/* Decorative element */}
              <div className="absolute -bottom-12 -right-12 h-24 w-24 rounded-full bg-linear-to-br from-zinc-100 to-transparent opacity-50 transition-transform duration-300 group-hover:scale-150 dark:from-zinc-800" />
            </motion.div>
          ))}
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-24"
        >
          <div className="rounded-3xl border border-zinc-200/50 bg-linear-to-b from-white to-zinc-50/80 p-8 dark:border-zinc-800/50 dark:from-zinc-900 dark:to-zinc-900/50 sm:p-12">
            <div className="mx-auto max-w-3xl text-center">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
                How It Works
              </h3>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Three simple steps to email freedom
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Connect Your Email",
                  description:
                    "Link your Gmail or Outlook account with secure OAuth. No passwords stored.",
                  icon: Mail,
                },
                {
                  step: "02",
                  title: "AI Processes",
                  description:
                    "Our AI reads, summarizes, and categorizes your emails automatically.",
                  icon: Sparkles,
                },
                {
                  step: "03",
                  title: "Stay in Control",
                  description:
                    "Review summaries, take action on what matters, and achieve inbox zero.",
                  icon: Zap,
                },
              ].map((item, index) => (
                <div key={item.step} className="relative text-center">
                  {/* Connection line */}
                  {index < 2 && (
                    <div className="absolute left-[60%] top-8 hidden h-0.5 w-[80%] bg-linear-to-r from-violet-300 to-transparent dark:from-violet-700 md:block" />
                  )}

                  {/* Step number */}
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 to-blue-600 text-xl font-bold text-white shadow-xl shadow-violet-500/25">
                    {item.step}
                  </div>

                  <h4 className="mt-6 text-lg font-semibold text-zinc-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Integrations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-500">
            Works seamlessly with your existing email
          </p>
          <div className="mt-6 flex items-center justify-center gap-8">
            <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900">
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.47 9.47v5.06H2.48a9.82 9.82 0 0 1 0-5.06h2.99z"
                />
                <path
                  fill="#4285F4"
                  d="M12 21.97c-2.62 0-4.88-.87-6.52-2.35l2.48-2.48c1.09.88 2.47 1.43 4.04 1.43 1.49 0 2.87-.5 3.98-1.36l2.48 2.48c-1.74 1.48-4.01 2.28-6.46 2.28z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.47 9.47l-2.99-.01C3.46 7.34 4.8 5.52 6.48 4.16l2.48 2.48c-1.44 1.08-2.49 2.72-2.49 4.53v.3h-1z"
                />
                <path
                  fill="#34A853"
                  d="M21.97 12c0 5.51-4.49 10-10 10-2.62 0-5.01-.99-6.82-2.63l2.48-2.48c1.09.88 2.47 1.43 4.04 1.43 3.52 0 6.4-2.88 6.4-6.4h-6.4V9.03h9.82c.28.94.48 1.93.48 2.97z"
                />
              </svg>
              <span className="font-medium text-zinc-900 dark:text-white">
                Gmail
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900">
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="#0078D4"
                  d="M21.17 2.06H9.17a.83.83 0 0 0-.83.83v18.22c0 .46.37.83.83.83h12a.83.83 0 0 0 .83-.83V2.89a.83.83 0 0 0-.83-.83zM2.83 6.45h5.5v11.1h-5.5a.83.83 0 0 1-.83-.83V7.28c0-.46.37-.83.83-.83z"
                />
              </svg>
              <span className="font-medium text-zinc-900 dark:text-white">
                Outlook
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

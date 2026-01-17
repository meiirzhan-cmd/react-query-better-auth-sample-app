"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";
import { itemVariants } from "../motion";

const testimonials = [
  {
    content:
      "Inbox Zero has completely transformed how I manage email. I used to spend 2 hours a day in my inbox, now it's down to 30 minutes. The AI summaries are incredibly accurate.",
    author: "Sarah Chen",
    role: "Product Manager at TechCorp",
    avatar: "SC",
    rating: 5,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    content:
      "The daily digest feature alone is worth it. I start each morning knowing exactly what needs my attention. It's like having a personal email assistant.",
    author: "Michael Torres",
    role: "Startup Founder",
    avatar: "MT",
    rating: 5,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    content:
      "I was skeptical about AI categorization, but it's surprisingly good at knowing what's urgent vs what can wait. Saved my sanity during launch week.",
    author: "Emily Watson",
    role: "Engineering Lead",
    avatar: "EW",
    rating: 5,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    content:
      "Finally, a tool that understands context. It knows which newsletters I actually read and which are just noise. My inbox has never been cleaner.",
    author: "David Kim",
    role: "Marketing Director",
    avatar: "DK",
    rating: 5,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    content:
      "The smart labeling is a game-changer for our support team. We can prioritize customer emails instantly without manual triage.",
    author: "Lisa Park",
    role: "Customer Success Manager",
    avatar: "LP",
    rating: 5,
    gradient: "from-pink-500 to-rose-500",
  },
  {
    content:
      "I've tried every email productivity tool out there. This is the first one that actually delivers on its promises. Worth every penny.",
    author: "James Miller",
    role: "Consultant",
    avatar: "JM",
    rating: 5,
    gradient: "from-indigo-500 to-violet-500",
  },
];

const stats = [
  { value: "50%", label: "Less time in email" },
  { value: "10k+", label: "Happy users" },
  { value: "2M+", label: "Emails processed" },
  { value: "4.9", label: "Average rating" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="testimonials" className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-blue-50/30 to-transparent dark:via-blue-950/10" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
            <Star className="h-3.5 w-3.5 fill-current" />
            Loved by Thousands
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl lg:text-5xl">
            Don&apos;t just take our word for it
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            See what professionals around the world say about Inbox Zero
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 grid grid-cols-2 gap-8 sm:mt-20 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.author}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200/50 bg-white/80 p-6 backdrop-blur-sm transition-all duration-300 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-900/5 dark:border-zinc-800/50 dark:bg-zinc-900/80 dark:hover:border-zinc-700"
            >
              {/* Quote icon */}
              <Quote className="absolute -right-2 -top-2 h-16 w-16 text-zinc-100 dark:text-zinc-800" />

              {/* Rating */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }, (_, i) => (
                  <Star
                    key={`${testimonial.author}-star-${i}`}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="relative text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br text-sm font-semibold text-white ${testimonial.gradient}`}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-medium text-zinc-900 dark:text-white">
                    {testimonial.author}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-500">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Social Proof Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16"
        >
          <div className="overflow-hidden rounded-2xl border border-zinc-200/50 bg-linear-to-r from-violet-600 to-blue-600 p-8 text-center text-white shadow-xl shadow-violet-500/20 sm:p-12">
            <h3 className="text-2xl font-bold sm:text-3xl">
              Join 10,000+ professionals achieving inbox zero
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-violet-100">
              Start your free trial today and discover why thousands of
              professionals trust Inbox Zero to manage their email.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-violet-600 shadow-lg transition-all hover:bg-violet-50"
              >
                Start Free Trial
              </a>
              <div className="flex items-center gap-2 text-sm text-violet-200">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                No credit card required
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

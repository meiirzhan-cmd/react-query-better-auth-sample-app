"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles, Zap, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { itemVariants } from "../motion";

const plans = [
  {
    name: "Free",
    description: "Perfect for trying out Inbox Zero",
    price: "$0",
    period: "forever",
    icon: Sparkles,
    gradient: "from-zinc-500 to-zinc-600",
    features: [
      { text: "1 email account", included: true },
      { text: "10 AI summaries/day", included: true },
      { text: "5 AI reply drafts/day", included: true },
      { text: "3 custom labels", included: true },
      { text: "Daily digest", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started",
    ctaVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    description: "For professionals who want inbox mastery",
    price: "$9",
    period: "per month",
    icon: Zap,
    gradient: "from-violet-600 to-blue-600",
    features: [
      { text: "3 email accounts", included: true },
      { text: "Unlimited AI summaries", included: true },
      { text: "Unlimited AI reply drafts", included: true },
      { text: "Unlimited custom labels", included: true },
      { text: "Daily digest", included: true },
      { text: "Priority support", included: false },
    ],
    cta: "Start Free Trial",
    ctaVariant: "default" as const,
    popular: true,
  },
  {
    name: "Team",
    description: "For teams that collaborate on email",
    price: "$29",
    period: "per month",
    icon: Building2,
    gradient: "from-emerald-500 to-teal-600",
    features: [
      { text: "10 email accounts", included: true },
      { text: "Unlimited AI features", included: true },
      { text: "Team sharing", included: true },
      { text: "5 team members", included: true },
      { text: "Daily digest", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
    popular: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-violet-50/30 to-transparent dark:via-violet-950/10" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            Simple Pricing
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl lg:text-5xl">
            Choose your path to{" "}
            <span className="bg-linear-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              inbox freedom
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Start free, upgrade when you&apos;re ready. No credit card required.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 grid gap-8 sm:mt-20 lg:grid-cols-3"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={itemVariants}
              className={cn(
                "relative flex flex-col overflow-hidden rounded-2xl border bg-white dark:bg-zinc-900",
                plan.popular
                  ? "border-violet-300 shadow-xl shadow-violet-500/10 dark:border-violet-700"
                  : "border-zinc-200 dark:border-zinc-800",
              )}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute right-4 top-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-linear-to-r from-violet-600 to-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-violet-500/25">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="p-6 pb-0">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br shadow-lg",
                    plan.gradient,
                  )}
                >
                  <plan.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-zinc-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="p-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-zinc-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    /{plan.period}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="flex-1 px-6 pb-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-3">
                      {feature.included ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                          <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <X className="h-3 w-3 text-zinc-400 dark:text-zinc-600" />
                        </div>
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          feature.included
                            ? "text-zinc-700 dark:text-zinc-300"
                            : "text-zinc-400 dark:text-zinc-600",
                        )}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="p-6 pt-0">
                <Button
                  asChild
                  variant={plan.ctaVariant}
                  className={cn(
                    "w-full",
                    plan.popular &&
                      "bg-linear-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30",
                  )}
                >
                  <Link href={plan.name === "Team" ? "/contact" : "/register"}>
                    {plan.cta}
                  </Link>
                </Button>
              </div>

              {/* Decorative gradient */}
              {plan.popular && (
                <div className="absolute -bottom-px left-0 right-0 h-1 bg-linear-to-r from-violet-600 to-blue-600" />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Enterprise CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white/80 px-6 py-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
            <Building2 className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Need enterprise features?
            </span>
            <Link
              href="/contact"
              className="font-medium text-violet-600 underline-offset-4 hover:underline dark:text-violet-400"
            >
              Contact our sales team
            </Link>
          </div>
        </motion.div>

        {/* FAQ Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mx-auto mt-16 max-w-3xl"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes! No contracts, no commitment. Cancel anytime with one click.",
              },
              {
                q: "Is my data secure?",
                a: "Absolutely. We use bank-level encryption and never store raw email content.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl border border-zinc-200 bg-white/50 p-5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50"
              >
                <h4 className="font-semibold text-zinc-900 dark:text-white">
                  {faq.q}
                </h4>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

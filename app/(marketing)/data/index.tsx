import { Sparkles, Tags, FileText, Zap, Clock, Shield, X } from "lucide-react";
import GitHub from "../svg/Github";
import Linkedin from "../svg/Linkedin";

export const navigation = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Integrations", href: "#integrations" },
    { name: "Changelog", href: "/changelog" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
  ],
  resources: [
    { name: "Documentation", href: "/docs" },
    { name: "Help Center", href: "/help" },
    { name: "API Reference", href: "/api" },
    { name: "Status", href: "/status" },
  ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Security", href: "/security" },
    { name: "DPA", href: "/dpa" },
  ],
};

export const social = [
  { name: "X", href: "https://x.com/", icon: X },
  { name: "GitHub", href: "https://github.com", icon: GitHub },
  { name: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
];

export const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Summaries",
    description:
      "Get concise summaries of every email. Know what's important at a glance without reading the full message.",
    color: "violet",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Tags,
    title: "Smart Labeling",
    description:
      "Automatic categorization into Urgent, Needs Reply, FYI, and more. Your inbox organizes itself.",
    color: "blue",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: FileText,
    title: "Daily Digest",
    description:
      "Start your day with a curated summary of your most important emails. Delivered when you want it.",
    color: "emerald",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Zap,
    title: "Priority Detection",
    description:
      "AI identifies urgent messages and action items so you never miss what matters most.",
    color: "amber",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Clock,
    title: "Time Saved",
    description:
      "Reduce time spent in email by up to 50%. Focus on work that actually needs your attention.",
    color: "pink",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your emails are processed securely. We never store raw email content, only AI-generated insights.",
    color: "indigo",
    gradient: "from-indigo-500 to-violet-600",
  },
];

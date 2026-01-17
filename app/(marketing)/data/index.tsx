import {
  Sparkles,
  Tags,
  FileText,
  Zap,
  Clock,
  Shield,
  X,
  Building2,
} from "lucide-react";
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

export const plans = [
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

export const testimonials = [
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

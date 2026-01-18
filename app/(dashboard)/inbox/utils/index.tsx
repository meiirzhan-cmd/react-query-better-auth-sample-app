import LabelBadge from "../_components/LabelBadge";

// Helper to get consistent avatar colors based on email
export function getAvatarColor(email: string): string {
  const colors = [
    "bg-gradient-to-br from-violet-500 to-purple-600 text-white",
    "bg-gradient-to-br from-blue-500 to-cyan-600 text-white",
    "bg-gradient-to-br from-emerald-500 to-teal-600 text-white",
    "bg-gradient-to-br from-amber-500 to-orange-600 text-white",
    "bg-gradient-to-br from-pink-500 to-rose-600 text-white",
    "bg-gradient-to-br from-indigo-500 to-violet-600 text-white",
  ];

  const hash = email
    .split("")
    .reduce((acc, char) => acc + (char.codePointAt(0) ?? 0), 0);
  return colors[hash % colors.length];
}

export function getFolderTitle(folder: string): string {
  const titles: Record<string, string> = {
    inbox: "Inbox",
    sent: "Sent",
    drafts: "Drafts",
    starred: "Starred",
    archive: "Archive",
    trash: "Trash",
    spam: "Spam",
    urgent: "Urgent",
    "needs-reply": "Needs Reply",
    fyi: "FYI",
    newsletter: "Newsletter",
    promotional: "Promotional",
  };

  if (folder.startsWith("label:")) {
    return folder.replace("label:", "");
  }

  return titles[folder] || folder;
}

export function getEmptyTitle(folder: string): string {
  const titles: Record<string, string> = {
    inbox: "All caught up!",
    sent: "No sent emails",
    drafts: "No drafts",
    starred: "No starred emails",
    archive: "Archive is empty",
    trash: "Trash is empty",
    spam: "No spam",
    urgent: "No urgent emails",
    "needs-reply": "All caught up!",
    fyi: "No FYI emails",
    newsletter: "No newsletters",
    promotional: "No promotions",
  };

  return titles[folder] || "No emails";
}

export function getEmptyDescription(folder: string): string {
  const descriptions: Record<string, string> = {
    inbox: "Your inbox is clean. Enjoy your inbox zero moment! 🎉",
    sent: "Emails you send will appear here.",
    drafts: "Save drafts to continue writing later.",
    starred: "Star important emails to find them quickly.",
    archive: "Archived emails will appear here.",
    trash: "Deleted emails will be permanently removed after 30 days.",
    spam: "Emails marked as spam will appear here.",
    urgent: "No emails marked as urgent. Great news!",
    "needs-reply": "You've replied to all your emails. Amazing work!",
    fyi: "Informational emails will appear here.",
    newsletter: "Newsletter subscriptions will appear here.",
    promotional: "Promotional emails will appear here.",
  };

  return descriptions[folder] || "No emails to display.";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  );
}

export type sizeType = "sm" | "md" | "lg";

export function UrgentBadge({ size = "md" }: Readonly<{ size?: sizeType }>) {
  return <LabelBadge name="Urgent" color="#EF4444" size={size} />;
}

export function NeedsReplyBadge({
  size = "md",
}: Readonly<{ size?: sizeType }>) {
  return <LabelBadge name="Needs Reply" color="#F97316" size={size} />;
}

export function FYIBadge({ size = "md" }: Readonly<{ size?: sizeType }>) {
  return <LabelBadge name="FYI" color="#3B82F6" size={size} />;
}

export function NewsletterBadge({
  size = "md",
}: Readonly<{ size?: sizeType }>) {
  return <LabelBadge name="Newsletter" color="#8B5CF6" size={size} />;
}

export function PromotionalBadge({
  size = "md",
}: Readonly<{ size?: sizeType }>) {
  return <LabelBadge name="Promotional" color="#EC4899" size={size} />;
}

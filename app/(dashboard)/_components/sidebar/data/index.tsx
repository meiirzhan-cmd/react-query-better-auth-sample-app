import {
  Inbox,
  Send,
  FileEdit,
  Star,
  Archive,
  Trash2,
  AlertCircle,
  Reply,
  Info,
  Newspaper,
  Tag,
} from "lucide-react";
import { NavItem } from "../type";

export const mainNavItems: NavItem[] = [
  { name: "Inbox", href: "/inbox", icon: Inbox, badge: 12 },
  { name: "Sent", href: "/inbox?folder=sent", icon: Send },
  { name: "Drafts", href: "/inbox?folder=drafts", icon: FileEdit, badge: 3 },
  { name: "Starred", href: "/inbox?folder=starred", icon: Star },
  { name: "Archive", href: "/inbox?folder=archive", icon: Archive },
  { name: "Trash", href: "/inbox?folder=trash", icon: Trash2 },
];

export const smartLabels: NavItem[] = [
  {
    name: "Urgent",
    href: "/inbox?label=urgent",
    icon: AlertCircle,
    color: "#EF4444",
    badge: 3,
  },
  {
    name: "Needs Reply",
    href: "/inbox?label=needs-reply",
    icon: Reply,
    color: "#F97316",
    badge: 5,
  },
  { name: "FYI", href: "/inbox?label=fyi", icon: Info, color: "#3B82F6" },
  {
    name: "Newsletter",
    href: "/inbox?label=newsletter",
    icon: Newspaper,
    color: "#8B5CF6",
  },
  {
    name: "Promotional",
    href: "/inbox?label=promotional",
    icon: Tag,
    color: "#EC4899",
  },
];

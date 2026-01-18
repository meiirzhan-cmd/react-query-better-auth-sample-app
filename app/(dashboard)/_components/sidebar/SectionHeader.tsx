import { ChevronDown, ChevronRight } from "lucide-react";
import React from "react";

interface SectionHeaderProps {
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  action?: React.ReactNode;
}

const SectionHeader = ({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  isCollapsed,
  action,
}: SectionHeaderProps) => {
  if (isCollapsed) {
    return (
      <div className="flex justify-center py-2">
        <Icon className="h-4 w-4 text-zinc-400" />
      </div>
    );
  }

  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500"
    >
      <div className="flex items-center gap-2">
        {isOpen ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {title}
      </div>
      {action}
    </button>
  );
};

export default SectionHeader;

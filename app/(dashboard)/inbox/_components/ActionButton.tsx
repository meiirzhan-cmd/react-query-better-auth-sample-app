import { cn } from "@/lib/utils/utils";
import { ChevronDown } from "lucide-react";

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
  hasDropdown?: boolean;
}

const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = "default",
  hasDropdown = false,
}: ActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
        variant === "danger"
          ? "text-zinc-600 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950/50 dark:hover:text-red-400"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
      {hasDropdown && <ChevronDown className="h-3 w-3" />}
    </button>
  );
};

export default ActionButton;

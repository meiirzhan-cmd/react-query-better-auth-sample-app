import { cn } from "@/lib/utils/utils";
import { X } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { sizeType } from "../utils";

interface LabelBadgeProps {
  name: string;
  color: string;
  size?: sizeType;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ElementType;
  className?: string;
}

const LabelBadge = ({
  name,
  color,
  size = "md",
  removable = false,
  onRemove,
  icon: Icon,
  className,
}: LabelBadgeProps) => {
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px] gap-1",
    md: "px-2 py-0.5 text-xs gap-1.5",
    lg: "px-2.5 py-1 text-sm gap-2",
  };

  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5",
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-colors",
        sizeClasses[size],
        removable && "pr-1",
        className,
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {Icon && <Icon className={iconSizes[size]} />}
      <span>{name}</span>
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
        >
          <X className={iconSizes[size]} />
        </button>
      )}
    </motion.span>
  );
};

export default LabelBadge;

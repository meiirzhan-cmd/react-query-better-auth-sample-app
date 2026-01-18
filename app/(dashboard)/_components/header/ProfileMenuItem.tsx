import Link from "next/link";
import React from "react";

interface ProfileMenuItemProps {
  children: React.ReactNode;
  icon: React.ElementType;
  href?: string;
  onClick?: () => void;
}

const ProfileMenuItem = ({
  children,
  icon: Icon,
  href,
  onClick,
}: ProfileMenuItemProps) => {
  const className =
    "flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700";

  if (href) {
    return (
      <Link href={href} className={className}>
        <Icon className="h-4 w-4" />
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
};

export default ProfileMenuItem;

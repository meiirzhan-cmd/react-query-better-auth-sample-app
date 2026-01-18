import { cn } from "@/lib/utils/utils";

function Skeleton({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };

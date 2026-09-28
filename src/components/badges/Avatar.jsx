import { cn } from "@/lib/utils";

export function Avatar({ initials, name, className }) {
  return (
    <span
      title={name}
      className={cn(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-[10px] font-semibold text-[var(--text-secondary)] ring-1 ring-[var(--border-c)]",
        className
      )}
    >
      {initials}
    </span>
  );
}

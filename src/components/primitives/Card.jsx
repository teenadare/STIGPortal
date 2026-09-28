import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border-c)] bg-[var(--surface)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

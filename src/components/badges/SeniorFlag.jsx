import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

// Standout flag marking content that carries a Senior Review comment.
export function SeniorFlag({ className, label = "Senior Review", compact = false }) {
  return (
    <span
      data-testid="senior-flag"
      title="Senior Review comment"
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-amber-500/60 bg-amber-500/15 font-semibold text-amber-700 dark:text-amber-300 whitespace-nowrap",
        compact ? "px-1 py-0.5 text-[9px]" : "px-1.5 py-0.5 text-[10px]",
        className
      )}
    >
      <ShieldAlert className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} /> {!compact && label}
    </span>
  );
}

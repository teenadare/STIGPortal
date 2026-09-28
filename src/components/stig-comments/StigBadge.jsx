import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

// Small indigo pill showing the number of unread internal notes.
export function StigBadge({ count, className }) {
  if (!count) return null;
  return (
    <span data-testid="stig-unread-badge" title={`${count} unread internal note${count > 1 ? "s" : ""}`} className={cn("inline-flex items-center gap-1 rounded-full bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold text-white", className)}>
      <Lock className="h-2.5 w-2.5" /> {count}
    </span>
  );
}

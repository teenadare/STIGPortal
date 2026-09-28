import { cn } from "@/lib/utils";

const SEV = {
  "CAT I": "bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-300",
  "CAT II": "bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-200",
  "CAT III": "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
};

const SEV_LABEL = {
  "CAT I": "CAT I",
  "CAT II": "CAT II",
  "CAT III": "CAT III",
};

export function SeverityBadge({ severity, className }) {
  const slug = severity.toLowerCase().replace(/\s+/g, "-").replace("cat-i", "cat-1").replace("cat-ii", "cat-2").replace("cat-iii", "cat-3");
  return (
    <span
      data-testid={`severity-badge-${slug}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold font-mono tracking-tight whitespace-nowrap",
        SEV[severity],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {SEV_LABEL[severity]}
    </span>
  );
}

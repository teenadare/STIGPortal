import { cn } from "@/lib/utils";

const STATUS = {
  // Evaluation statuses (requirement Status field)
  "Not A Finding": "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
  "Does Not Meet": "bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-300",
  "Applicable Configurable": "bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-300",
  "Not Applicable": "bg-slate-500/15 border-slate-500/30 text-slate-700 dark:text-slate-300",
  // Project-level statuses (dashboard)
  Draft: "bg-slate-500/15 border-slate-500/30 text-slate-700 dark:text-slate-300",
  "Under Review": "bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-300",
  "Needs Revision": "bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-200",
  Approved: "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
  Published: "bg-violet-500/15 border-violet-500/30 text-violet-700 dark:text-violet-300",
};

export function StatusPill({ status, className }) {
  return (
    <span
      data-testid={`status-pill-${status.toLowerCase().replace(/\s+/g, "-")}`}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUS[status] || STATUS["Not Applicable"],
        className
      )}
    >
      {status}
    </span>
  );
}

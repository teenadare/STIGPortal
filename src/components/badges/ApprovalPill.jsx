import { cn } from "@/lib/utils";

const APPROVAL = {
  "Not Submitted": "bg-slate-500/15 border-slate-500/30 text-slate-700 dark:text-slate-300",
  "Pending Approval": "bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-300",
  Approved: "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
  Returned: "bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-300",
};

export function ApprovalPill({ status, className }) {
  return (
    <span
      data-testid={`approval-pill-${status.toLowerCase().replace(/\s+/g, "-")}`}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        APPROVAL[status] || APPROVAL["Not Submitted"],
        className
      )}
    >
      {status}
    </span>
  );
}

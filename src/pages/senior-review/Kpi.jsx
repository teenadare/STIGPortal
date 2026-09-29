import { cn } from "@/lib/utils";

// KPI stat tile for the Senior Review dashboard.
export function Kpi({ testid, icon: Icon, label, value, accent }) {
  return (
    <div data-testid={testid} className={cn("rounded-2xl border p-5 relative overflow-hidden", accent ? "border-[var(--brand)]/40 bg-gradient-to-br from-[var(--brand)]/15 to-transparent" : "border-[var(--border-c)] bg-[var(--surface)]")}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
        <Icon className={cn("h-4 w-4", accent ? "text-[var(--brand)]" : "text-[var(--text-muted)]")} />
      </div>
      <p className={cn("mt-3 text-3xl font-bold tabular-nums", accent ? "text-[var(--brand)]" : "text-[var(--text-primary)]")}>{value}</p>
    </div>
  );
}

import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

// Compact labelled <select> used for the severity/status filters on Requirements.
export function FilterSelect({ value, onChange, options, testid, icon }) {
  return (
    <div className="relative">
      {icon && <SlidersHorizontal className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />}
      <select data-testid={testid} value={value} onChange={(e) => onChange(e.target.value)} className={cn("h-9 appearance-none rounded-lg border border-[var(--border-c)] bg-[var(--surface)] pr-8 text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[var(--brand)] transition-colors duration-150", icon ? "pl-8" : "pl-3")}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

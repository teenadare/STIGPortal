import { useState, useRef, useEffect } from "react";
import { ChevronDown, Layers3, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Multi-select filter for Parent SRG. `selected` is the current list; empty = none.
export function ParentSrgFilter({ options, selected, onChange, testid = "parent-srg-filter" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const allOn = selected.length === options.length;
  const toggle = (v) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);

  return (
    <div className="relative" ref={ref}>
      <p className="hidden sm:block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1 ml-0.5">Parent SRG</p>
      <button
        data-testid={testid}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 h-9 rounded-lg border border-[var(--border-c)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] hover:border-[var(--brand)] transition-colors duration-150"
      >
        <Layers3 className="h-4 w-4 text-[var(--brand)]" />
        <span className="whitespace-nowrap font-medium">{allOn ? "All" : `${selected.length} selected`}</span>
        <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
      </button>
      {open && (
        <div data-testid={`${testid}-menu`} className="absolute right-0 mt-1 w-72 max-h-80 overflow-y-auto rounded-lg border border-[var(--border-c)] bg-[var(--bg-secondary)] shadow-xl z-50 p-1 animate-fade-up">
          <button data-testid={`${testid}-all`} onClick={() => onChange(allOn ? [] : [...options])} className="w-full flex items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-[var(--surface-hover)] transition-colors duration-150">
            <span className="font-semibold text-[var(--text-primary)]">All Parent SRGs</span>
            {allOn && <Check className="h-4 w-4 text-[var(--brand)]" />}
          </button>
          <div className="my-1 border-t border-[var(--border-subtle)]" />
          {options.map((o) => {
            const on = selected.includes(o);
            return (
              <button key={o} data-testid={`${testid}-opt-${o}`} onClick={() => toggle(o)} className="w-full flex items-center justify-between gap-2 rounded-md px-3 py-2 text-left hover:bg-[var(--surface-hover)] transition-colors duration-150">
                <span className={cn("font-mono text-xs", on ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]")}>{o}</span>
                {on && <Check className="h-4 w-4 text-[var(--brand)] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

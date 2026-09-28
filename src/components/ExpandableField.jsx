import { useState } from "react";
import { Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Long-text field with an expand-to-fullscreen affordance.
export function ExpandableField({ label, value, onChange, rows = 4, mono, readOnly, testid, hint }) {
  const [full, setFull] = useState(false);
  const cls = cn(
    "w-full rounded-lg bg-[var(--bg-primary)] border border-[var(--border-c)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand)] transition-colors duration-150 resize-none",
    mono && "font-mono text-xs",
    readOnly && "opacity-90 cursor-default"
  );
  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</label>
          <button
            type="button"
            data-testid={testid ? `${testid}-expand` : undefined}
            onClick={() => setFull(true)}
            className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors duration-150"
          >
            <Maximize2 className="h-3 w-3" /> Expand
          </button>
        </div>
      )}
      <div className="relative">
        <textarea
          data-testid={testid}
          value={value}
          onChange={onChange}
          rows={rows}
          readOnly={readOnly}
          className={cls}
        />
        {!label && (
          <button
            type="button"
            data-testid={testid ? `${testid}-expand` : undefined}
            onClick={() => setFull(true)}
            className="absolute right-2 top-2 h-6 w-6 flex items-center justify-center rounded-md bg-[var(--surface)] border border-[var(--border-c)] text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors duration-150"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
        )}
      </div>

      {full && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={() => setFull(false)}>
          <div className="w-full max-w-4xl h-[80vh] flex flex-col rounded-xl border border-[var(--border-c)] bg-[var(--bg-secondary)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-c)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{label || "Edit"}</h3>
              <button data-testid="fullscreen-close" onClick={() => setFull(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="h-5 w-5" /></button>
            </div>
            {hint && <p className="px-5 pt-3 text-xs text-[var(--text-muted)]">{hint}</p>}
            <textarea
              autoFocus
              value={value}
              onChange={onChange}
              readOnly={readOnly}
              className={cn("flex-1 m-5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-c)] p-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)] resize-none", mono && "font-mono")}
            />
          </div>
        </div>
      )}
    </div>
  );
}

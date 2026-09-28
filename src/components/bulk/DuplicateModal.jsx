import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Layers2, X, Link2 } from "lucide-react";

// Modal to pick the parent among selected rows; others become "Satisfied By" the parent.
export function DuplicateModal({ open, items, onClose, onApply }) {
  const [parent, setParent] = useState(items[0]?.id);
  useEffect(() => { if (open) setParent(items[0]?.id); }, [open, items]);
  if (!open) return null;
  const parentReq = items.find((r) => r.id === parent);
  return (
    <div data-testid="duplicate-modal" className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-[var(--border-c)] bg-[var(--bg-secondary)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-c)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><Layers2 className="h-4 w-4 text-[var(--brand)]" /> Flag as Duplicates</h3>
          <button data-testid="duplicate-modal-close" onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5">
          <p className="text-[11px] text-[var(--text-muted)] mb-3">Pick the parent (Satisfies). The other {items.length - 1} rule(s) will be marked <span className="font-mono">Satisfied By</span> the parent.</p>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {items.map((r) => (
              <label key={r.id} data-testid={`duplicate-parent-option-${r.stigId}`} className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors duration-150 ${parent === r.id ? "border-[var(--brand)] bg-[var(--brand)]/5" : "border-[var(--border-c)] hover:bg-[var(--surface-hover)]"}`}>
                <input type="radio" name="dup-parent" checked={parent === r.id} onChange={() => setParent(r.id)} className="mt-0.5 accent-[var(--brand)]" />
                <div className="min-w-0">
                  <p className="font-mono text-xs text-[var(--brand)] font-semibold">{r.stigId}</p>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{r.title}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-[var(--bg-tertiary)] p-3 text-[11px] text-[var(--text-secondary)] flex items-start gap-2">
            <Link2 className="h-3.5 w-3.5 mt-0.5 text-[var(--brand)] shrink-0" />
            <span>Parent <span className="font-mono text-[var(--brand)]">{parentReq?.stigId}</span> · {items.length - 1} child rule(s) → Satisfied By <span className="font-mono">{parentReq?.stigId}</span></span>
          </div>
          <button
            data-testid="duplicate-apply-btn"
            onClick={() => { onApply(parent); toast.success(`Linked ${items.length - 1} rule(s) as Satisfied By ${parentReq?.stigId}`); onClose(); }}
            className="mt-4 w-full rounded-lg bg-[var(--brand)] py-2 text-sm font-semibold text-white hover:bg-[var(--brand-hover)] transition-colors duration-150"
          >
            Apply Satisfies / Satisfied By
          </button>
        </div>
      </div>
    </div>
  );
}

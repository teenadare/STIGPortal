import { useState } from "react";
import { toast } from "sonner";
import { Upload, X, FileUp } from "lucide-react";

const inputCls =
  "w-full rounded-lg bg-[var(--bg-primary)] border border-[var(--border-c)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)] transition-colors duration-150";

// Simulated SRG import dialog (PMRC SRG Library).
export function ImportModal({ open, onClose, onImport }) {
  const [label, setLabel] = useState("");
  const [full, setFull] = useState("");
  if (!open) return null;
  return (
    <div data-testid="srg-import-modal" className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-[var(--border-c)] bg-[var(--bg-secondary)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-c)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><Upload className="h-4 w-4 text-[var(--brand)]" /> Import SRG</h3>
          <button data-testid="srg-import-close" onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--border-c)] py-6 text-center cursor-pointer hover:border-[var(--brand)] transition-colors duration-150">
            <FileUp className="h-6 w-6 text-[var(--brand)]" />
            <span className="text-xs text-[var(--text-secondary)]">Drop an SRG XCCDF/ZIP here or click to browse <span className="text-amber-500">(simulated)</span></span>
            <input type="file" data-testid="srg-import-file" className="hidden" onChange={() => toast.success("SRG file parsed (simulated)")} />
          </label>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Family label</label>
            <input data-testid="srg-import-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Web Server" className={inputCls} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Full SRG name</label>
            <input data-testid="srg-import-full" value={full} onChange={(e) => setFull(e.target.value)} placeholder="e.g. Web Server SRG V3R1" className={inputCls} />
          </div>
          <button
            data-testid="srg-import-submit"
            disabled={!label.trim()}
            onClick={() => { onImport({ id: label.toLowerCase().replace(/\s+/g, "-"), label: label.trim(), full: full.trim() || label.trim(), count: 0 }); toast.success(`Imported ${label.trim()} SRG`); setLabel(""); setFull(""); onClose(); }}
            className="w-full rounded-lg bg-[var(--brand)] py-2 text-sm font-semibold text-white hover:bg-[var(--brand-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Import SRG
          </button>
        </div>
      </div>
    </div>
  );
}

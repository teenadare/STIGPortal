import { Layers2, Pencil, Save } from "lucide-react";

// Sticky bar shown when one or more rows are selected.
export function BulkBar({ count, onFlagDuplicates, onClear, onSave, children }) {
  if (!count) return null;
  const multi = count >= 2;
  return (
    <div data-testid="bulk-action-bar" className="flex flex-wrap items-center gap-2 mb-3 rounded-lg border border-[var(--brand)] bg-[var(--brand)]/10 px-4 py-2.5 text-sm animate-fade-up">
      <span className="font-semibold text-[var(--text-primary)]">{count} selected</span>
      {multi && (
        <button data-testid="bulk-flag-duplicates-btn" onClick={onFlagDuplicates} className="flex items-center gap-1.5 rounded-md border border-[var(--brand)] bg-[var(--brand)]/15 px-3 py-1.5 text-xs font-semibold text-[var(--brand)] hover:bg-[var(--brand)]/25 transition-colors duration-150">
          <Layers2 className="h-3.5 w-3.5" /> Flag as Duplicates
        </button>
      )}
      {multi && children}
      <span className="hidden md:flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
        <Pencil className="h-3 w-3" /> {multi ? `Edit a highlighted row to apply that field to all ${count}.` : "Edit the highlighted row's fields, then Save."}
      </span>
      {onSave && (
        <button data-testid="bulk-save-btn" onClick={onSave} className="flex items-center gap-1.5 rounded-md bg-[var(--brand)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--brand-hover)] transition-colors duration-150">
          <Save className="h-3.5 w-3.5" /> Save
        </button>
      )}
      <button data-testid="bulk-clear-btn" onClick={onClear} className="ml-auto text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">Clear</button>
    </div>
  );
}

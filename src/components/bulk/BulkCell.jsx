const cellSelect = "w-full rounded-md border border-[var(--brand)]/50 bg-[var(--bg-primary)] px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)]";

// Inline field that becomes an editable select when its row is selected; edits propagate to all selected rows.
export function BulkCell({ selected, value, options, display, onPropagate }) {
  if (!selected) return display;
  return (
    <select
      data-testid="bulk-cell-select"
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => { e.stopPropagation(); onPropagate(e.target.value); }}
      className={cellSelect}
    >
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

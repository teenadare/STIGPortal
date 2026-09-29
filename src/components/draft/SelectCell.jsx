import { editCls } from "@/components/draft/cells";

// Inline-editable select cell for the draft grid.
export function SelectCell({ sel, value, options, onChange }) {
  if (!sel) return <span className="text-xs text-[var(--text-primary)] whitespace-nowrap">{value || "\u2014"}</span>;
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={editCls}>
      {options.map((o) => <option key={o} value={o}>{o || "(blank)"}</option>)}
    </select>
  );
}

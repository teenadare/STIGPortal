// Labelled bordered field container used by the record editors.
// `action` renders an optional control on the right of the label row.
// `srg` tints the card with the brand color to mark SRG-source content.
export function Field({ label, action, srg, children }) {
  return (
    <div className={`rounded-xl border p-4 ${srg ? "border-[var(--brand)]/30 bg-[var(--brand)]/5" : "border-[var(--border-c)] bg-[var(--surface)]"}`}>
      <div className="flex items-center justify-between mb-2">
        <label className={`text-[11px] font-semibold uppercase tracking-wider ${srg ? "text-[var(--brand)]" : "text-[var(--text-muted)]"}`}>{label}</label>
        {action}
      </div>
      {children}
    </div>
  );
}

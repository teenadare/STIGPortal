// Labelled field wrapper used across the InSpec Validation form.
export function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[10px] text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}

import { inputCls } from "@/components/form/formStyles";

// Shared Approval Status selector card used by the record editors.
export function ApprovalCard({ value, onChange, testid, statuses }) {
  return (
    <div className="rounded-xl border border-[var(--border-c)] bg-[var(--surface)] p-4">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Approval Status</h4>
      <select data-testid={testid} value={value} onChange={onChange} className={inputCls}>
        {statuses.map((s) => <option key={s}>{s}</option>)}
      </select>
    </div>
  );
}

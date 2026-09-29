import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, FileDown } from "lucide-react";
import { Card } from "@/components/Primitives";
import { requirements } from "@/data/repository";

// PMRC-only tool: generate DPMS-style RuleKeys locally (no DPMS round-trip).
export function DpmsReady() {
  const [start, setStart] = useState(100000);
  const [rows, setRows] = useState(null);
  const generate = () => {
    const s = parseInt(start, 10) || 0;
    setRows(requirements.map((r, i) => ({ stigId: r.stigId, ruleKey: `SV-${s + i}r1_rule` })));
    toast.success(`Exported ${requirements.length} requirements to DPMS format (RuleKeys from ${s})`);
  };
  return (
    <Card className="p-5 mt-5" data-testid="dpms-ready-card">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-1"><KeyRound className="h-4 w-4 text-[var(--brand)]" /> DPMS Ready Export</h3>
      <p className="text-[11px] text-[var(--text-muted)] mb-4">Populate RuleKeys locally — no DPMS round-trip. Enter the starting RuleKey (DPMS-style, increments by 1).</p>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">Starting RuleKey</label>
          <input data-testid="dpms-start-input" type="number" value={start} onChange={(e) => setStart(e.target.value)} className="h-9 w-40 rounded-lg border border-[var(--border-c)] bg-[var(--bg-primary)] px-3 text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)]" />
        </div>
        <button data-testid="dpms-generate-btn" onClick={generate} className="h-9 flex items-center gap-2 rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-hover)] transition-colors duration-150"><FileDown className="h-4 w-4" /> Export {requirements.length} requirements to DPMS format</button>
      </div>
      {rows && (
        <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--border-c)]">
          <table className="w-full text-sm" data-testid="dpms-preview">
            <thead><tr className="bg-[var(--bg-secondary)] text-left text-[11px] uppercase tracking-wider text-[var(--text-muted)]"><th className="px-4 py-2 font-semibold">STIG ID</th><th className="px-4 py-2 font-semibold">Generated RuleKey</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.stigId} className="border-t border-[var(--border-subtle)]">
                  <td className="px-4 py-2 font-mono text-xs text-[var(--text-secondary)]">{r.stigId}</td>
                  <td className="px-4 py-2 font-mono text-xs text-[var(--brand)] font-semibold">{r.ruleKey}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

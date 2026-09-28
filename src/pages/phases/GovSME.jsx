import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Rocket, Check } from "lucide-react";
import { PageHeader, Card } from "@/components/Primitives";
import { ExpandableField } from "@/components/ExpandableField";
import { srgFamilies } from "@/data/repository";

export default function GovSME() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(["os", "gpos"]);
  const [stigName, setStigName] = useState("Omnissa Horizon 8 STIG");
  const [scope, setScope] = useState("Baseline hardening for the Omnissa Horizon 8 Connection Server and Agent, derived from the selected SRG families.");

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div>
      <PageHeader
        title="New STIG"
        subtitle="Import parent SRG families and set up the initial STIG for vendor input"
        testid="govsme-header"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Available Parent SRG Families</h3>
              <span className="text-xs text-[var(--text-muted)]">{selected.length} selected</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {srgFamilies.map((f) => {
                const on = selected.includes(f.id);
                return (
                  <label
                    key={f.id}
                    data-testid={`srg-family-${f.id}`}
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors duration-150 ${on ? "border-[var(--brand)] bg-[var(--brand)]/5" : "border-[var(--border-c)] hover:bg-[var(--surface-hover)]"}`}
                  >
                    <input type="checkbox" checked={on} onChange={() => toggle(f.id)} className="mt-0.5 accent-[var(--brand)]" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{f.label}</p>
                      <p className="text-xs text-[var(--text-secondary)] leading-snug">{f.full}</p>
                      <p className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">{f.count} requirements</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">New STIG Setup</h3>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">STIG Name</label>
              <input data-testid="stig-name-input" value={stigName} onChange={(e) => setStigName(e.target.value)} className="mt-1.5 w-full rounded-lg bg-[var(--bg-primary)] border border-[var(--border-c)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)]" />
            </div>
            <ExpandableField label="Scope / Notes" value={scope} onChange={(e) => setScope(e.target.value)} rows={4} testid="stig-scope" />
            <div className="rounded-lg bg-[var(--bg-tertiary)] p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between"><span className="text-[var(--text-muted)]">Status</span><span className="font-semibold text-blue-500">Ready for Vendor Input</span></div>
              <div className="flex items-center justify-between"><span className="text-[var(--text-muted)]">SRG Families</span><span className="font-mono text-[var(--text-primary)]">{selected.length}</span></div>
            </div>
            <button
              data-testid="execute-vendor-draft-btn"
              onClick={() => { toast.success("DB job started — creating new STIG for Vendor Draft"); navigate("/phase/vendor-draft"); }}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-hover)] transition-colors duration-150"
            >
              <Rocket className="h-4 w-4" /> Execute Vendor Draft
            </button>
          </Card>

          <Card className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Checklist</p>
            <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
              <li>• Select one or more SRG families</li>
              <li>• Name the STIG</li>
              <li>• Status "Ready for Vendor Input"</li>
              <li>• Execute to hand off to the vendor</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

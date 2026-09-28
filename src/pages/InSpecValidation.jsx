import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, FlaskConical, Play, Terminal, ServerCog } from "lucide-react";
import { Card } from "@/components/Primitives";
import { requirements } from "@/data/repository";

const inputCls =
  "w-full rounded-lg bg-[var(--bg-primary)] border border-[var(--border-c)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)] transition-colors duration-150";
const monoArea = inputCls + " font-mono text-xs resize-none";

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[10px] text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}

export default function InSpecValidation() {
  const navigate = useNavigate();
  const [target, setTarget] = useState("ssh");
  const [ran, setRan] = useState(false);

  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <button data-testid="inspec-back-btn" onClick={() => navigate("/phase/stig-testing")} className="h-8 w-8 flex items-center justify-center rounded-lg border border-[var(--border-c)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"><ArrowLeft className="h-4 w-4" /></button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2"><FlaskConical className="h-6 w-6 text-[var(--brand)]" /> InSpec Validation</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Run InSpec / Test Kitchen profiles against a target. <span className="text-amber-500 font-medium">Holding place — simulated (not wired to a runner).</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Kitchen config */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 space-y-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5"><ServerCog className="h-3.5 w-3.5 text-[var(--brand)]" /> Test Kitchen Target</h3>
            <Field label="Driver">
              <select data-testid="inspec-target" value={target} onChange={(e) => setTarget(e.target.value)} className={inputCls}>
                <option value="ssh">SSH</option>
                <option value="docker">Docker</option>
                <option value="aws">AWS (EC2)</option>
              </select>
            </Field>
            {target === "ssh" && (
              <>
                <Field label="Host"><input data-testid="inspec-host" placeholder="10.0.0.10" className={inputCls} /></Field>
                <Field label="User"><input data-testid="inspec-user" placeholder="ec2-user" className={inputCls} /></Field>
                <Field label="Private key path"><input data-testid="inspec-key" placeholder="~/.ssh/id_rsa" className={inputCls} /></Field>
              </>
            )}
            {target === "docker" && (
              <Field label="Image / Container"><input data-testid="inspec-image" placeholder="registry/ubi9:latest" className={inputCls} /></Field>
            )}
            {target === "aws" && (
              <Field label="Instance ID"><input data-testid="inspec-instance" placeholder="i-0abc123..." className={inputCls} /></Field>
            )}
            <Field label="INSPEC_CONTROL (isolate)" hint="Limit the run to a single STIG ID (optional).">
              <select data-testid="inspec-control" className={inputCls}>
                <option value="">All controls</option>
                {requirements.map((r) => <option key={r.id} value={r.stigId}>{r.stigId}</option>)}
              </select>
            </Field>
          </Card>
        </div>

        {/* Profile + inputs */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Profile name"><input data-testid="inspec-profile" placeholder="omnissa-horizon-8-stig" className={inputCls} /></Field>
              <Field label="Profile version"><input data-testid="inspec-version" placeholder="1.0.0" className={inputCls} /></Field>
            </div>
            <Field label="InSpec control" hint="Ruby control body — holding place for the generated check logic.">
              <textarea data-testid="inspec-code" rows={7} defaultValue={`control 'HRZN-8X-000010' do\n  impact 0.5\n  title 'Display the DoD Notice and Consent Banner'\n  desc 'The banner must be displayed before granting access.'\n  describe horizon_setting('preLoginMessage') do\n    it { should_not be_empty }\n  end\nend`} className={monoArea} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="kitchen.inputs.yml"><textarea data-testid="inspec-inputs" rows={4} defaultValue={`banner_text: "You are accessing a U.S. Government (USG) Information System"`} className={monoArea} /></Field>
              <Field label="threshold.yml" hint="Pass/fail thresholds by impact."><textarea data-testid="inspec-threshold" rows={4} defaultValue={`compliance:\n  min: 90\nfailed:\n  critical:\n    max: 0`} className={monoArea} /></Field>
            </div>
            <button data-testid="inspec-run-btn" onClick={() => { setRan(true); toast.success("kitchen verify queued (simulated) — 6 passed, 2 failed, 0 skipped"); }} className="flex items-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-hover)] transition-colors duration-150">
              <Play className="h-4 w-4" /> Run kitchen verify
            </button>
          </Card>

          <Card className="p-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-3"><Terminal className="h-3.5 w-3.5 text-[var(--brand)]" /> Results {ran && <span className="text-amber-500 normal-case tracking-normal">(simulated)</span>}</h3>
            {!ran ? (
              <p className="text-xs text-[var(--text-muted)]">No run yet. Configure a target and run <span className="font-mono">kitchen verify</span> to see results here.</p>
            ) : (
              <div className="space-y-1.5 font-mono text-xs" data-testid="inspec-results">
                <p className="text-emerald-500">✔  HRZN-8X-000010  DoD banner displayed</p>
                <p className="text-emerald-500">✔  HRZN-8X-000040  TLS 1.2+ enforced</p>
                <p className="text-red-500">✘  HRZN-8X-000080  Idle session timeout not set (expected ≤ 15m)</p>
                <p className="text-red-500">✘  HRZN-8X-000120  Audit storage capacity below threshold</p>
                <p className="text-[var(--text-muted)] mt-2">Profile Summary: 6 successful, 2 failures, 0 skipped · 75% compliance</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

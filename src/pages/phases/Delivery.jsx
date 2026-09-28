import { useState } from "react";
import { toast } from "sonner";
import { PackageCheck, FileDown, DatabaseBackup, FlaskConical, CheckCircle2, ShieldCheck, KeyRound, FolderOpen, ArrowLeft } from "lucide-react";
import { PageHeader, Card } from "@/components/Primitives";
import { StatusPill } from "@/components/Badges";
import { requirements, WORKFLOW_STAGES } from "@/data/repository";
import { useApp } from "@/context/AppContext";

// Stages at which a project is eligible to be submitted for delivery.
const DELIVERY_STAGES = ["ready-pmrc", "pmrc", "delivered"];

function DpmsReady() {
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

// PMRC selects which project to submit for delivery before the packaging tools appear.
function DeliveryPicker({ projects, onPick }) {
  return (
    <Card className="p-5" data-testid="delivery-project-picker">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-1"><FolderOpen className="h-4 w-4 text-[var(--brand)]" /> Select a project to submit for delivery</h3>
      <p className="text-[11px] text-[var(--text-muted)] mb-4">Only projects that have reached PMRC review are eligible. Choose one to open its delivery package.</p>
      {projects.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] py-6 text-center" data-testid="delivery-picker-empty">No projects are ready for delivery yet. Approve a project for delivery from the Projects page first.</p>
      ) : (
        <div className="space-y-2">
          {projects.map((p) => {
            const stage = WORKFLOW_STAGES.find((s) => s.id === p.stage) || {};
            return (
              <button
                key={p.id}
                data-testid={`delivery-pick-${p.id}`}
                onClick={() => onPick(p.id)}
                className="w-full flex items-center justify-between gap-3 rounded-lg border border-[var(--border-c)] p-3.5 text-left hover:border-[var(--brand)] hover:bg-[var(--surface-hover)] transition-colors duration-150"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{p.name}</p>
                    <StatusPill status={p.status} />
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1"><span className="font-mono">{p.version}</span> · {p.total} rules · Stage: <span className="font-medium">{stage.label || p.stage}</span></p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-[var(--brand)] shrink-0"><ArrowLeft className="h-4 w-4 rotate-180" /> Select</span>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default function Delivery() {
  const { role, visibleProjects, openProject, setOpenProjectId, setStage } = useApp();
  const isPMRC = role.id === "pmrc";

  const candidates = visibleProjects.filter((p) => DELIVERY_STAGES.includes(p.stage));
  // The delivery target is the open project (if eligible), otherwise nothing is selected yet.
  const target = openProject && DELIVERY_STAGES.includes(openProject.stage) ? openProject : null;

  const exports = [
    { key: "xccdf", label: "XCCDF Package (.xml)", desc: "DISA-conformant benchmark for STIG Viewer", icon: FileDown },
    { key: "ckl", label: "Checklist (.ckl)", desc: "STIG Viewer checklist export", icon: FileDown },
    { key: "backup", label: "Full Project Backup (.zip)", desc: "All requirements, revisions, comments & audit", icon: DatabaseBackup },
  ];

  const submit = () => {
    setStage(target.id, "delivered");
    toast.success(`${target.name} submitted — benchmark released and archived`);
  };

  return (
    <div>
      <PageHeader
        title="Delivery"
        subtitle="Final packaging, validation and release — PMRC authority"
        testid="delivery-header"
      >
        {target && (
          <button
            data-testid="delivery-change-project-btn"
            onClick={() => setOpenProjectId(null)}
            className="flex items-center gap-2 rounded-lg border border-[var(--border-c)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--text-primary)] transition-colors duration-150"
          >
            <ArrowLeft className="h-4 w-4" /> Change project
          </button>
        )}
        <button
          data-testid="execute-delivery-btn"
          disabled={!isPMRC || !target || target.stage === "delivered"}
          onClick={submit}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          <ShieldCheck className="h-4 w-4" /> {target && target.stage === "delivered" ? "Delivered" : "Submit for Delivery"}
        </button>
      </PageHeader>

      {!isPMRC && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 mb-5 text-sm text-amber-600 dark:text-amber-200">
          Viewing as <strong>{role.label}</strong>. Only <strong>PMRC</strong> can submit for delivery.
        </div>
      )}

      {!target ? (
        <DeliveryPicker projects={candidates} onPick={(id) => setOpenProjectId(id)} />
      ) : (
        <>
          <div className="rounded-lg border border-[var(--brand)]/30 bg-[var(--brand)]/5 px-4 py-3 mb-5 flex items-center gap-3" data-testid="delivery-target-banner">
            <FolderOpen className="h-5 w-5 text-[var(--brand)] shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Submitting for delivery</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{target.name} <span className="font-mono text-xs text-[var(--text-secondary)]">· {target.version}</span></p>
            </div>
            {target.stage === "delivered" && <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-500"><CheckCircle2 className="h-4 w-4" /> Delivered</span>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4"><PackageCheck className="h-4 w-4 text-[var(--brand)]" /> Exports & Backup</h3>
              <div className="space-y-2">
                {exports.map((e) => (
                  <button
                    key={e.key}
                    data-testid={`delivery-export-${e.key}`}
                    onClick={() => toast.success(`Generating ${e.label} for ${target.name}…`)}
                    className="w-full flex items-center gap-3 rounded-lg border border-[var(--border-c)] p-3 text-left hover:border-[var(--brand)] hover:bg-[var(--surface-hover)] transition-colors duration-150"
                  >
                    <e.icon className="h-5 w-5 text-[var(--brand)] shrink-0" />
                    <div>
                      <p className="text-sm text-[var(--text-primary)]">{e.label}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{e.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4"><FlaskConical className="h-4 w-4 text-[var(--brand)]" /> Release Readiness</h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  "All requirements Approved by PMRC",
                  "0 blocking duplicate errors",
                  "XCCDF schema validation passed",
                  "InSpec profile: 6 passed / 2 waived",
                  "Draft (v1) archived for rollback",
                ].map((c) => (
                  <li key={c} className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> {c}
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-lg bg-[var(--bg-tertiary)] p-3 text-xs flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Benchmark status</span>
                <span className="font-semibold text-emerald-400">{target.stage === "delivered" ? "Delivered" : "Ready for Delivery"}</span>
              </div>
            </Card>
          </div>

          {isPMRC && <DpmsReady />}
        </>
      )}
    </div>
  );
}

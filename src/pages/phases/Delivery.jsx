import { useState } from "react";
import { toast } from "sonner";
import { PackageCheck, FileDown, DatabaseBackup, FlaskConical, CheckCircle2, ShieldCheck, KeyRound, FolderOpen, ArrowLeft } from "lucide-react";
import { PageHeader, Card } from "@/components/Primitives";
import { StatusPill } from "@/components/Badges";
import { requirements, WORKFLOW_STAGES } from "@/data/repository";
import { useApp } from "@/context/AppContext";
import { DpmsReady } from "@/pages/phases/delivery/DpmsReady";
import { DeliveryPicker } from "@/pages/phases/delivery/DeliveryPicker";

// Stages at which a project is eligible to be submitted for delivery.
const DELIVERY_STAGES = ["ready-pmrc", "pmrc", "delivered"];

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

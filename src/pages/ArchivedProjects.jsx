import { useState } from "react";
import { Archive, CheckCircle2, ChevronRight, ArrowRight } from "lucide-react";
import { PageHeader, Card } from "@/components/Primitives";
import DraftTable from "@/components/DraftTable";

const archived = [
  { id: "horizon", name: "Omnissa Horizon 8.x STIG", version: "V1R1", delivered: "2026-05-30", rules: 176 },
  { id: "tanium", name: "Tanium 7.x STIG", version: "V2R3", delivered: "2026-04-12", rules: 148 },
  { id: "rhel", name: "RHEL 9 STIG", version: "V1R4", delivered: "2026-03-01", rules: 245 },
];

export default function ArchivedProjects() {
  const [openId, setOpenId] = useState(null);
  const project = archived.find((p) => p.id === openId);

  if (project) {
    return (
      <div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-4">
          <button data-testid="archived-back" onClick={() => setOpenId(null)} className="hover:text-[var(--text-primary)]">Archived Projects</button>
          <ChevronRight className="h-3 w-3" />
          <span className="font-mono text-[var(--text-secondary)]">{project.name}</span>
        </div>
        <PageHeader title={project.name} subtitle={`${project.version} · Delivered ${project.delivered} · read only`} testid="archived-detail-header" />
        <div className="rounded-lg border border-[var(--border-c)] bg-[var(--bg-tertiary)] px-4 py-2.5 mb-5 text-sm text-[var(--text-secondary)] flex items-center gap-2">
          <Archive className="h-4 w-4 text-[var(--text-muted)]" /> Read-only archive of the delivered Tech Edit document. Editing is disabled.
        </div>
        <DraftTable prefix="archived" readOnly />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Archived Projects" subtitle="Delivered benchmarks — open one to view its read-only requirements" testid="archived-header" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {archived.map((p) => (
          <Card
            key={p.id}
            data-testid={`archived-project-${p.id}`}
            onClick={() => setOpenId(p.id)}
            className="p-5 cursor-pointer hover:border-[var(--brand)] transition-colors duration-150 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400"><CheckCircle2 className="h-3 w-3" /> Delivered</span>
              <span className="text-[11px] text-[var(--text-muted)]">{p.delivered}</span>
            </div>
            <p className="text-base font-semibold text-[var(--text-primary)]">{p.name}</p>
            <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">{p.version} · {p.rules} rules</p>
            <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[var(--brand)]">
              Open archive <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-150" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

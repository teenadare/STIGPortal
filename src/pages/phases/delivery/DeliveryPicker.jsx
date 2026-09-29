import { FolderOpen, ArrowLeft } from "lucide-react";
import { Card } from "@/components/Primitives";
import { StatusPill } from "@/components/Badges";
import { WORKFLOW_STAGES } from "@/data/repository";

// PMRC picks which eligible project to submit before the packaging tools appear.
export function DeliveryPicker({ projects, onPick }) {
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

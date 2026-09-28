import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ScanSearch, Link2, Check } from "lucide-react";
import { Card } from "@/components/Primitives";
import { duplicateClusters } from "@/data/repository";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

function ClusterCard({ cluster, reqs, flagDuplicates }) {
  const members = [cluster.parent, ...cluster.children];
  const [parent, setParent] = useState(cluster.parent);
  const [included, setIncluded] = useState(() => new Set(members));
  const [grouped, setGrouped] = useState(false);

  const toggle = (id) => setIncluded((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const apply = () => {
    const childStigIds = members.filter((m) => m !== parent && included.has(m));
    const parentReq = reqs.find((r) => r.stigId === parent);
    const childIds = reqs.filter((r) => childStigIds.includes(r.stigId)).map((r) => r.id);
    if (parentReq && childIds.length) flagDuplicates([...childIds, parentReq.id], parentReq.id);
    setGrouped(true);
    toast.success(`Grouped ${childStigIds.length} rule(s) as Satisfied By ${parent}`);
  };

  return (
    <Card data-testid={`scan-cluster-${cluster.id}`} className={cn("p-5", grouped && "border-emerald-500/40")}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{cluster.theme}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl">{cluster.note}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-lg font-bold text-emerald-500">{Math.round(cluster.confidence * 100)}%</span>
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">match</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-[var(--border-subtle)] overflow-hidden">
        <div className="grid grid-cols-[auto_auto_1fr] gap-x-3 items-center bg-[var(--bg-secondary)] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          <span>Parent</span><span>Group</span><span>STIG ID</span>
        </div>
        {members.map((id) => (
          <div key={id} className="grid grid-cols-[auto_auto_1fr] gap-x-3 items-center px-3 py-2 border-t border-[var(--border-subtle)]">
            <input type="radio" name={`parent-${cluster.id}`} checked={parent === id} onChange={() => setParent(id)} className="accent-[var(--brand)]" data-testid={`scan-parent-${id}`} />
            <input type="checkbox" checked={included.has(id)} disabled={parent === id} onChange={() => toggle(id)} className="accent-[var(--brand)] disabled:opacity-40" data-testid={`scan-include-${id}`} />
            <span className={cn("font-mono text-xs", parent === id ? "text-emerald-500 font-semibold" : "text-[var(--text-secondary)]")}>{id}{parent === id && " · parent (Satisfies)"}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1"><Link2 className="h-3 w-3" /> {[...included].filter((m) => m !== parent).length} rule(s) → Satisfied By {parent}</span>
        <button data-testid={`scan-apply-${cluster.id}`} onClick={apply} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150", grouped ? "bg-emerald-600 text-white" : "border border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)] hover:bg-[var(--brand)]/20")}>
          {grouped ? <><Check className="h-3.5 w-3.5" /> Grouped</> : "Group as Duplicates"}
        </button>
      </div>
    </Card>
  );
}

export default function DuplicateScan() {
  const navigate = useNavigate();
  const { reqs, flagDuplicates } = useApp();

  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <button data-testid="scan-back-btn" onClick={() => navigate("/phase/stig-testing")} className="h-8 w-8 flex items-center justify-center rounded-lg border border-[var(--border-c)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"><ArrowLeft className="h-4 w-4" /></button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2"><ScanSearch className="h-6 w-6 text-[var(--brand)]" /> Duplicate Scan</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Probable duplicates from a similarity scan — review and group with human confirmation. <span className="text-amber-500">(Simulated)</span></p>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--brand)]/30 bg-[var(--brand)]/5 px-4 py-2.5 mb-5 text-sm text-[var(--text-secondary)]">
        {duplicateClusters.length} probable duplicate cluster(s) detected. Pick a parent, choose which rules to include, then <span className="font-medium text-[var(--text-primary)]">Group as Duplicates</span> to set the Satisfies / Satisfied By hierarchy.
      </div>

      <div className="space-y-4" data-testid="duplicate-scan-results">
        {duplicateClusters.map((c) => (
          <ClusterCard key={c.id} cluster={c} reqs={reqs} flagDuplicates={flagDuplicates} />
        ))}
      </div>
    </div>
  );
}

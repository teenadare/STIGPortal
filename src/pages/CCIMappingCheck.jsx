import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AlertTriangle, ArrowRight, Check, X, Wand2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/Primitives";
import { cciAudit, stigIdOf } from "@/data/repository";
import { cn } from "@/lib/utils";

export default function CCIMappingCheck() {
  const [items, setItems] = useState(cciAudit);

  const resolve = (rid, applied) => {
    setItems((s) => s.filter((i) => i.rid !== rid));
    toast.success(applied ? "Suggested CCI applied" : "Flag dismissed");
  };

  const conf = (c) => (c >= 0.85 ? { c: "text-red-400", l: "High" } : c >= 0.7 ? { c: "text-amber-400", l: "Medium" } : { c: "text-blue-400", l: "Low" });

  return (
    <div>
      <PageHeader
        title="CCI Mapping Check"
        subtitle="AI-assisted accuracy review of CCI-to-requirement mappings"
        testid="cci-check-header"
      >
        <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-200">
          <AlertTriangle className="h-3.5 w-3.5" /> {items.length} flagged
        </span>
      </PageHeader>

      <div className="rounded-xl border border-[var(--brand)]/30 bg-[var(--brand)]/5 p-4 mb-5 flex items-start gap-3">
        <Wand2 className="h-5 w-5 text-[var(--brand)] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-[var(--text-primary)] font-medium">Mappings that don't quite line up</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">The assistant compares each requirement's intent against its CCI/NIST control and lists mismatches with a better-fit suggestion. <span className="text-amber-300">(Simulated on mock data)</span></p>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((f) => {
          const cf = conf(f.confidence);
          const sid = stigIdOf(f.rid);
          return (
            <div key={f.rid} data-testid={`cci-flag-${sid}`} className="rounded-xl border border-[var(--border-c)] bg-[var(--surface)] p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Link to={`/requirements/${sid}`} className="font-mono text-sm text-[var(--brand)] font-semibold hover:underline">{sid}</Link>
                <span className={cn("text-xs font-semibold", cf.c)}>{cf.l} confidence · {Math.round(f.confidence * 100)}%</span>
              </div>
              <p className="text-sm text-[var(--text-primary)] mt-1.5 leading-snug">{f.title}</p>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch gap-3 mt-4">
                <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-red-300/80 mb-1">Current mapping</p>
                  <p className="font-mono text-sm text-[var(--text-primary)]">{f.currentCci}</p>
                  <p className="font-mono text-[11px] text-[var(--text-muted)]">{f.currentNist}</p>
                </div>
                <div className="flex items-center justify-center"><ArrowRight className="h-5 w-5 text-[var(--text-muted)] rotate-90 md:rotate-0" /></div>
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-300/80 mb-1">Suggested mapping</p>
                  <p className="font-mono text-sm text-[var(--text-primary)]">{f.suggestedCci}</p>
                  <p className="font-mono text-[11px] text-[var(--text-muted)]">{f.suggestedNist}</p>
                </div>
              </div>

              <div className="mt-3 grid gap-2 text-xs">
                <p className="text-[var(--text-secondary)]"><span className="font-semibold text-[var(--text-primary)]">Why flagged: </span>{f.issue}</p>
                <p className="text-[var(--text-secondary)]"><span className="font-semibold text-emerald-400">Rationale: </span>{f.reason}</p>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button data-testid={`apply-cci-${sid}`} onClick={() => resolve(f.rid, true)} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors duration-150">
                  <Check className="h-3.5 w-3.5" /> Apply suggestion
                </button>
                <button data-testid={`dismiss-cci-${sid}`} onClick={() => resolve(f.rid, false)} className="flex items-center gap-1.5 rounded-lg border border-[var(--border-c)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150">
                  <X className="h-3.5 w-3.5" /> Dismiss
                </button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="rounded-xl border border-[var(--border-c)] bg-[var(--surface)] py-16 text-center">
            <ShieldCheck className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-sm text-[var(--text-primary)] font-medium">All CCI mappings look accurate</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">No mismatches remaining in this benchmark.</p>
          </div>
        )}
      </div>
    </div>
  );
}

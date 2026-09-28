import { Link } from "react-router-dom";
import { ChevronDown, CornerDownRight, AlertCircle } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/Primitives";
import { SeverityBadge } from "@/components/Badges";
import { srgTree, stigIdOf } from "@/data/repository";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

export default function SRGMapping() {
  const { openProject } = useApp();
  const [open, setOpen] = useState(() => srgTree.map((s) => s.id));
  const toggle = (id) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  const mappedCount = srgTree.filter((s) => s.derived.length > 0).length;

  return (
    <div>
      <PageHeader
        title="SRG Hierarchy Mapping"
        subtitle={`${openProject?.name || "Project"} · source SRG → derived STIG requirements`}
        testid="srg-header"
      >
        <div className="flex items-center gap-3 text-xs">
          <span className="text-[var(--text-secondary)]"><span className="text-emerald-400 font-semibold">{mappedCount}</span> mapped</span>
          <span className="text-[var(--text-secondary)]"><span className="text-amber-400 font-semibold">{srgTree.length - mappedCount}</span> gaps</span>
        </div>
      </PageHeader>

      <div className="space-y-3">
        {srgTree.map((srg) => {
          const isOpen = open.includes(srg.id);
          const gap = srg.derived.length === 0;
          return (
            <div key={srg.id} data-testid={`srg-node-${srg.id}`} className="rounded-xl border border-[var(--border-c)] bg-[var(--surface)] overflow-hidden">
              <button
                onClick={() => toggle(srg.id)}
                className="w-full flex items-start gap-3 p-4 text-left hover:bg-[var(--surface-hover)] transition-colors duration-150"
              >
                <ChevronDown className={cn("h-4 w-4 mt-1 text-[var(--text-muted)] transition-transform duration-200", !isOpen && "-rotate-90")} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm text-[var(--brand)] font-semibold">{srg.id}</span>
                    <SeverityBadge severity={srg.severity} />
                    {gap ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[11px] text-amber-200">
                        <AlertCircle className="h-3 w-3" /> Unmapped gap
                      </span>
                    ) : (
                      <span className="text-[11px] text-[var(--text-muted)]">{srg.derived.length} derived</span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-1 leading-snug">{srg.title}</p>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-2">
                  {gap ? (
                    <p className="py-3 pl-7 text-sm text-[var(--text-muted)]">No derived requirements. This SRG needs a STIG rule authored.</p>
                  ) : (
                    srg.derived.map((d) => {
                      const sid = stigIdOf(d.rid);
                      return (
                        <Link
                          key={d.rid}
                          to={`/requirements/${sid}`}
                          data-testid={`srg-derived-${sid}`}
                          className="flex items-center gap-2 py-2.5 pl-7 pr-3 rounded-lg hover:bg-[var(--surface-hover)] transition-colors duration-150 group"
                        >
                          <CornerDownRight className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                          <span className="font-mono text-xs text-[var(--brand)] shrink-0">{sid}</span>
                          <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate">{d.title}</span>
                          <span className="ml-auto text-[11px] text-emerald-400 shrink-0">Mapped</span>
                        </Link>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

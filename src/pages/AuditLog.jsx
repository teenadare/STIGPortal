import { Link } from "react-router-dom";
import { CheckCircle2, MessageSquare, Pencil, RefreshCw, UserPlus, FilePlus2, Send, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/Primitives";
import { auditLog, stigIdOf } from "@/data/repository";
import { Avatar } from "@/components/Badges";

const ICONS = {
  approve: { icon: CheckCircle2, tint: "text-emerald-400 bg-emerald-500/15" },
  comment: { icon: MessageSquare, tint: "text-blue-400 bg-blue-500/15" },
  edit: { icon: Pencil, tint: "text-violet-400 bg-violet-500/15" },
  status: { icon: RefreshCw, tint: "text-amber-400 bg-amber-500/15" },
  assign: { icon: UserPlus, tint: "text-cyan-400 bg-cyan-500/15" },
  create: { icon: FilePlus2, tint: "text-emerald-400 bg-emerald-500/15" },
  submit: { icon: Send, tint: "text-blue-400 bg-blue-500/15" },
};

export default function AuditLog() {
  const [query, setQuery] = useState("");
  const events = useMemo(() => {
    const q = query.toLowerCase();
    return auditLog.filter((e) => !q || e.user.toLowerCase().includes(q) || e.action.toLowerCase().includes(q) || stigIdOf(e.target).toLowerCase().includes(q));
  }, [query]);

  return (
    <div>
      <PageHeader
        title="Audit Log & Revision History"
        subtitle="Immutable, timestamped record of every action across the project"
        testid="audit-header"
      >
        <div className="relative w-64 max-w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input
            data-testid="audit-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search user, action, STIG ID…"
            className="w-full h-9 rounded-lg bg-[var(--surface)] border border-[var(--border-c)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand)] transition-colors duration-150"
          />
        </div>
      </PageHeader>

      <p data-testid="audit-count" className="text-xs text-[var(--text-muted)] mb-3">Showing <span className="font-semibold text-[var(--text-primary)]">{events.length}</span> of {auditLog.length} events</p>

      <div className="rounded-xl border border-[var(--border-c)] bg-[var(--surface)] p-5">
        <ol className="relative border-l border-[var(--border-c)] ml-3">
          {events.map((e, i) => {
            const conf = ICONS[e.type] || ICONS.edit;
            const Icon = conf.icon;
            const sid = stigIdOf(e.target);
            return (
              <li key={`${e.time}-${e.user}-${e.target}`} data-testid={`audit-event-${i}`} className="mb-6 ml-6 last:mb-0">
                <span className={`absolute -left-[13px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-[var(--surface)] ${conf.tint}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Avatar initials={e.user.split(" ").map((n) => n[0]).join("")} name={e.user} className="h-5 w-5 text-[9px]" />
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{e.user}</span>
                  <span className="text-sm text-[var(--text-secondary)]">{e.action}</span>
                  <Link to={`/requirements/${sid}`} className="font-mono text-xs text-[var(--brand)] hover:underline">{sid}</Link>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">{e.time}</p>
              </li>
            );
          })}
        </ol>
        {events.length === 0 && <p className="py-8 text-center text-sm text-[var(--text-muted)]">No matching events.</p>}
      </div>
    </div>
  );
}

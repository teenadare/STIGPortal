import { Link } from "react-router-dom";
import { CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "@/components/Primitives";
import { SeverityBadge, StatusPill, ApprovalPill, Avatar } from "@/components/Badges";
import { requirements } from "@/data/repository";

export default function ReviewQueue() {
  const queue = requirements.filter((r) => r.approvalStatus === "Pending Approval" || r.approvalStatus === "Returned");

  return (
    <div>
      <PageHeader
        title="Review & Approval Queue"
        subtitle="Requirements awaiting reviewer action or approval sign-off"
        testid="review-header"
      >
        <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-300">{queue.length} pending</span>
      </PageHeader>

      <div className="space-y-3">
        {queue.map((r) => (
          <div key={r.id} data-testid={`review-item-${r.stigId}`} className="rounded-xl border border-[var(--border-c)] bg-[var(--surface)] p-4 hover:border-[var(--brand)] transition-colors duration-150">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to={`/requirements/${r.stigId}`} className="font-mono text-sm text-[var(--brand)] font-semibold hover:underline">{r.stigId}</Link>
                  <SeverityBadge severity={r.severity} />
                  <ApprovalPill status={r.approvalStatus} />
                  <StatusPill status={r.status} />
                </div>
                <p className="text-sm text-[var(--text-primary)] mt-1.5 leading-snug">{r.title}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-[var(--text-muted)]">
                  <Avatar initials={r.assignee.initials} name={r.assignee.name} className="h-5 w-5 text-[9px]" />
                  <span>{r.assignee.name}</span>
                  <span>·</span>
                  <Clock className="h-3 w-3" />
                  <span>updated {r.updated}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch gap-2 shrink-0">
                <button
                  data-testid={`request-changes-${r.stigId}`}
                  className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/20 transition-colors duration-150"
                >
                  Return
                </button>
                <button
                  data-testid={`approve-${r.stigId}`}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors duration-150"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                </button>
              </div>
            </div>
          </div>
        ))}
        {queue.length === 0 && (
          <div className="rounded-xl border border-[var(--border-c)] bg-[var(--surface)] py-16 text-center text-sm text-[var(--text-muted)]">Queue is clear. Nothing awaiting review.</div>
        )}
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, FolderOpen, UserPlus, Check, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, SeverityBar } from "@/components/Primitives";
import { StatusPill, Avatar } from "@/components/Badges";
import { teamMembers } from "@/data/repository";
import { WORKFLOW_STAGES, INTERNAL_ROLES } from "@/data/repository";
import { useApp, PHASE_HOME } from "@/context/AppContext";
import SeniorReviewDashboard from "@/pages/SeniorReviewDashboard";
import { StigComments } from "@/components/StigComments";
import { AssignControl } from "@/pages/dashboard/AssignControl";

export default function Dashboard() {
  const navigate = useNavigate();
  const { visibleProjects, setOpenProjectId, role, roleId, currentPhaseId, assignLead, advanceStage, setStage, getStigComments, addStigComment, resolveStigComment, unreadStig, markStigRead } = useApp();

  if (roleId === "senior-review") return <SeniorReviewDashboard />;

  const isInternal = INTERNAL_ROLES.includes(role.id);
  const open = (id) => { setOpenProjectId(id); navigate(PHASE_HOME[currentPhaseId] || "/requirements"); };

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle={role.org ? `${role.org} vendor workspace — open a project to begin` : "Open a project to access its requirements and tools"}
        testid="dashboard-header"
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {visibleProjects.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card
              data-testid={`project-card-${p.id}`}
              onClick={() => open(p.id)}
              className="p-5 cursor-pointer group hover:border-[var(--brand)] transition-colors duration-150"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-[var(--text-primary)] truncate">{p.name}</h3>
                    <StatusPill status={p.status} />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1"><span className="font-mono">{p.version}</span> · {p.vendor} · Source: {p.sourceSrg}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-[var(--brand)] opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                  <FolderOpen className="h-4 w-4" /> Open
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[var(--text-secondary)]">Progress</span>
                  <span className="font-mono font-semibold text-[var(--text-primary)]">{p.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${p.progress}%` }} />
                </div>
              </div>

              {(() => {
                const approved = Math.round(p.total * p.progress / 100);
                const returned = Math.round(p.total * 0.06);
                const pending = Math.max(0, p.total - approved - returned);
                const pct = (n) => `${(n / p.total) * 100}%`;
                return (
                  <div className="mt-4" data-testid={`approval-bar-${p.id}`}>
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-1.5">
                      <span>Approval · {p.total} rules</span>
                      <span className="font-mono"><span className="text-emerald-500">{approved}</span> / <span className="text-amber-500">{pending}</span> / <span className="text-red-500">{returned}</span></span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[var(--bg-tertiary)] overflow-hidden flex">
                      <div className="h-full bg-emerald-500" style={{ width: pct(approved) }} title={`Approved: ${approved}`} />
                      <div className="h-full bg-amber-500" style={{ width: pct(pending) }} title={`Pending: ${pending}`} />
                      <div className="h-full bg-red-500" style={{ width: pct(returned) }} title={`Returned: ${returned}`} />
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[var(--text-muted)]">
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Approved</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Pending</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Returned</span>
                    </div>
                  </div>
                );
              })()}

              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                {role.id !== "vendor" && (() => {
                  const stage = WORKFLOW_STAGES.find((s) => s.id === p.stage) || WORKFLOW_STAGES[0];
                  return (
                    <div data-testid={`workflow-${p.id}`} className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                      <span className="text-xs text-[var(--text-secondary)]">Stage: <span className="font-medium text-[var(--text-primary)]">{stage.label}</span></span>
                      {stage.id === "pmrc" ? (
                        <div className="flex items-center gap-2">
                          <button data-testid={`return-btn-${p.id}`} onClick={(e) => { e.stopPropagation(); setStage(p.id, "ready-techedit"); toast(`${p.name}: Returned to Tech Edit`); }} className="rounded-md border border-amber-500/50 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors duration-150">Return to Tech Edit</button>
                          <button data-testid={`approve-btn-${p.id}`} onClick={(e) => { e.stopPropagation(); setStage(p.id, "delivered"); toast.success(`${p.name}: Approved for Delivery`); }} className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors duration-150">Approve for Delivery <ArrowRight className="h-3.5 w-3.5" /></button>
                        </div>
                      ) : stage.action ? (
                        <button
                          data-testid={`advance-btn-${p.id}`}
                          onClick={(e) => { e.stopPropagation(); advanceStage(p.id); toast.success(`${p.name}: ${stage.action}`); }}
                          className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors duration-150"
                        >
                          {stage.action} <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500"><CheckCircle2 className="h-3.5 w-3.5" /> Delivered</span>
                      )}
                    </div>
                  );
                })()}
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span>Lead: <span className="text-[var(--text-primary)]">{p.lead}</span></span>
                  <div className="flex items-center gap-3">
                    {(role.id === "gov-sme" || role.id === "pmrc") && <AssignControl project={p} onAssign={assignLead} />}
                    <span className="text-[var(--text-muted)]">Updated {p.updated}</span>
                  </div>
                </div>
              </div>
              {isInternal && (
                <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                  <StigComments comments={getStigComments(p.id)} onPost={(t, m) => { addStigComment(p.id, t, m); toast.success(m.length ? `Internal note added · pinged ${m.join(", ")}` : "Internal note added"); }} onResolve={(idx) => resolveStigComment(p.id, idx)} prefix={`stig-comments-${p.id}`} collapsible defaultOpen={false} mentionable={teamMembers} unread={unreadStig(p.id)} onOpen={() => markStigRead(p.id)} />
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
      {visibleProjects.length === 0 && <p className="text-sm text-[var(--text-muted)] mt-8">No projects assigned to this role.</p>}
    </div>
  );
}

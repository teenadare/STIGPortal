import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Layers, ClipboardCheck, RotateCcw, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/Primitives";
import { StatusPill } from "@/components/Badges";
import { WORKFLOW_STAGES, teamMembers } from "@/data/repository";
import { useApp } from "@/context/AppContext";
import { StigComments, StigBadge } from "@/components/StigComments";
import { cn } from "@/lib/utils";
import { Kpi } from "@/pages/senior-review/Kpi";

const segCls = (active) => cn("rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors duration-150", active ? "border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]" : "border-[var(--border-c)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]");

// Senior Review can only open stages up to Tech Edits — later stages show for
// status but are not clickable. "PMRC Ready" is not surfaced here at all.
const SENIOR_LOCKED = ["pmrc", "delivered"];
const SENIOR_STAGES = WORKFLOW_STAGES.filter((s) => s.id !== "ready-pmrc");

const STEP_SHORT = {
  "vendor-progress": "Vendor Draft",
  "vendor-ready": "STIG Draft",
  "ready-testing": "STIG Testing",
  "ready-techedit": "Tech Edits",
  "ready-pmrc": "PMRC Ready",
  pmrc: "PMRC",
  delivered: "Delivered",
};

// Which iteration screen each pipeline stage opens when clicked.
const STAGE_PHASE = {
  "vendor-progress": "vendor-draft",
  "vendor-ready": "stig-draft",
  "ready-testing": "stig-testing",
  "ready-techedit": "tech-edits",
  "ready-pmrc": "delivery",
  pmrc: "delivery",
  delivered: "delivery",
};

// Senior Review's primary decision per stage (advanceStage moves one step forward).
const SENIOR_ACTION = {
  "vendor-progress": { label: "Advance to STIG Writer", kind: "advance" },
  "vendor-ready": { label: "Approve Draft", kind: "advance" },
  "ready-testing": { label: "Approve Draft", kind: "advance" },
  "ready-techedit": { label: "Approve Tech Edit", kind: "advance" },
  "ready-pmrc": { label: "Advance to PMRC", kind: "advance" },
  pmrc: { label: "Approve for Delivery", kind: "deliver" },
  delivered: null,
};

export default function SeniorReviewDashboard() {
  const navigate = useNavigate();
  const { visibleProjects: projects, role, setOpenProjectId, setCurrentPhaseId, advanceStage, setStage, getStigComments, addStigComment, resolveStigComment, unreadStig, markStigRead } = useApp();

  const total = projects.length;
  const delivered = projects.filter((p) => p.stage === "delivered").length;
  const returned = projects.filter((p) => p.status === "Needs Revision").length;
  const awaiting = projects.filter((p) => p.stage !== "delivered").length;
  const [filter, setFilter] = useState("all");
  const shown = filter === "awaiting" ? projects.filter((p) => p.stage !== "delivered") : projects;

  const openAt = (id, phase) => { setOpenProjectId(id); setCurrentPhaseId(phase); navigate(`/phase/${phase}`); };

  return (
    <div data-testid="senior-dashboard">
      {/* Hero */}
      <div className="mb-6 rounded-2xl border border-[var(--brand)]/30 bg-gradient-to-br from-[var(--brand)]/12 via-[var(--surface)] to-[var(--surface)] p-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-[var(--brand)] flex items-center justify-center shrink-0 shadow-lg shadow-[var(--brand)]/30">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Senior Review</h1>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi testid="kpi-total" icon={Layers} label="Total Projects" value={total} />
        <Kpi testid="kpi-awaiting" icon={ClipboardCheck} label="Awaiting My Review" value={awaiting} accent />
        <Kpi testid="kpi-delivered" icon={CheckCircle2} label="Delivered" value={delivered} />
        <Kpi testid="kpi-returned" icon={RotateCcw} label="Needs Revision" value={returned} />
      </div>

      {/* Review inbox filter */}
      <div className="flex items-center gap-2 mb-5" data-testid="senior-filter">
        <button data-testid="filter-all" onClick={() => setFilter("all")} className={segCls(filter === "all")}>All projects ({projects.length})</button>
        <button data-testid="filter-awaiting" onClick={() => setFilter("awaiting")} className={segCls(filter === "awaiting")}>Awaiting my review ({awaiting})</button>
      </div>

      {/* Project moderation cards */}
      <div className="grid grid-cols-1 gap-4">
        {shown.map((p, i) => {
          const curIdx = WORKFLOW_STAGES.findIndex((s) => s.id === p.stage);
          const action = SENIOR_ACTION[p.stage];
          const approved = Math.round((p.total * p.progress) / 100);
          const returnedN = Math.round(p.total * 0.06);
          const pending = Math.max(0, p.total - approved - returnedN);
          const pct = (n) => `${(n / p.total) * 100}%`;
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card data-testid={`senior-project-${p.id}`} className="p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-[var(--text-primary)]">{p.name}</h3>
                      <StatusPill status={p.status} />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1"><span className="font-mono">{p.version}</span> · {p.vendor} · Lead: {p.lead}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-[var(--text-muted)]">Approval · {p.total} rules</p>
                    <p className="font-mono text-sm"><span className="text-emerald-500">{approved}</span> / <span className="text-amber-500">{pending}</span> / <span className="text-red-500">{returnedN}</span></p>
                  </div>
                </div>

                {/* Approval bar */}
                <div className="mt-4 h-2 w-full rounded-full bg-[var(--bg-tertiary)] overflow-hidden flex">
                  <div className="h-full bg-emerald-500" style={{ width: pct(approved) }} title={`Approved: ${approved}`} />
                  <div className="h-full bg-amber-500" style={{ width: pct(pending) }} title={`Pending: ${pending}`} />
                  <div className="h-full bg-red-500" style={{ width: pct(returnedN) }} title={`Returned: ${returnedN}`} />
                </div>

                {/* Stage pipeline tracker — click a stage to open that iteration */}
                <div className="mt-5 flex items-center" data-testid={`senior-pipeline-${p.id}`}>
                  {SENIOR_STAGES.map((s, idx) => {
                    const realIdx = WORKFLOW_STAGES.findIndex((x) => x.id === s.id);
                    const done = realIdx < curIdx;
                    const cur = realIdx === curIdx;
                    const locked = SENIOR_LOCKED.includes(s.id);
                    const dot = <span className={cn("h-3 w-3 rounded-full border-2 transition-colors duration-200", !locked && "group-hover:border-[var(--brand)]", done ? "bg-emerald-500 border-emerald-500" : cur ? "bg-[var(--brand)] border-[var(--brand)] ring-4 ring-[var(--brand)]/20" : "bg-[var(--bg-tertiary)] border-[var(--border-c)]")} />;
                    const label = <span className={cn("mt-1.5 text-[9px] whitespace-nowrap", !locked && "group-hover:text-[var(--brand)] group-hover:underline", cur ? "text-[var(--brand)] font-semibold" : done ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--text-muted)]")}>{STEP_SHORT[s.id]}</span>;
                    return (
                      <div key={s.id} className={cn("flex items-center", idx < SENIOR_STAGES.length - 1 ? "flex-1" : "")}>
                        {locked ? (
                          <div data-testid={`senior-stage-${p.id}-${s.id}`} title={STEP_SHORT[s.id]} className="flex flex-col items-center shrink-0 cursor-default select-none">
                            {dot}
                            {label}
                          </div>
                        ) : (
                          <button
                            type="button"
                            data-testid={`senior-stage-${p.id}-${s.id}`}
                            onClick={() => openAt(p.id, STAGE_PHASE[s.id])}
                            title={`Open ${STEP_SHORT[s.id]}`}
                            className="group flex flex-col items-center shrink-0 focus:outline-none"
                          >
                            {dot}
                            {label}
                          </button>
                        )}
                        {idx < SENIOR_STAGES.length - 1 && <span className={cn("h-0.5 flex-1 mx-1.5 -mt-4", done ? "bg-emerald-500" : "bg-[var(--border-c)]")} />}
                      </div>
                    );
                  })}
                </div>

                {/* Moderator actions */}
                <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2 flex-wrap">
                  {action?.kind === "advance" && (
                    <button data-testid={`senior-advance-${p.id}`} onClick={() => { advanceStage(p.id); toast.success(`${p.name}: ${action.label}`); }} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors duration-150">
                      {action.label} <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {action?.kind === "deliver" && (
                    <>
                      <button data-testid={`senior-return-${p.id}`} onClick={() => { setStage(p.id, "ready-techedit"); toast(`${p.name}: Returned to Tech Edit`); }} className="rounded-lg border border-amber-500/50 px-3 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors duration-150">Return to Tech Edit</button>
                      <button data-testid={`senior-approve-delivery-${p.id}`} onClick={() => { setStage(p.id, "delivered"); toast.success(`${p.name}: Approved for Delivery`); }} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors duration-150">Approve for Delivery <ArrowRight className="h-3.5 w-3.5" /></button>
                    </>
                  )}
                  {!action && <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500"><CheckCircle2 className="h-4 w-4" /> Delivered</span>}
                </div>
                <div className="mt-4">
                  <StigComments comments={getStigComments(p.id)} onPost={(t, m) => { addStigComment(p.id, t, m); toast.success(m.length ? `Internal note added · pinged ${m.join(", ")}` : "Internal note added"); }} onResolve={(idx) => resolveStigComment(p.id, idx)} prefix={`stig-comments-${p.id}`} collapsible defaultOpen={false} mentionable={teamMembers} unread={unreadStig(p.id)} onOpen={() => markStigRead(p.id)} />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
      {shown.length === 0 && <p className="text-sm text-[var(--text-muted)] mt-8">No projects awaiting your review.</p>}
    </div>
  );
}

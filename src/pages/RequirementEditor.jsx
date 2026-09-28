import { useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles, History, X, Layers3 } from "lucide-react";
import { ExpandableField } from "@/components/ExpandableField";
import { Field } from "@/components/form/Field";
import { RecordHeader } from "@/components/form/RecordHeader";
import { CommentsPanel } from "@/components/form/CommentsPanel";
import { ApprovalCard } from "@/components/form/ApprovalCard";
import { inputCls, monoInputCls } from "@/components/form/formStyles";
import { useApp } from "@/context/AppContext";
import { StigComments } from "@/components/StigComments";
import {
  getRequirements, getComments, getRevisions,
  getSrgDetail, getTesting, STATUSES, SEVERITIES, APPROVAL_STATUSES, INTERNAL_ROLES, teamMembers,
} from "@/data/repository";

const TESTIDS = {
  back: "back-btn", prev: "prev-record-btn", next: "next-record-btn",
  iaControl: "field-ia-control", cci: "field-cci", save: "save-requirement-btn",
  requirement: "field-requirement", satisfies: "field-satisfies", satisfiedBy: "field-satisfied-by",
};

export default function RequirementEditor() {
  const { stigId } = useParams();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const readOnly = sp.get("readonly") === "1";
  const { role, roleId, flagSenior, hasSenior, openProject, getStigComments, addStigComment, resolveStigComment, unreadStig, markStigRead } = useApp();

  const requirements = getRequirements();
  const ordered = [...requirements].sort((a, b) => a.stigId.localeCompare(b.stigId));
  const idx = Math.max(0, ordered.findIndex((r) => r.stigId === stigId));
  const base = ordered[idx] || requirements[0];
  const prev = ordered[idx - 1];
  const next = ordered[idx + 1];

  const srgDetail = getSrgDetail(base.id);
  const testing = getTesting(base.id);
  const [form, setForm] = useState({ ...base, cci: base.cci.join(", "), satisfies: testing.satisfies || "", satisfiedBy: testing.satisfiedBy || "" });
  const [thread, setThread] = useState(getComments(base.id));
  const [newComment, setNewComment] = useState("");
  const [similarFor, setSimilarFor] = useState(null);
  const revs = getRevisions(base.id);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const similar = (() => {
    if (!similarFor) return [];
    const wset = new Set((form[similarFor] || "").toLowerCase().match(/[a-z]{4,}/g) || []);
    return requirements.filter((r) => r.id !== base.id).map((r) => {
      const rw = (r[similarFor] || "").toLowerCase().match(/[a-z]{4,}/g) || [];
      const overlap = rw.filter((w) => wset.has(w)).length;
      return { ...r, score: Math.min(97, Math.round((overlap / Math.max(6, wset.size)) * 100) + 40) };
    }).sort((a, b) => b.score - a.score).slice(0, 3);
  })();

  const postComment = () => {
    if (!newComment.trim()) return;
    const senior = roleId === "senior-review";
    setThread((t) => [...t, { author: role.user, initials: role.initials, role: senior ? "Senior Review" : "Author", time: "just now", text: newComment.trim() }]);
    if (senior) flagSenior(base.id);
    setNewComment("");
    toast.success(senior ? "Senior Review comment added" : "Comment added");
  };
  const goto = (r) => r && navigate(`/requirements/${r.stigId}`);

  return (
    <fieldset disabled={readOnly} className="animate-fade-up block min-w-0 border-0 p-0 m-0">
      <RecordHeader
        breadcrumbLabel="Requirements" breadcrumbTo="/requirements"
        stigId={base.stigId} idx={idx} total={ordered.length} approvalStatus={form.approvalStatus} flagged={hasSenior(base.id)}
        onBack={() => navigate("/requirements")} onPrev={() => goto(prev)} onNext={() => goto(next)} hasPrev={!!prev} hasNext={!!next}
        iaControl={form.iaControl} onIaControlChange={set("iaControl")} cci={form.cci} onCciChange={set("cci")}
        onSave={() => toast.success("Requirement saved")} saveLabel="Save"
        requirementLabel="Requirement" requirement={form.title} onRequirementChange={set("title")}
        satisfies={form.satisfies} onSatisfiesChange={set("satisfies")} satisfiedBy={form.satisfiedBy} onSatisfiedByChange={set("satisfiedBy")}
        t={TESTIDS}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Content area */}
        <div className="lg:col-span-9" data-testid="requirement-fields">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="STIG ID"><input data-testid="field-stig-id" value={form.stigId} onChange={set("stigId")} className={monoInputCls} /></Field>
              <Field label="Severity"><select data-testid="field-severity" value={form.severity} onChange={set("severity")} className={inputCls}>{SEVERITIES.map((s) => <option key={s}>{s}</option>)}</select></Field>
              <Field label="Status"><select data-testid="field-status" value={form.status} onChange={set("status")} className={inputCls}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Vulnerability Discussion"><ExpandableField value={form.discussion} onChange={set("discussion")} rows={4} testid="field-vuln-discussion" /></Field>
            </div>

            <Field label="Check" action={<button data-testid="ai-similar-check-btn" onClick={() => setSimilarFor("check")} className="flex items-center gap-1 text-[10px] text-[var(--brand)] hover:underline"><Sparkles className="h-3 w-3" /> Similar verbiage</button>}><ExpandableField value={form.check} onChange={set("check")} rows={7} mono testid="field-check" /></Field>
            <Field label="Fix" action={<button data-testid="ai-similar-fix-btn" onClick={() => setSimilarFor("fix")} className="flex items-center gap-1 text-[10px] text-[var(--brand)] hover:underline"><Sparkles className="h-3 w-3" /> Similar verbiage</button>}><ExpandableField value={form.fix} onChange={set("fix")} rows={7} mono testid="field-fix" /></Field>

            <div className="md:col-span-2">
              <Field label="Status Justification"><ExpandableField value={form.statusJustification} onChange={set("statusJustification")} rows={3} testid="field-status-justification" /></Field>
            </div>

            <Field label="Mitigation"><ExpandableField value={form.mitigation} onChange={set("mitigation")} rows={3} testid="field-mitigation" /></Field>
            <Field label="Artifact Description"><ExpandableField value={form.artifactDescription} onChange={set("artifactDescription")} rows={3} testid="field-artifact-description" /></Field>

            <div className="md:col-span-2 rounded-xl border border-[var(--brand)]/30 bg-[var(--brand)]/5 p-5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--brand)] flex items-center gap-1.5 mb-4"><Layers3 className="h-3.5 w-3.5" /> Parent SRG (source)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-4">
                  <div><label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">SRG ID</label><input data-testid="field-srg-id" value={form.srg} onChange={set("srg")} className={monoInputCls + " mt-1"} /></div>
                  <ExpandableField label="SRG Requirement" value={srgDetail.srgRequirement || ""} onChange={() => {}} readOnly rows={3} testid="srg-requirement" />
                  <ExpandableField label="SRG Vuln Discussion" value={srgDetail.srgDiscussion || ""} onChange={() => {}} readOnly rows={3} testid="srg-discussion" />
                </div>
                <div className="space-y-4">
                  <ExpandableField label="SRG Check" value={srgDetail.srgCheck || ""} onChange={() => {}} readOnly rows={6} mono testid="srg-check" />
                  <ExpandableField label="SRG Fix" value={srgDetail.srgFix || ""} onChange={() => {}} readOnly rows={5} mono testid="srg-fix" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right pane */}
        <div className="lg:col-span-3 space-y-4">
          <ApprovalCard
            value={form.approvalStatus}
            onChange={(e) => { set("approvalStatus")(e); toast.success(`Approval → ${e.target.value}`); }}
            testid="field-approval-status"
            statuses={APPROVAL_STATUSES}
          />

          <CommentsPanel
            thread={thread}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onPost={postComment}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) postComment(); }}
          />

          {revs.length > 0 && (
            <div className="rounded-xl border border-[var(--border-c)] bg-[var(--surface)] p-4">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-1.5"><History className="h-3.5 w-3.5" /> Revisions</h4>
              <div className="space-y-2.5">
                {revs.slice(0, 4).map((r) => (
                  <div key={`${r.time}-${r.field}`} className="text-[11px] leading-tight">
                    <p className="text-[var(--text-secondary)]"><span className="text-[var(--text-primary)] font-medium">{r.author}</span> · {r.field}</p>
                    <p className="text-[var(--text-muted)]">{r.time}</p>
                  </div>
                ))}
                <Link to="/audit" className="text-xs text-[var(--brand)] hover:underline">Full history →</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {similarFor && (
        <div data-testid="ai-similar-panel" className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => setSimilarFor(null)}>
          <div className="w-full max-w-md h-full bg-[var(--bg-secondary)] border-l border-[var(--border-c)] p-5 overflow-y-auto animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><Sparkles className="h-4 w-4 text-[var(--brand)]" /> Similar {similarFor === "check" ? "Check" : "Fix"} verbiage</h3>
              <button onClick={() => setSimilarFor(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mb-4">Ranked by shared wording with this {similarFor}. <span className="text-amber-500">(Simulated)</span></p>
            <div className="space-y-3">
              {similar.map((s) => (
                <div key={s.id} className="rounded-lg border border-[var(--border-c)] bg-[var(--surface)] p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[var(--brand)]">{s.stigId}</span>
                    <span className="text-[11px] font-semibold text-emerald-500">{s.score}% verbiage</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{s.title}</p>
                  <pre className="mt-2 whitespace-pre-wrap rounded bg-[var(--bg-primary)] border border-[var(--border-c)] p-2 font-mono text-[10px] text-[var(--text-secondary)] max-h-24 overflow-hidden">{similarFor === "check" ? s.check : s.fix}</pre>
                  <button onClick={() => { setForm((f) => ({ ...f, [similarFor]: similarFor === "check" ? s.check : s.fix })); setSimilarFor(null); toast.success("Verbiage reused from " + s.stigId); }} className="mt-2 w-full rounded-lg border border-[var(--brand)] bg-[var(--brand)]/10 py-1.5 text-xs font-semibold text-[var(--brand)] hover:bg-[var(--brand)]/20 transition-colors duration-150">Reuse this {similarFor}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </fieldset>
  );
}

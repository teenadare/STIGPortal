import { Link } from "react-router-dom";
import { ArrowLeft, Save, ChevronRight, ChevronLeft } from "lucide-react";
import { ApprovalPill, SeniorFlag } from "@/components/Badges";
import { ExpandableField } from "@/components/ExpandableField";
import { monoInputCls } from "@/components/form/formStyles";

const navBtn =
  "h-8 w-8 flex items-center justify-center rounded-lg border border-[var(--border-c)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150";
const navBtnDisable = navBtn + " disabled:opacity-40 disabled:cursor-not-allowed";

// Shared header block for record editors: breadcrumb + approval pill, record
// navigation (back/prev/next), IA Control + CCI + Save, the primary requirement
// text and the Satisfies / Satisfied By pair. `t` carries the per-screen testids.
export function RecordHeader({
  breadcrumbLabel, breadcrumbTo, stigId, idx, total, approvalStatus, flagged,
  onBack, onPrev, onNext, hasPrev, hasNext,
  iaControl, onIaControlChange, cci, onCciChange, readOnly,
  onSave, saveLabel = "Save",
  requirementLabel = "Requirement", requirement, onRequirementChange,
  satisfies, onSatisfiesChange, satisfiedBy, onSatisfiedByChange,
  t,
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Link to={breadcrumbTo} className="hover:text-[var(--text-primary)]">{breadcrumbLabel}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-mono text-[var(--text-secondary)]">{stigId}</span>
        </div>
        <ApprovalPill status={approvalStatus} />
      </div>

      <div className="rounded-xl border border-[var(--border-c)] bg-[var(--surface)] p-4 mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="flex items-center gap-1">
                <button data-testid={t.back} onClick={onBack} className={navBtn}><ArrowLeft className="h-4 w-4" /></button>
                <button data-testid={t.prev} disabled={!hasPrev} onClick={onPrev} className={navBtnDisable}><ChevronLeft className="h-4 w-4" /></button>
                <button data-testid={t.next} disabled={!hasNext} onClick={onNext} className={navBtnDisable}><ChevronRight className="h-4 w-4" /></button>
              </div>
              <span className="text-[11px] text-[var(--text-muted)]">{idx + 1} of {total}</span>
            </div>
            <div className="min-w-0 flex items-center gap-2 flex-wrap pt-1.5">
              <span className="font-mono text-sm text-[var(--brand)] font-semibold">{stigId}</span>
              {flagged && <SeniorFlag />}
            </div>
          </div>
          <div className="flex items-end gap-3 shrink-0">
            <div><label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">IA Control</label><input data-testid={t.iaControl} value={iaControl} onChange={onIaControlChange} readOnly={readOnly} style={{ width: "9ch" }} className={monoInputCls} /></div>
            <div><label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">CCI</label><input data-testid={t.cci} value={cci} onChange={onCciChange} readOnly={readOnly} title={cci} style={{ width: "calc(10ch + 2rem)" }} className={monoInputCls} /></div>
            <button data-testid={t.save} onClick={onSave} className="shrink-0 flex items-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"><Save className="h-4 w-4" /> {saveLabel}</button>
          </div>
        </div>
        <div className="mt-4">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 block">{requirementLabel}</label>
          <ExpandableField value={requirement} onChange={onRequirementChange} readOnly={readOnly} rows={2} testid={t.requirement} />
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">Satisfies</label><input data-testid={t.satisfies} value={satisfies} onChange={onSatisfiesChange} placeholder="—" className={monoInputCls} /></div>
          <div><label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">Satisfied By</label><input data-testid={t.satisfiedBy} value={satisfiedBy} onChange={onSatisfiedByChange} placeholder="—" className={monoInputCls} /></div>
        </div>
      </div>
    </>
  );
}

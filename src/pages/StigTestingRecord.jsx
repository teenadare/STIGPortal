import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ExpandableField } from "@/components/ExpandableField";
import { Field } from "@/components/form/Field";
import { RecordHeader } from "@/components/form/RecordHeader";
import { CommentsPanel } from "@/components/form/CommentsPanel";
import { ApprovalCard } from "@/components/form/ApprovalCard";
import { inputCls, readCls } from "@/components/form/formStyles";
import { useApp } from "@/context/AppContext";
import { StigComments } from "@/components/StigComments";
import {
  getRequirements, getComments, getSrgDetail, getTesting,
  APPROVAL_STATUSES, TEST_STATUSES, defaultTestSteps, INTERNAL_ROLES, teamMembers,
} from "@/data/repository";

const TESTIDS = {
  back: "testing-back-btn", prev: "testing-prev-btn", next: "testing-next-btn",
  iaControl: "testing-ia-control", cci: "testing-cci", save: "save-testing-btn",
  requirement: "testing-requirement", satisfies: "testing-satisfies", satisfiedBy: "testing-satisfied-by",
};

export default function StigTestingRecord() {
  const { stigId } = useParams();
  const navigate = useNavigate();
  const { role, roleId, flagSenior, hasSenior, openProject, getStigComments, addStigComment, resolveStigComment, unreadStig, markStigRead } = useApp();

  const requirements = getRequirements();
  const ordered = [...requirements].sort((a, b) => a.stigId.localeCompare(b.stigId));
  const idx = Math.max(0, ordered.findIndex((r) => r.stigId === stigId));
  const base = ordered[idx] || requirements[0];
  const prev = ordered[idx - 1];
  const next = ordered[idx + 1];

  const srgDetail = getSrgDetail(base.id);
  const testing = getTesting(base.id);
  const [form, setForm] = useState({
    status: testing.status || TEST_STATUSES[0],
    testSteps: testing.testSteps || defaultTestSteps(testing.status || TEST_STATUSES[0]),
    securityFeatureMet: testing.securityFeatureMet || "Y",
    checkValid: testing.checkValid || "Y",
    fixValid: testing.fixValid || "Y",
    satisfies: testing.satisfies || "",
    satisfiedBy: testing.satisfiedBy || "",
  });
  const [approvalStatus, setApprovalStatus] = useState(base.approvalStatus || APPROVAL_STATUSES[0]);
  const [thread, setThread] = useState(getComments(base.id));
  const [newComment, setNewComment] = useState("");
  const postComment = () => {
    if (!newComment.trim()) return;
    const senior = roleId === "senior-review";
    setThread((t) => [...t, { author: role.user, initials: role.initials, role: senior ? "Senior Review" : "Tester", time: "just now", text: newComment.trim() }]);
    if (senior) flagSenior(base.id);
    setNewComment("");
    toast.success(senior ? "Senior Review comment added" : "Comment added");
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const onStatus = (e) => {
    const status = e.target.value;
    setForm((f) => ({ ...f, status, testSteps: defaultTestSteps(status) }));
  };
  const goto = (r) => r && navigate(`/testing/${r.stigId}`);

  return (
    <div className="animate-fade-up">
      <RecordHeader
        breadcrumbLabel="STIG Testing" breadcrumbTo="/phase/stig-testing"
        stigId={base.stigId} idx={idx} total={ordered.length} approvalStatus={approvalStatus} flagged={hasSenior(base.id)}
        onBack={() => navigate("/phase/stig-testing")} onPrev={() => goto(prev)} onNext={() => goto(next)} hasPrev={!!prev} hasNext={!!next}
        iaControl={base.iaControl} cci={base.cci.join(", ")} readOnly
        onSave={() => toast.success("Test results saved")} saveLabel="Save"
        requirementLabel="STIG Requirement" requirement={base.title}
        satisfies={form.satisfies} onSatisfiesChange={set("satisfies")} satisfiedBy={form.satisfiedBy} onSatisfiedByChange={set("satisfiedBy")}
        t={TESTIDS}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="testing-record-form">
            {/* Identifiers */}
            <div className="md:col-span-2 grid grid-cols-2 gap-3">
              <Field label="STIG ID"><input data-testid="testing-stig-id" value={base.stigId} readOnly className={readCls} /></Field>
              <Field label="SRG ID"><input data-testid="testing-srg-id" value={base.srg} readOnly className={readCls} /></Field>
            </div>

            {/* Status | Severity */}
            <Field label="Status">
              <select data-testid="testing-status" value={form.status} onChange={onStatus} className={inputCls}>
                {TEST_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Severity"><input data-testid="testing-severity" value={base.severity} readOnly className={readCls} /></Field>

            {/* STIG Check | STIG Fix */}
            <Field label="STIG Check"><ExpandableField value={base.check} onChange={() => {}} readOnly rows={11} mono testid="testing-check" /></Field>
            <Field label="STIG Fix"><ExpandableField value={base.fix} onChange={() => {}} readOnly rows={11} mono testid="testing-fix" /></Field>

            {/* SRG Requirement (source) */}
            <div className="md:col-span-2">
              <Field label="SRG Requirement" srg><ExpandableField value={srgDetail.srgRequirement || ""} onChange={() => {}} readOnly rows={3} testid="testing-srg-requirement" /></Field>
            </div>

            {/* Test Steps */}
            <div className="md:col-span-2">
              <Field label="Test Steps">
                <select data-testid="testing-test-steps" value={form.testSteps} onChange={set("testSteps")} className={inputCls}>
                  <option>Standard Test Steps</option>
                  <option>Verify Status</option>
                </select>
                <p className="mt-1.5 text-[10px] text-[var(--text-muted)]">Defaults to "Standard Test Steps" for Applicable - Configurable and "Verify Status" for all other statuses.</p>
              </Field>
            </div>

            {/* Y/N validations */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Security Feature Met">
                <select data-testid="testing-security-met" value={form.securityFeatureMet} onChange={set("securityFeatureMet")} className={inputCls}><option>Y</option><option>N</option></select>
              </Field>
              <Field label="Check Procedure Valid">
                <select data-testid="testing-check-valid" value={form.checkValid} onChange={set("checkValid")} className={inputCls}><option>Y</option><option>N</option></select>
              </Field>
              <Field label="Fix Procedure Valid">
                <select data-testid="testing-fix-valid" value={form.fixValid} onChange={set("fixValid")} className={inputCls}><option>Y</option><option>N</option></select>
              </Field>
            </div>

            {/* Tester */}
            <div className="md:col-span-2">
              <Field label="Tester"><input data-testid="testing-tester" value="Teena Brinkley" readOnly className={inputCls + " opacity-90 cursor-default"} /></Field>
            </div>
          </div>
        </div>

        {/* Right pane */}
        <div className="lg:col-span-3 space-y-4">
          <ApprovalCard
            value={approvalStatus}
            onChange={(e) => { setApprovalStatus(e.target.value); toast.success(`Approval → ${e.target.value}`); }}
            testid="testing-approval-status"
            statuses={APPROVAL_STATUSES}
          />

          <CommentsPanel
            thread={thread}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onPost={postComment}
            idPrefix="testing-"
          />
        </div>
      </div>
    </div>
  );
}

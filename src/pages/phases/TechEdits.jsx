import { RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/Primitives";
import { useApp } from "@/context/AppContext";
import DraftTable from "@/components/DraftTable";

export default function TechEdits() {
  const { role } = useApp();
  const isPMRC = role.id === "pmrc";

  return (
    <div>
      <PageHeader
        title="Tech Edits"
        subtitle="Final edits and post-Red Team changes before delivery. Advance the workflow from the Projects page."
        testid="techedits-header"
      />

      <div className="rounded-lg border border-[var(--brand)]/30 bg-[var(--brand)]/5 px-4 py-2.5 mb-5 text-sm text-[var(--text-secondary)] flex items-center gap-2">
        <RotateCcw className="h-4 w-4 text-[var(--brand)]" />
        Editing the merged Tech Edit document (v2). The pre-testing draft (v1) is preserved for rollback.
        {isPMRC && <span className="ml-auto text-xs font-semibold text-emerald-400">PMRC: comment, edit & approve</span>}
      </div>

      <DraftTable prefix="techedit" />
    </div>
  );
}

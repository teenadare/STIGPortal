import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ScanSearch, Link2, Check } from "lucide-react";
import { Card } from "@/components/Primitives";
import { duplicateClusters } from "@/data/repository";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { ClusterCard } from "@/pages/duplicate-scan/ClusterCard";

export default function DuplicateScan() {
  const navigate = useNavigate();
  const { reqs, flagDuplicates } = useApp();

  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <button data-testid="scan-back-btn" onClick={() => navigate("/phase/stig-testing")} className="h-8 w-8 flex items-center justify-center rounded-lg border border-[var(--border-c)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"><ArrowLeft className="h-4 w-4" /></button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2"><ScanSearch className="h-6 w-6 text-[var(--brand)]" /> Duplicate Scan</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Probable duplicates from a similarity scan — review and group with human confirmation. <span className="text-amber-500">(Simulated)</span></p>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--brand)]/30 bg-[var(--brand)]/5 px-4 py-2.5 mb-5 text-sm text-[var(--text-secondary)]">
        {duplicateClusters.length} probable duplicate cluster(s) detected. Pick a parent, choose which rules to include, then <span className="font-medium text-[var(--text-primary)]">Group as Duplicates</span> to set the Satisfies / Satisfied By hierarchy.
      </div>

      <div className="space-y-4" data-testid="duplicate-scan-results">
        {duplicateClusters.map((c) => (
          <ClusterCard key={c.id} cluster={c} reqs={reqs} flagDuplicates={flagDuplicates} />
        ))}
      </div>
    </div>
  );
}

import { useState } from "react";
import { toast } from "sonner";
import { Hash, Play } from "lucide-react";
import { PageHeader, Card } from "@/components/Primitives";
import { requirements } from "@/data/repository";
import { useApp } from "@/context/AppContext";

export default function CreateStigId() {
  const { openProject } = useApp();
  const [prefix, setPrefix] = useState("HRZN-8X");
  const [start, setStart] = useState(10);
  const [step, setStep] = useState(10);

  const preview = requirements.slice(0, 6).map((_, i) => `${prefix}-${String(start + i * step).padStart(6, "0")}`);

  return (
    <div>
      <PageHeader
        title="Create STIG ID"
        subtitle={`Populate STIG IDs for ${openProject?.name || "the open project"} via a sequential DB job`}
        testid="create-stigid-header"
      />
      <div className="max-w-xl">
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><Hash className="h-4 w-4 text-[var(--brand)]" /> STIG ID Generator</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Prefix</label>
              <input data-testid="stigid-prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} className="mt-1 w-full rounded-lg bg-[var(--bg-primary)] border border-[var(--border-c)] px-3 py-2 text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)]" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Start Number</label>
              <input type="number" data-testid="stigid-start" value={start} onChange={(e) => setStart(+e.target.value)} className="mt-1 w-full rounded-lg bg-[var(--bg-primary)] border border-[var(--border-c)] px-3 py-2 text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)]" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Increment</label>
              <input type="number" data-testid="stigid-step" value={step} onChange={(e) => setStep(+e.target.value)} className="mt-1 w-full rounded-lg bg-[var(--bg-primary)] border border-[var(--border-c)] px-3 py-2 text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)]" />
            </div>
          </div>
          <div className="rounded-lg bg-[var(--bg-tertiary)] p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Preview ({requirements.length} rules total)</p>
            <div className="flex flex-wrap gap-1.5">
              {preview.map((id) => <span key={id} className="font-mono text-[11px] rounded border border-[var(--border-c)] bg-[var(--bg-primary)] px-1.5 py-0.5 text-[var(--brand)]">{id}</span>)}
              <span className="text-[11px] text-[var(--text-muted)] self-center">…</span>
            </div>
          </div>
          <button data-testid="run-stigid-job-btn" onClick={() => toast.success("DB job complete — STIG IDs populated for all requirements")} className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-hover)] transition-colors duration-150">
            <Play className="h-4 w-4" /> Run STIG ID Job
          </button>
        </Card>
      </div>
    </div>
  );
}

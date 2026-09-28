import { useState } from "react";
import { toast } from "sonner";
import { FileText, FileSpreadsheet, DatabaseBackup, FileCode2, Upload, UploadCloud } from "lucide-react";
import { PageHeader, Card } from "@/components/Primitives";
import { requirements } from "@/data/repository";
import { useApp } from "@/context/AppContext";

const IMPORT_TARGETS = ["Vendor Draft", "STIG Draft", "STIG Testing", "Tech Edit"];

// Parent SRG family — derived the same way the app groups SRGs.
const familyOf = (i) => (i % 2 === 0 ? "Application Core" : "GPOS");

function groupsByFamily() {
  const m = {};
  requirements.forEach((r, i) => { const f = familyOf(i); (m[f] = m[f] || []).push(r); });
  return m;
}

function download(name, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildFile(fmt, fam, rows) {
  if (fmt === "csv" || fmt === "excel") {
    const header = "STIG ID,SRG ID,Severity,Status,IA Control,CCI,Requirement";
    const lines = rows.map((r) => [r.stigId, r.srg, r.severity, r.status, r.iaControl, (r.cci || []).join(" "), `"${(r.title || "").replace(/"/g, '""')}"`].join(","));
    return { ext: "csv", content: [`# Parent SRG Family: ${fam}`, header, ...lines].join("\n") };
  }
  if (fmt === "xccdf") {
    return { ext: "xml", content: `<?xml version="1.0" encoding="UTF-8"?>\n<Benchmark family="${fam}">\n` + rows.map((r) => `  <Rule id="${r.stigId}" severity="${r.severity}" status="${r.status}">\n    <title>${r.title}</title>\n  </Rule>`).join("\n") + `\n</Benchmark>` };
  }
  if (fmt === "ckl") {
    return { ext: "ckl", content: `Parent SRG Family: ${fam}\n\nSTIG ID\tStatus\tSeverity\tRequirement\n` + rows.map((r) => `${r.stigId}\t${r.status}\t${r.severity}\t${r.title}`).join("\n") };
  }
  return { ext: "json", content: JSON.stringify({ family: fam, rules: rows }, null, 2) };
}

export default function ExportPage() {
  const { openProject } = useApp();
  const [fileName, setFileName] = useState("");
  const [target, setTarget] = useState(IMPORT_TARGETS[1]);

  const options = [
    { key: "xccdf", label: "XCCDF (.xml)", desc: "DISA-conformant benchmark for STIG Viewer", icon: FileCode2 },
    { key: "ckl", label: "Checklist (.ckl)", desc: "STIG Viewer checklist export", icon: FileText },
    { key: "csv", label: "CSV (.csv)", desc: "Comma-separated requirement export", icon: FileText },
    { key: "excel", label: "Excel (.csv)", desc: "Spreadsheet workbook with all fields", icon: FileSpreadsheet },
    { key: "backup", label: "Full Project Backup (.json)", desc: "Requirements, revisions, comments & audit", icon: DatabaseBackup },
  ];

  const exportPackage = (fmt) => {
    const groups = groupsByFamily();
    const families = Object.keys(groups);
    families.forEach((fam) => {
      const { ext, content } = buildFile(fmt, fam, groups[fam]);
      download(`${fam.replace(/\s+/g, "_")}.${ext}`, content);
    });
    toast.success(`Exported ${families.length} Parent SRG package files (${requirements.length} rules split by family)`);
  };

  return (
    <div>
      <PageHeader
        title="Import / Export"
        subtitle={`Import a benchmark or export ${openProject?.name || "the open project"} in standard formats`}
        testid="export-header"
      />

      {/* Import */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-3"><Upload className="h-4 w-4 text-[var(--brand)]" /> Import</h3>
        <Card className="p-5 max-w-3xl" data-testid="import-panel">
          <p className="text-[11px] text-[var(--text-muted)] mb-4">Upload an XCCDF (.xml), STIG Viewer checklist (.ckl), CSV or Excel file, choose where to apply it, then Apply. <span className="text-amber-500 font-medium">Holding place — simulated (no file is parsed).</span></p>

          <label data-testid="import-dropzone" className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border-c)] bg-[var(--bg-primary)] px-4 py-8 text-center cursor-pointer hover:border-[var(--brand)] transition-colors duration-150">
            <UploadCloud className="h-7 w-7 text-[var(--brand)]" />
            <span className="text-sm text-[var(--text-primary)] font-medium">{fileName || "Choose a file to import"}</span>
            <span className="text-[11px] text-[var(--text-muted)]">XCCDF · CKL · CSV · XLSX</span>
            <input data-testid="import-file-input" type="file" accept=".xml,.ckl,.csv,.xlsx" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} />
          </label>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[220px]">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1 block">Apply to</label>
              <select data-testid="import-target" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full h-9 rounded-lg border border-[var(--border-c)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)]">
                {IMPORT_TARGETS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <button
              data-testid="import-apply-btn"
              onClick={() => toast.success(`Imported ${fileName || "file"} into ${target} (simulated)`)}
              className="h-9 flex items-center gap-2 rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-hover)] transition-colors duration-150"
            >
              <Upload className="h-4 w-4" /> Apply
            </button>
          </div>
        </Card>
      </section>

      {/* Export */}
      <section>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-1"><DatabaseBackup className="h-4 w-4 text-[var(--brand)]" /> Export</h3>
        <p className="text-[11px] text-[var(--text-muted)] mb-3">Each export downloads a package split into one file per Parent SRG family (Application Core, GPOS).</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
          {options.map((o) => (
            <Card
              key={o.key}
              data-testid={`export-option-${o.key}`}
              onClick={() => exportPackage(o.key)}
              className="p-4 cursor-pointer flex items-center gap-3 hover:border-[var(--brand)] transition-colors duration-150"
            >
              <o.icon className="h-6 w-6 text-[var(--brand)] shrink-0" />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{o.label}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{o.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

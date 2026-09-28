import { useState, useRef, useEffect } from "react";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { toast } from "sonner";

// Export dropdown for requirement lists (XCCDF / CSV / Excel).
export function ExportMenu({ label = "Export", testid = "export-menu" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const options = [
    { key: "xccdf", label: "XCCDF (.xml)", icon: FileText, desc: "DISA benchmark format" },
    { key: "csv", label: "CSV (.csv)", icon: FileText, desc: "Comma-separated values" },
    { key: "excel", label: "Excel (.xlsx)", icon: FileSpreadsheet, desc: "Spreadsheet workbook" },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        data-testid={testid}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 h-9 rounded-lg border border-[var(--border-c)] bg-[var(--surface)] px-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
      >
        <Download className="h-4 w-4" /> {label} <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-56 rounded-lg border border-[var(--border-c)] bg-[var(--bg-secondary)] shadow-xl z-50 p-1 animate-fade-up">
          {options.map((o) => (
            <button
              key={o.key}
              data-testid={`${testid}-${o.key}`}
              onClick={() => { setOpen(false); toast.success(`Exporting ${o.label}…`); }}
              className="w-full flex items-start gap-2.5 rounded-md px-3 py-2 text-left hover:bg-[var(--surface-hover)] transition-colors duration-150"
            >
              <o.icon className="h-4 w-4 mt-0.5 text-[var(--brand)] shrink-0" />
              <div>
                <p className="text-sm text-[var(--text-primary)]">{o.label}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{o.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

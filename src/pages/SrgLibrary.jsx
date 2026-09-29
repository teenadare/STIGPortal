import { useState } from "react";
import { toast } from "sonner";
import { Upload, Network, Trash2, X, Plus, FileUp, Pencil } from "lucide-react";
import { PageHeader, Card } from "@/components/Primitives";
import { srgFamilies as seedFamilies } from "@/data/repository";
import { ImportModal } from "@/pages/srg-library/ImportModal";

const inputCls =
  "w-full rounded-lg bg-[var(--bg-primary)] border border-[var(--border-c)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)] transition-colors duration-150";

export default function SrgLibrary() {
  const [families, setFamilies] = useState(seedFamilies);
  const [importOpen, setImportOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ label: "", full: "" });

  const remove = (id) => { setFamilies((f) => f.filter((x) => x.id !== id)); toast(`SRG removed`); };
  const add = (fam) => setFamilies((f) => (f.some((x) => x.id === fam.id) ? f : [...f, fam]));
  const saveEdit = () => { setFamilies((fs) => fs.map((x) => (x.id === editingId ? { ...x, label: draft.label.trim() || x.label, full: draft.full.trim() || x.full } : x))); setEditingId(null); toast.success("SRG updated"); };

  return (
    <div>
      <PageHeader
        title="SRG Library"
        subtitle="Import and manage parent Security Requirements Guides (PMRC)"
        testid="srg-library-header"
      >
        <button data-testid="srg-import-btn" onClick={() => setImportOpen(true)} className="flex items-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-hover)] transition-colors duration-150">
          <Plus className="h-4 w-4" /> Import SRG
        </button>
      </PageHeader>

      <p data-testid="srg-count" className="text-xs text-[var(--text-muted)] mb-3">Managing <span className="font-semibold text-[var(--text-primary)]">{families.length}</span> SRG families</p>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--bg-secondary)] text-left text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                <th className="px-4 py-3 font-semibold">Family</th>
                <th className="px-4 py-3 font-semibold min-w-[280px]">Full SRG Name</th>
                <th className="px-4 py-3 font-semibold">Requirements</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {families.map((f) => (
                editingId === f.id ? (
                  <tr key={f.id} data-testid={`srg-row-${f.id}`} className="border-t border-[var(--border-subtle)] bg-[var(--brand)]/5">
                    <td className="px-4 py-3"><input data-testid={`srg-edit-label-${f.id}`} value={draft.label} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))} className={inputCls} /></td>
                    <td className="px-4 py-3"><input data-testid={`srg-edit-full-${f.id}`} value={draft.full} onChange={(e) => setDraft((d) => ({ ...d, full: e.target.value }))} className={inputCls} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">{f.count}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button data-testid={`srg-save-${f.id}`} onClick={saveEdit} className="inline-flex items-center gap-1.5 rounded-md bg-[var(--brand)] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[var(--brand-hover)] mr-1.5">Save</button>
                      <button data-testid={`srg-cancel-${f.id}`} onClick={() => setEditingId(null)} className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-c)] px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Cancel</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={f.id} data-testid={`srg-row-${f.id}`} className="border-t border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] transition-colors duration-150">
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-2 font-semibold text-[var(--text-primary)]"><Network className="h-4 w-4 text-[var(--brand)]" /> {f.label}</span></td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{f.full}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">{f.count}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button data-testid={`srg-edit-${f.id}`} onClick={() => { setEditingId(f.id); setDraft({ label: f.label, full: f.full }); }} className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-c)] px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] mr-1.5"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                      <button data-testid={`srg-remove-${f.id}`} onClick={() => remove(f.id)} className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-c)] px-2.5 py-1 text-xs text-red-500 hover:bg-red-500/10 transition-colors duration-150"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
        {families.length === 0 && <div className="py-12 text-center text-sm text-[var(--text-muted)]">No SRGs. Import one to get started.</div>}
      </Card>

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} onImport={add} />
    </div>
  );
}

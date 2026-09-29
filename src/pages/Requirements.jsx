import { useMemo, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Search, SlidersHorizontal, Plus, Layers, ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/Primitives";
import { Avatar } from "@/components/Badges";
import { SEVERITIES, STATUSES, APPROVAL_STATUSES, GROUP_BY_OPTIONS } from "@/data/repository";
import { useApp } from "@/context/AppContext";
import { useSelection, BulkBar, DuplicateModal, BulkCell } from "@/components/BulkActions";
import { ParentSrgFilter } from "@/components/ParentSrgFilter";
import { cn } from "@/lib/utils";
import { FilterSelect } from "@/pages/requirements/FilterSelect";

export default function Requirements() {
  const navigate = useNavigate();
  const { reqs, updateReqs, flagDuplicates } = useApp();
  const [query, setQuery] = useState("");
  const [sevFilter, setSevFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [groupBy, setGroupBy] = useState("none");
  const { selected, setSelected, toggle, clear } = useSelection();
  const [dupOpen, setDupOpen] = useState(false);
  const [srgSel, setSrgSel] = useState(null);

  const parentSrgs = ["Application Core", "GPOS"];
  const familyOf = (r) => (reqs.findIndex((x) => x.id === r.id) % 2 === 0 ? "Application Core" : "GPOS");
  const srgSelected = srgSel === null ? parentSrgs : srgSel;
  const onSrgChange = (arr) => setSrgSel(arr.length === parentSrgs.length ? null : arr);

  const rows = useMemo(() => {
    return reqs.filter((r) => {
      const q = query.toLowerCase();
      const matchesQ = !q || [r.stigId, r.title, r.srg, r.iaControl].some((v) => v.toLowerCase().includes(q));
      const matchesSev = sevFilter === "All" || r.severity === sevFilter;
      const matchesStatus = statusFilter === "All" || r.status === statusFilter;
      const matchesSrg = srgSel === null || srgSel.includes(familyOf(r));
      return matchesQ && matchesSev && matchesStatus && matchesSrg;
    });
  }, [reqs, query, sevFilter, statusFilter, srgSel]);

  const groups = useMemo(() => {
    if (groupBy === "none") return [{ key: null, items: rows }];
    const map = {};
    rows.forEach((r) => { const k = r[groupBy]; (map[k] = map[k] || []).push(r); });
    return Object.entries(map).map(([key, items]) => ({ key, items }));
  }, [rows, groupBy]);

  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r.id));
  const toggleAll = () => setSelected(allChecked ? [] : rows.map((r) => r.id));
  const selectedItems = reqs.filter((r) => selected.includes(r.id));

  return (
    <div>
      <div data-testid="requirements-header" className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Requirements</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Omnissa Horizon 8 STIG · V1R2 (Draft)</p>
        </div>
        <ParentSrgFilter options={parentSrgs} selected={srgSelected} onChange={onSrgChange} testid="req-parent-srg-filter" />
        <button data-testid="add-requirement-btn" title="Holding place for adding requirements to Draft and moving them up through Testing and Tech Edit." className="flex items-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-hover)] transition-colors duration-150">
          <Plus className="h-4 w-4" /> Add Requirement
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input data-testid="requirements-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter by STIG ID, requirement, SRG, IA control…" className="w-full h-9 rounded-lg bg-[var(--surface)] border border-[var(--border-c)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand)] transition-colors duration-150" />
        </div>
        <div className="relative">
          <Layers className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
          <select data-testid="group-by-select" value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="h-9 appearance-none rounded-lg border border-[var(--border-c)] bg-[var(--surface)] pl-8 pr-8 text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[var(--brand)]">
            {GROUP_BY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{`Group: ${o.label}`}</option>)}
          </select>
        </div>
        <FilterSelect testid="severity-filter" value={sevFilter} onChange={setSevFilter} options={["All", ...SEVERITIES]} icon />
        <FilterSelect testid="status-filter" value={statusFilter} onChange={setStatusFilter} options={["All", ...STATUSES]} />
      </div>

      <p data-testid="requirements-count" className="text-xs text-[var(--text-muted)] mb-3">Showing <span className="font-semibold text-[var(--text-primary)]">{rows.length}</span> of {reqs.length} loaded</p>

      <BulkBar count={selected.length} onFlagDuplicates={() => setDupOpen(true)} onClear={clear} onSave={() => toast.success("Changes saved")}>
        <select data-testid="bulk-approval-select" defaultValue="" onChange={(e) => { if (e.target.value) { updateReqs(selected, { approvalStatus: e.target.value }); e.target.value = ""; } }} className="h-8 rounded-md border border-[var(--border-c)] bg-[var(--bg-secondary)] px-2 text-xs text-[var(--text-primary)]">
          <option value="">Set approval…</option>
          {APPROVAL_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </BulkBar>

      <div className="rounded-xl border border-[var(--border-c)] bg-[var(--surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] text-left text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                <th className="w-10 px-4 py-3"><input data-testid="select-all-checkbox" type="checkbox" checked={allChecked} onChange={toggleAll} className="accent-[var(--brand)]" /></th>
                <th className="px-3 py-3 font-semibold">Approval</th>
                <th className="px-3 py-3 font-semibold">STIG ID</th>
                <th className="px-3 py-3 font-semibold min-w-[280px]">Requirement</th>
                <th className="px-3 py-3 font-semibold">Severity</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Satisfied By</th>
                <th className="px-3 py-3 font-semibold">IA</th>
                <th className="px-3 py-3 font-semibold">SRG</th>
                <th className="px-3 py-3 font-semibold">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <Fragment key={g.key ?? "all"}>
                  {g.key !== null && (
                    <tr data-testid={`group-header-${g.key}`} className="bg-[var(--bg-tertiary)]">
                      <td colSpan={10} className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        <ChevronDown className="inline h-3.5 w-3.5 mr-1.5" />{g.key} <span className="text-[var(--text-muted)]">· {g.items.length}</span>
                      </td>
                    </tr>
                  )}
                  {g.items.map((r) => {
                    const isSel = selected.includes(r.id);
                    return (
                      <tr key={r.id} data-testid={`req-row-${r.stigId}`} onClick={() => navigate(`/requirements/${r.stigId}`)} className={cn("border-t border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] cursor-pointer transition-colors duration-150", isSel && "bg-[var(--brand)]/5")}>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={isSel} onChange={() => toggle(r.id)} className="accent-[var(--brand)]" data-testid={`row-checkbox-${r.stigId}`} />
                        </td>
                        <td className="px-3 py-3"><BulkCell selected={isSel} value={r.approvalStatus} options={APPROVAL_STATUSES} display={<span className="text-xs text-[var(--text-primary)] whitespace-nowrap">{r.approvalStatus}</span>} onPropagate={(v) => updateReqs(selected, { approvalStatus: v })} /></td>
                        <td className="px-3 py-3"><span className="font-mono text-xs text-[var(--brand)] font-medium">{r.stigId}</span></td>
                        <td className="px-3 py-3 text-[var(--text-primary)] max-w-[420px]"><span className="line-clamp-2">{r.title}</span></td>
                        <td className="px-3 py-3"><BulkCell selected={isSel} value={r.severity} options={SEVERITIES} display={<span className="text-xs text-[var(--text-primary)] whitespace-nowrap">{r.severity}</span>} onPropagate={(v) => updateReqs(selected, { severity: v })} /></td>
                        <td className="px-3 py-3"><BulkCell selected={isSel} value={r.status} options={STATUSES} display={<span className="text-xs text-[var(--text-primary)] whitespace-nowrap">{r.status}</span>} onPropagate={(v) => updateReqs(selected, { status: v })} /></td>
                        <td className="px-3 py-3">{r.satisfiedBy ? <span className="font-mono text-[11px] text-violet-500">{r.satisfiedBy}</span> : <span className="text-[var(--text-muted)]">—</span>}</td>
                        <td className="px-3 py-3"><span className="font-mono text-[11px] text-[var(--text-secondary)]">{r.iaControl}</span></td>
                        <td className="px-3 py-3"><span className="font-mono text-[11px] text-[var(--text-secondary)]">{r.srg}</span></td>
                        <td className="px-3 py-3"><div className="flex items-center gap-2"><Avatar initials={r.assignee.initials} name={r.assignee.name} /><span className="text-xs text-[var(--text-secondary)] hidden xl:inline">{r.assignee.name}</span></div></td>
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <div className="py-16 text-center text-sm text-[var(--text-muted)]">No requirements match your filters.</div>}
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-3">Showing {rows.length} of {reqs.length} loaded · 176 total in benchmark</p>

      <DuplicateModal open={dupOpen} items={selectedItems} onClose={() => setDupOpen(false)} onApply={(parentId) => flagDuplicates(selected, parentId)} />
    </div>
  );
}


import { useMemo, useState, useRef, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Search, Layers, ChevronDown, Plus } from "lucide-react";
import { Card } from "@/components/Primitives";
import { SeniorFlag } from "@/components/Badges";
import { GROUP_BY_OPTIONS } from "@/data/repository";
import { useApp } from "@/context/AppContext";
import { useSelection, BulkBar, DuplicateModal } from "@/components/BulkActions";
import { FindReplace, TEXT_FIELDS } from "@/components/FindReplace";
import { cn } from "@/lib/utils";
import { COLS, CHECKBOX_W, cciText, getVal, editCls, txtCls } from "@/components/draft/cells";
import { useColumnWidths } from "@/components/draft/useColumnWidths";
import { TextCell } from "@/components/draft/TextCell";
import { SelectCell } from "@/components/draft/SelectCell";
import { ColumnMenu } from "@/components/draft/ColumnMenu";

export default function DraftTable({ prefix, blankStigId, readOnly }) {
  const { reqs, updateReqs, flagDuplicates, hasSenior } = useApp();
  const { selected, setSelected, toggle, clear } = useSelection();
  const [dupOpen, setDupOpen] = useState(false);
  const [widths, startResize] = useColumnWidths(COLS);
  const [query, setQuery] = useState("");
  const [groupBy, setGroupBy] = useState("none");
  const [sort, setSort] = useState(null); // {key, dir}
  const [filters, setFilters] = useState({}); // {key: allowedValues[]}
  const [activeMatch, setActiveMatch] = useState(null); // {id, field} highlighted by Find/Replace
  const activeCellRef = useRef(null);

  useEffect(() => {
    if (activeMatch) activeCellRef.current?.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
  }, [activeMatch]);

  const distinct = useMemo(() => {
    const map = {};
    COLS.forEach((c) => {
      map[c.key] = Array.from(new Set(reqs.map((r) => String(getVal(r, c.key))))).sort((a, b) => a.localeCompare(b));
    });
    return map;
  }, [reqs]);

  const rows = useMemo(() => {
    const q = query.toLowerCase();
    let out = reqs.filter((r) => !q || [r.stigId, r.title, r.srg, r.iaControl, cciText(r)].some((v) => (v || "").toLowerCase().includes(q)));
    Object.entries(filters).forEach(([k, allowed]) => {
      out = out.filter((r) => allowed.includes(String(getVal(r, k))));
    });
    if (sort) {
      const dir = sort.dir === "desc" ? -1 : 1;
      out = [...out].sort((a, b) => dir * String(getVal(a, sort.key)).localeCompare(String(getVal(b, sort.key)), undefined, { numeric: true }));
    }
    return out;
  }, [reqs, query, filters, sort]);

  const groups = useMemo(() => {
    if (groupBy === "none") return [{ key: null, items: rows }];
    const map = {};
    rows.forEach((r) => { const k = groupBy === "cci" ? cciText(r) : r[groupBy]; (map[k] = map[k] || []).push(r); });
    return Object.entries(map).map(([key, items]) => ({ key, items }));
  }, [rows, groupBy]);

  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r.id));
  const toggleAll = () => setSelected(allChecked ? [] : rows.map((r) => r.id));
  const selectedItems = reqs.filter((r) => selected.includes(r.id));
  const set = (key) => (v) => updateReqs(selected, { [key]: v });
  const totalWidth = CHECKBOX_W + widths.reduce((a, b) => a + b, 0);
  const linkSuffix = readOnly ? "?readonly=1" : "";

  const toggleFilterValue = (key) => (v) => {
    setFilters((prev) => {
      const cur = prev[key] ?? distinct[key];
      const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
      if (next.length === distinct[key].length) { const { [key]: _drop, ...rest } = prev; return rest; }
      return { ...prev, [key]: next };
    });
  };
  const setFilterAll = (key) => (vals) => setFilters((prev) => ({ ...prev, [key]: vals }));
  const clearFilter = (key) => () => setFilters((prev) => { const { [key]: _d, ...rest } = prev; return rest; });
  const setSortFor = (key) => (dir) => setSort((s) => (s && s.key === key && s.dir === dir ? null : { key, dir }));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input data-testid={`${prefix}-search`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by STIG ID, requirement, SRG, CCI, IA control…" className="w-full h-9 rounded-lg bg-[var(--surface)] border border-[var(--border-c)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand)] transition-colors duration-150" />
        </div>
        <div className="relative">
          <Layers className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
          <select data-testid={`${prefix}-group-by`} value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="h-9 appearance-none rounded-lg border border-[var(--border-c)] bg-[var(--surface)] pl-8 pr-8 text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[var(--brand)]">
            {GROUP_BY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{`Group: ${o.label}`}</option>)}
          </select>
        </div>
        <FindReplace reqs={reqs} fields={TEXT_FIELDS} applyPatch={(id, patch) => updateReqs([id], patch)} prefix={prefix} onActiveMatch={setActiveMatch} disabled={readOnly} />
        <button data-testid={`${prefix}-add-req`} disabled={readOnly} onClick={() => toast.success("New requirement added")} className={cn("h-9 flex items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors duration-150", readOnly ? "opacity-40 cursor-not-allowed border-[var(--border-c)] text-[var(--text-muted)]" : "border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)]/10")}><Plus className="h-3.5 w-3.5" /> Add Requirement</button>
      </div>

      <p data-testid={`${prefix}-count`} className="text-xs text-[var(--text-muted)] mb-3">
        Showing <span className="font-semibold text-[var(--text-primary)]">{rows.length}</span> of {reqs.length} rules · select one row to edit inline, two or more to bulk-edit · click a column filter to sort/filter · drag edges to resize
      </p>

      {!readOnly && <BulkBar count={selected.length} onFlagDuplicates={() => setDupOpen(true)} onClear={clear} onSave={() => toast.success("Changes saved")} />}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="text-sm" style={{ tableLayout: "fixed", width: totalWidth }}>
            <colgroup>
              <col style={{ width: CHECKBOX_W }} />
              {widths.map((w, i) => <col key={COLS[i].key} style={{ width: w }} />)}
            </colgroup>
            <thead>
              <tr className="bg-[var(--bg-secondary)] text-left text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                <th className="px-3 py-3"><input data-testid={`${prefix}-select-all`} type="checkbox" checked={allChecked} disabled={readOnly} onChange={toggleAll} className={cn("accent-[var(--brand)]", readOnly && "opacity-40 cursor-not-allowed")} /></th>
                {COLS.map((c, i) => (
                  <th key={c.key} className="relative px-3 py-3 font-semibold select-none">
                    <div className="flex items-center gap-1 pr-2">
                      <span className="truncate">{c.label}</span>
                      <ColumnMenu
                        colKey={c.key}
                        values={distinct[c.key]}
                        sortDir={sort && sort.key === c.key ? sort.dir : null}
                        onSort={setSortFor(c.key)}
                        allowed={filters[c.key] ?? null}
                        active={!!filters[c.key]}
                        onToggle={toggleFilterValue(c.key)}
                        onSetAll={setFilterAll(c.key)}
                        onClear={clearFilter(c.key)}
                      />
                    </div>
                    <span data-testid={`${prefix}-resize-${c.key}`} onMouseDown={startResize(i)} className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-[var(--brand)]/60 transition-colors duration-150" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <Fragment key={g.key ?? "all"}>
                  {g.key !== null && (
                    <tr data-testid={`${prefix}-group-${g.key}`} className="bg-[var(--bg-tertiary)]">
                      <td colSpan={COLS.length + 1} className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        <ChevronDown className="inline h-3.5 w-3.5 mr-1.5" />{g.key || "—"} <span className="text-[var(--text-muted)]">· {g.items.length}</span>
                      </td>
                    </tr>
                  )}
                  {g.items.map((r) => {
                    const isSel = selected.includes(r.id);
                    return (
                      <tr key={r.id} data-testid={`${prefix}-row-${r.stigId}`} className={cn("border-t border-[var(--border-subtle)] align-top hover:bg-[var(--surface-hover)] transition-colors duration-150", isSel && "bg-[var(--brand)]/5")}>
                        <td className="px-3 py-3"><input type="checkbox" checked={isSel} disabled={readOnly} onChange={() => toggle(r.id)} className={cn("accent-[var(--brand)]", readOnly && "opacity-40 cursor-not-allowed")} data-testid={`${prefix}-checkbox-${r.stigId}`} /></td>
                        {COLS.map((c) => {
                          const hl = activeMatch && activeMatch.id === r.id && activeMatch.field === c.key;
                          const hlProps = hl ? { ref: activeCellRef, className: "px-3 py-3 ring-2 ring-inset ring-amber-400 bg-amber-400/20" } : { className: "px-3 py-3" };
                          if (c.readonly) {
                            const val = c.key === "cci" ? cciText(r) : r[c.key];
                            const cls = c.wrap ? cn("block text-xs text-[var(--text-secondary)] whitespace-normal break-words", c.mono && "font-mono") : txtCls(c.mono, c.nowrap);
                            return <td key={c.key} className="px-3 py-3"><span className={cls}>{val || "—"}</span></td>;
                          }
                          if (c.key === "srg" && blankStigId) {
                            return (
                              <td key={c.key} className="px-3 py-3">
                                {isSel
                                  ? <TextCell sel value={r.srg} onChange={set("srg")} mono nowrap />
                                  : <span className="flex items-center gap-1.5 whitespace-nowrap"><Link to={`/requirements/${r.stigId}${linkSuffix}`} data-testid={`${prefix}-open-${r.stigId}`} className="font-mono text-xs text-[var(--brand)] font-medium hover:underline">{r.srg}</Link>{hasSenior(r.id) && <SeniorFlag compact />}</span>}
                              </td>
                            );
                          }
                          if (c.key === "stigId") {
                            if (blankStigId) return <td key={c.key} className="px-3 py-3">{isSel ? <input disabled placeholder="Assigned by STIG Writer" className={cn(editCls, "font-mono opacity-70 cursor-not-allowed")} /> : <span className="text-xs text-[var(--text-muted)]">—</span>}</td>;
                            return (
                              <td key={c.key} className="px-3 py-3">
                                {isSel
                                  ? <TextCell sel value={r.stigId} onChange={set("stigId")} mono nowrap />
                                  : <span className="flex items-center gap-1.5 whitespace-nowrap"><Link to={`/requirements/${r.stigId}${linkSuffix}`} data-testid={`${prefix}-open-${r.stigId}`} className="font-mono text-xs text-[var(--brand)] font-medium hover:underline">{r.stigId}</Link>{hasSenior(r.id) && <SeniorFlag compact />}</span>}
                              </td>
                            );
                          }
                          if (c.select) return <td key={c.key} {...hlProps}><SelectCell sel={isSel} value={r[c.key]} options={c.select} onChange={set(c.key)} /></td>;
                          return <td key={c.key} {...hlProps}><TextCell sel={isSel} value={r[c.key]} onChange={set(c.key)} mono={c.mono} nowrap={c.nowrap} /></td>;
                        })}
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <div className="py-16 text-center text-sm text-[var(--text-muted)]">No requirements match your filters.</div>}
      </Card>

      <DuplicateModal open={dupOpen} items={selectedItems} onClose={() => setDupOpen(false)} onApply={(parentId) => flagDuplicates(selected, parentId)} />
    </div>
  );
}

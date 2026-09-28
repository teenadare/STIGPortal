import { useState, useMemo, useEffect, useRef, Fragment } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { GitMerge, Search, Layers, ChevronDown } from "lucide-react";
import { PageHeader, Card } from "@/components/Primitives";
import { GROUP_BY_OPTIONS } from "@/data/repository";
import { testingByReqId, srgDetailByReqId, TEST_STATUSES, defaultTestSteps } from "@/data/repository";
import { useApp } from "@/context/AppContext";
import { useSelection, BulkBar, DuplicateModal } from "@/components/BulkActions";
import { FindReplace, TEXT_FIELDS } from "@/components/FindReplace";
import { ParentSrgFilter } from "@/components/ParentSrgFilter";
import { ColumnMenu } from "@/components/ColumnMenu";
import { SeniorFlag } from "@/components/Badges";
import { cn } from "@/lib/utils";

// Columns that expose an Excel-style sort/filter header menu.
const FILTER_COLS = ["cci", "srg", "stigId", "title", "status", "check", "fix", "severity", "srgReq", "testSteps", "securityFeatureMet", "checkValid", "fixValid", "comments", "satisfies", "satisfiedBy"];

const YN = ({ v }) => (
  <span className={`font-mono text-xs font-semibold ${v === "Y" ? "text-emerald-500" : "text-red-500"}`}>{v}</span>
);
const clamp = "block max-w-[220px] line-clamp-2 text-xs text-[var(--text-secondary)]";

export default function StigTesting() {
  const { reqs, flagDuplicates, testStatusById, updateTestStatus, updateReqs, hasSenior } = useApp();
  const [query, setQuery] = useState("");
  const [groupBy, setGroupBy] = useState("none");
  const { selected, setSelected, toggle, clear } = useSelection();
  const [dupOpen, setDupOpen] = useState(false);
  const [srgSel, setSrgSel] = useState(null);
  const [sort, setSort] = useState(null); // {key, dir}
  const [filters, setFilters] = useState({}); // {key: allowedValues[]}
  const [activeMatch, setActiveMatch] = useState(null); // {id, field} highlighted by Find/Replace
  const activeCellRef = useRef(null);

  useEffect(() => {
    if (activeMatch) activeCellRef.current?.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
  }, [activeMatch]);

  const parentSrgs = ["Application Core", "GPOS"];
  const familyOf = (r) => (reqs.findIndex((x) => x.id === r.id) % 2 === 0 ? "Application Core" : "GPOS");
  const srgSelected = srgSel === null ? parentSrgs : srgSel;
  const onSrgChange = (arr) => setSrgSel(arr.length === parentSrgs.length ? null : arr);

  const enrich = (r) => ({ ...r, t: testingByReqId[r.id] || {}, srgReq: (srgDetailByReqId[r.id] || {}).srgRequirement || "" });
  const colVal = (r, key) => {
    switch (key) {
      case "cci": return r.cci.join(", ");
      case "status": return testStatusById[r.id] || "";
      case "testSteps": return defaultTestSteps(testStatusById[r.id]);
      case "comments": return r.t.comments || "";
      case "securityFeatureMet": return r.t.securityFeatureMet || "";
      case "checkValid": return r.t.checkValid || "";
      case "fixValid": return r.t.fixValid || "";
      default: return String(r[key] ?? "");
    }
  };

  const distinct = useMemo(() => {
    const enriched = reqs.map(enrich);
    const map = {};
    FILTER_COLS.forEach((k) => {
      map[k] = Array.from(new Set(enriched.map((r) => colVal(r, k)))).sort((a, b) => a.localeCompare(b));
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reqs, testStatusById]);

  const rows = useMemo(() => {
    const q = query.toLowerCase();
    let out = reqs
      .filter((r) => {
        const matchesQ = !q || [r.stigId, r.title, r.srg, r.cci.join(" "), r.iaControl].some((v) => v.toLowerCase().includes(q));
        const matchesSrg = srgSel === null || srgSel.includes(familyOf(r));
        return matchesQ && matchesSrg;
      })
      .map(enrich);
    Object.entries(filters).forEach(([k, allowed]) => { out = out.filter((r) => allowed.includes(colVal(r, k))); });
    if (sort) {
      const dir = sort.dir === "desc" ? -1 : 1;
      out = [...out].sort((a, b) => dir * colVal(a, sort.key).localeCompare(colVal(b, sort.key), undefined, { numeric: true }));
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reqs, query, srgSel, filters, sort, testStatusById]);

  const toggleFilterValue = (key) => (v) => setFilters((prev) => {
    const cur = prev[key] ?? distinct[key];
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    if (next.length === distinct[key].length) { const { [key]: _d, ...rest } = prev; return rest; }
    return { ...prev, [key]: next };
  });
  const clearFilter = (key) => () => setFilters((prev) => { const { [key]: _d, ...rest } = prev; return rest; });
  const setSortFor = (key) => (dir) => setSort((s) => (s && s.key === key && s.dir === dir ? null : { key, dir }));
  const menu = (colKey) => (
    <ColumnMenu colKey={colKey} values={distinct[colKey]} sortDir={sort && sort.key === colKey ? sort.dir : null} onSort={setSortFor(colKey)} allowed={filters[colKey] ?? null} active={!!filters[colKey]} onToggle={toggleFilterValue(colKey)} onClear={clearFilter(colKey)} />
  );

  const groups = useMemo(() => {
    if (groupBy === "none") return [{ key: null, items: rows }];
    const map = {};
    rows.forEach((r) => { const k = r[groupBy]; (map[k] = map[k] || []).push(r); });
    return Object.entries(map).map(([key, items]) => ({ key, items }));
  }, [rows, groupBy]);

  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r.id));
  const toggleAll = () => setSelected(allChecked ? [] : rows.map((r) => r.id));
  const selectedItems = reqs.filter((r) => selected.includes(r.id));

  const onStatusChange = (id, value) => {
    if (selected.includes(id) && selected.length > 1) updateTestStatus(selected, value);
    else updateTestStatus([id], value);
  };

  return (
    <div>
      <div data-testid="stigtesting-header" className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">STIG Testing</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Simulation & validation · Tester: Teena Brinkley</p>
        </div>
        <ParentSrgFilter options={parentSrgs} selected={srgSelected} onChange={onSrgChange} testid="testing-parent-srg-filter" />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input data-testid="testing-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by STIG ID, requirement, SRG, CCI, IA control…" className="w-full h-9 rounded-lg bg-[var(--surface)] border border-[var(--border-c)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand)] transition-colors duration-150" />
        </div>
        <div className="relative">
          <Layers className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
          <select data-testid="testing-group-by" value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="h-9 appearance-none rounded-lg border border-[var(--border-c)] bg-[var(--surface)] pl-8 pr-8 text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[var(--brand)]">
            {GROUP_BY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{`Group: ${o.label}`}</option>)}
          </select>
        </div>
        <FindReplace reqs={reqs} fields={TEXT_FIELDS} applyPatch={(id, patch) => updateReqs([id], patch)} prefix="testing" onActiveMatch={setActiveMatch} />
      </div>

      <p data-testid="testing-count" className="text-xs text-[var(--text-muted)] mb-3">Showing <span className="font-semibold text-[var(--text-primary)]">{rows.length}</span> of {reqs.length} rules · click a column filter to sort/filter</p>

      <BulkBar count={selected.length} onFlagDuplicates={() => setDupOpen(true)} onClear={clear} onSave={() => toast.success("Changes saved")} />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--bg-secondary)] text-left text-[11px] uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">
                <th className="w-10 px-3 py-3"><input data-testid="testing-select-all" type="checkbox" checked={allChecked} onChange={toggleAll} className="accent-[var(--brand)]" /></th>
                <th className="px-3 py-3 font-semibold" style={{ width: 100 }}><div className="flex items-center gap-1 pr-1"><span>CCI</span>{menu("cci")}</div></th>
                <th className="px-3 py-3 font-semibold"><div className="flex items-center gap-1 pr-1"><span>SRG ID</span>{menu("srg")}</div></th>
                <th className="px-3 py-3 font-semibold"><div className="flex items-center gap-1 pr-1"><span>STIG ID</span>{menu("stigId")}</div></th>
                <th className="px-3 py-3 font-semibold min-w-[200px]"><div className="flex items-center gap-1 pr-1"><span>STIG Requirement</span>{menu("title")}</div></th>
                <th className="px-3 py-3 font-semibold min-w-[190px]"><div className="flex items-center gap-1 pr-1"><span>Status</span>{menu("status")}</div></th>
                <th className="px-3 py-3 font-semibold min-w-[200px]"><div className="flex items-center gap-1 pr-1"><span>STIG Check</span>{menu("check")}</div></th>
                <th className="px-3 py-3 font-semibold min-w-[200px]"><div className="flex items-center gap-1 pr-1"><span>STIG Fix</span>{menu("fix")}</div></th>
                <th className="px-3 py-3 font-semibold"><div className="flex items-center gap-1 pr-1"><span>Severity</span>{menu("severity")}</div></th>
                <th className="px-3 py-3 font-semibold min-w-[200px]"><div className="flex items-center gap-1 pr-1"><span>SRG Requirement</span>{menu("srgReq")}</div></th>
                <th className="px-3 py-3 font-semibold min-w-[140px]"><div className="flex items-center gap-1 pr-1"><span>Test Steps</span>{menu("testSteps")}</div></th>
                <th className="px-3 py-3 font-semibold" title="Security Feature Met"><div className="flex items-center gap-1 pr-1"><span>Sec.Met</span>{menu("securityFeatureMet")}</div></th>
                <th className="px-3 py-3 font-semibold" title="Check Procedure Valid"><div className="flex items-center gap-1 pr-1"><span>Chk.Valid</span>{menu("checkValid")}</div></th>
                <th className="px-3 py-3 font-semibold" title="Fix Procedure Valid"><div className="flex items-center gap-1 pr-1"><span>Fix.Valid</span>{menu("fixValid")}</div></th>
                <th className="px-3 py-3 font-semibold min-w-[180px]"><div className="flex items-center gap-1 pr-1"><span>Comments</span>{menu("comments")}</div></th>
                <th className="px-3 py-3 font-semibold"><div className="flex items-center gap-1 pr-1"><span>Satisfies</span>{menu("satisfies")}</div></th>
                <th className="px-3 py-3 font-semibold"><div className="flex items-center gap-1 pr-1"><span>Satisfied By</span>{menu("satisfiedBy")}</div></th>
                <th className="px-3 py-3 font-semibold">Tester</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <Fragment key={g.key ?? "all"}>
                  {g.key !== null && (
                    <tr data-testid={`testing-group-${g.key}`} className="bg-[var(--bg-tertiary)]">
                      <td colSpan={18} className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        <ChevronDown className="inline h-3.5 w-3.5 mr-1.5" />{g.key} <span className="text-[var(--text-muted)]">· {g.items.length}</span>
                      </td>
                    </tr>
                  )}
                  {g.items.map((r) => {
                    const isSel = selected.includes(r.id);
                    const hlProps = (field, base = "px-3 py-3") => {
                      const on = activeMatch && activeMatch.id === r.id && activeMatch.field === field;
                      return on ? { ref: activeCellRef, className: base + " ring-2 ring-inset ring-amber-400 bg-amber-400/20" } : { className: base };
                    };
                    return (
                      <tr key={r.id} data-testid={`testing-row-${r.stigId}`} className={cn("border-t border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] transition-colors duration-150 align-top", isSel && "bg-[var(--brand)]/5")}>
                        <td className="px-3 py-3"><input type="checkbox" checked={isSel} onChange={() => toggle(r.id)} className="accent-[var(--brand)]" data-testid={`testing-checkbox-${r.stigId}`} /></td>
                        <td className="px-3 py-3 font-mono text-[11px] text-[var(--text-secondary)] whitespace-normal break-words" style={{ maxWidth: 100 }}>{r.cci.join(", ")}</td>
                        <td className="px-3 py-3 font-mono text-[11px] text-[var(--text-secondary)] whitespace-nowrap">{r.srg}</td>
                        <td className="px-3 py-3 font-mono text-xs text-[var(--brand)] font-medium whitespace-nowrap"><span className="flex items-center gap-1.5"><Link to={`/testing/${r.stigId}`} data-testid={`testing-open-${r.stigId}`} className="hover:underline">{r.stigId}</Link>{hasSenior(r.id) && <SeniorFlag compact />}</span></td>
                        <td {...hlProps("title")}><span className={clamp + " text-[var(--text-primary)]"}>{r.title}</span></td>
                        <td className="px-3 py-3">
                          <select value={testStatusById[r.id]} onChange={(e) => onStatusChange(r.id, e.target.value)} data-testid={`test-status-${r.stigId}`} className={cn("w-full rounded-md border bg-[var(--bg-primary)] px-2 py-1 text-xs text-[var(--text-primary)]", isSel ? "border-[var(--brand)]/50" : "border-[var(--border-c)]")}>
                            {TEST_STATUSES.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                        <td {...hlProps("check")}><span className={clamp + " font-mono"}>{r.check}</span></td>
                        <td {...hlProps("fix")}><span className={clamp + " font-mono"}>{r.fix}</span></td>
                        <td className="px-3 py-3"><span className="text-xs text-[var(--text-primary)] whitespace-nowrap">{r.severity}</span></td>
                        <td className="px-3 py-3"><span className={clamp}>{r.srgReq}</span></td>
                        <td className="px-3 py-3 text-xs text-[var(--text-secondary)]">{defaultTestSteps(testStatusById[r.id])}</td>
                        <td className="px-3 py-3 text-center"><YN v={r.t.securityFeatureMet} /></td>
                        <td className="px-3 py-3 text-center"><YN v={r.t.checkValid} /></td>
                        <td className="px-3 py-3 text-center"><YN v={r.t.fixValid} /></td>
                        <td {...hlProps("comments")}><span className={clamp}>{r.t.comments}</span></td>
                        <td {...hlProps("satisfies", "px-3 py-3 font-mono text-[11px] text-emerald-500 whitespace-nowrap")}>{r.satisfies || "—"}</td>
                        <td {...hlProps("satisfiedBy", "px-3 py-3 font-mono text-[11px] text-violet-500 whitespace-nowrap")}>{r.satisfiedBy || "—"}</td>
                        <td className="px-3 py-3 text-xs text-[var(--text-secondary)] whitespace-nowrap">Teena Brinkley</td>
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
      <p className="text-xs text-[var(--text-muted)] mt-3">Test Steps default to "Standard Test Steps" for Applicable - Configurable and "Verify Status" for all other statuses. Click a STIG ID to open the testing form.</p>

      <DuplicateModal open={dupOpen} items={selectedItems} onClose={() => setDupOpen(false)} onApply={(parentId) => flagDuplicates(selected, parentId)} />
    </div>
  );
}

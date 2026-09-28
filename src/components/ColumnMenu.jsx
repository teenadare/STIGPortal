import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Filter as FilterIcon, ArrowDownAZ, ArrowUpAZ, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Excel-style header menu: sort + searchable value checklist. Rendered in a portal to avoid clipping.
export function ColumnMenu({ colKey, values, sortDir, onSort, allowed, onToggle, onClear, active }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (!menuRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, [open]);

  const openMenu = (e) => {
    e.stopPropagation();
    const r = btnRef.current.getBoundingClientRect();
    setPos({ x: Math.min(r.left, window.innerWidth - 260), y: r.bottom + 4 });
    setOpen(true);
  };

  const shown = values.filter((v) => v.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <button ref={btnRef} data-testid={`col-menu-${colKey}`} onClick={openMenu} className={cn("p-0.5 rounded hover:bg-[var(--surface-hover)]", (active || sortDir) && "text-[var(--brand)]")}>
        <FilterIcon className="h-3 w-3" />
      </button>
      {open && createPortal(
        <div ref={menuRef} style={{ position: "fixed", left: pos.x, top: pos.y, zIndex: 60, width: 240 }} className="rounded-lg border border-[var(--border-c)] bg-[var(--surface)] shadow-xl p-2 text-[var(--text-primary)]">
          <div className="flex gap-1 mb-2">
            <button data-testid={`col-sort-asc-${colKey}`} onClick={() => { onSort("asc"); setOpen(false); }} className={cn("flex-1 flex items-center justify-center gap-1 rounded-md border border-[var(--border-c)] px-2 py-1.5 text-xs hover:border-[var(--brand)]", sortDir === "asc" && "border-[var(--brand)] text-[var(--brand)]")}><ArrowDownAZ className="h-3.5 w-3.5" /> A → Z</button>
            <button data-testid={`col-sort-desc-${colKey}`} onClick={() => { onSort("desc"); setOpen(false); }} className={cn("flex-1 flex items-center justify-center gap-1 rounded-md border border-[var(--border-c)] px-2 py-1.5 text-xs hover:border-[var(--brand)]", sortDir === "desc" && "border-[var(--brand)] text-[var(--brand)]")}><ArrowUpAZ className="h-3.5 w-3.5" /> Z → A</button>
          </div>
          <div className="relative mb-1.5">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
            <input data-testid={`col-search-${colKey}`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search values…" className="w-full h-8 rounded-md border border-[var(--border-c)] bg-[var(--bg-primary)] pl-7 pr-2 text-xs focus:outline-none focus:border-[var(--brand)]" />
          </div>
          <label className="flex items-center gap-2 px-1 py-1 text-xs font-medium cursor-pointer">
            <input type="checkbox" checked={allowed === null} onChange={() => onClear()} className="accent-[var(--brand)]" /> (Select all)
          </label>
          <div className="max-h-48 overflow-y-auto">
            {shown.map((v) => (
              <label key={v} className="flex items-center gap-2 px-1 py-1 text-xs cursor-pointer hover:bg-[var(--surface-hover)] rounded">
                <input type="checkbox" checked={allowed === null || allowed.includes(v)} onChange={() => onToggle(v)} className="accent-[var(--brand)]" />
                <span className="truncate">{v || "(blank)"}</span>
              </label>
            ))}
            {shown.length === 0 && <p className="px-1 py-2 text-[11px] text-[var(--text-muted)]">No values</p>}
          </div>
          {active && <button onClick={() => onClear()} className="mt-1.5 w-full flex items-center justify-center gap-1 rounded-md border border-[var(--border-c)] px-2 py-1 text-[11px] hover:border-[var(--brand)]"><X className="h-3 w-3" /> Clear filter</button>}
        </div>,
        document.body
      )}
    </>
  );
}

import { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Search as SearchIcon, ChevronRight, Replace as ReplaceIcon, X } from "lucide-react";

// Text fields that Find & Replace operates on across requirement records.
export const TEXT_FIELDS = ["title", "discussion", "check", "fix", "statusJustification", "mitigation", "artifactDescription", "comments", "satisfies", "satisfiedBy"];

const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function FindReplace({ reqs, fields = TEXT_FIELDS, applyPatch, prefix = "grid", onActiveMatch, disabled }) {
  const [open, setOpen] = useState(false);
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [idx, setIdx] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  const matches = useMemo(() => {
    if (!find) return [];
    const q = find.toLowerCase();
    const list = [];
    reqs.forEach((r) => fields.forEach((f) => {
      const v = r[f];
      if (typeof v === "string" && v.toLowerCase().includes(q)) list.push({ id: r.id, field: f });
    }));
    return list;
  }, [reqs, find, fields]);

  // Highlight the active match in the grid (Excel-style) while the panel is open.
  useEffect(() => {
    if (!onActiveMatch) return;
    onActiveMatch(open && matches.length ? matches[idx % matches.length] : null);
  }, [open, matches, idx, onActiveMatch]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    const onDown = (e) => {
      if (!panelRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("mousedown", onDown); };
  }, [open]);

  const openPanel = () => {
    const r = btnRef.current.getBoundingClientRect();
    const w = 320;
    setPos({ x: Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8)), y: r.bottom + 6 });
    setOpen(true);
  };

  const findNext = () => { if (matches.length) setIdx((i) => (i + 1) % matches.length); };

  const replaceOne = () => {
    if (!matches.length) { toast.info("No matches found"); return; }
    const m = matches[idx % matches.length];
    const r = reqs.find((x) => x.id === m.id);
    const cur = r[m.field] || "";
    const re = new RegExp(escapeRx(find), "i");
    applyPatch(m.id, { [m.field]: cur.replace(re, replace) });
    toast.success("Replaced 1 match");
  };

  const replaceAll = () => {
    if (!matches.length) { toast.info("No matches found"); return; }
    const byId = {};
    matches.forEach((m) => {
      const r = reqs.find((x) => x.id === m.id);
      byId[m.id] = byId[m.id] || {};
      const base = byId[m.id][m.field] !== undefined ? byId[m.id][m.field] : (r[m.field] || "");
      byId[m.id][m.field] = base.replace(new RegExp(escapeRx(find), "gi"), replace);
    });
    Object.entries(byId).forEach(([id, patch]) => applyPatch(id, patch));
    toast.success(`Replaced across ${matches.length} field(s)`);
  };

  const fieldCls = "h-9 w-full rounded-lg border border-[var(--border-c)] bg-[var(--bg-primary)] pl-8 pr-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand)] transition-colors duration-150";

  return (
    <>
      <button
        ref={btnRef}
        data-testid={`${prefix}-find-replace-open`}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openPanel())}
        className={cnBtn(open, disabled)}
      >
        <SearchIcon className="h-3.5 w-3.5" /> Find / Replace
      </button>

      {open && !disabled && createPortal(
        <div
          ref={panelRef}
          data-testid={`${prefix}-find-replace`}
          style={{ position: "fixed", left: pos.x, top: pos.y, zIndex: 60, width: 320 }}
          className="rounded-xl border border-[var(--border-c)] bg-[var(--surface)] shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-3.5 py-2.5">
            <div className="flex items-center gap-1.5">
              <ReplaceIcon className="h-3.5 w-3.5 text-[var(--brand)]" />
              <span className="text-xs font-semibold text-[var(--text-primary)]">Find &amp; Replace</span>
            </div>
            <button data-testid={`${prefix}-find-replace-close`} onClick={() => setOpen(false)} className="p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors duration-150"><X className="h-3.5 w-3.5" /></button>
          </div>

          <div className="space-y-2.5 px-3.5 py-3">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input autoFocus data-testid={`${prefix}-find-input`} value={find} onChange={(e) => { setFind(e.target.value); setIdx(0); }} placeholder="Find" className={fieldCls} />
            </div>
            <div className="relative">
              <ReplaceIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input data-testid={`${prefix}-replace-input`} value={replace} onChange={(e) => setReplace(e.target.value)} placeholder="Replace with" className={fieldCls} />
            </div>
            <div className="flex items-center justify-between">
              <span data-testid={`${prefix}-match-count`} className="text-[11px] text-[var(--text-muted)] tabular-nums">
                {matches.length ? `${(idx % matches.length) + 1} of ${matches.length}` : "No matches"}
              </span>
              <button data-testid={`${prefix}-find-next-btn`} onClick={findNext} className="flex items-center gap-0.5 text-[11px] font-medium text-[var(--brand)] hover:underline">Find next <ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] px-3.5 py-2.5">
            <button data-testid={`${prefix}-replace-one-btn`} onClick={replaceOne} className="h-8 rounded-lg border border-[var(--border-c)] bg-[var(--surface)] px-3 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand)] transition-colors duration-150">Replace</button>
            <button data-testid={`${prefix}-replace-all-btn`} onClick={replaceAll} className="h-8 rounded-lg bg-[var(--brand)] px-3 text-xs font-semibold text-white hover:bg-[var(--brand-hover)] transition-colors duration-150">Replace All</button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function cnBtn(open, disabled) {
  if (disabled) {
    return "h-9 flex items-center gap-1.5 rounded-lg border border-[var(--border-c)] bg-[var(--surface)] px-3 text-xs font-medium text-[var(--text-muted)] opacity-40 cursor-not-allowed";
  }
  return [
    "h-9 flex items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors duration-150",
    open
      ? "border-[var(--brand)] text-[var(--brand)] bg-[var(--brand)]/10"
      : "border-[var(--border-c)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand)]",
  ].join(" ");
}

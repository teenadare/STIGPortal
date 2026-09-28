import { useState } from "react";
import { Lock, Send, ChevronDown, Check } from "lucide-react";
import { Avatar } from "@/components/Badges";
import { StigBadge } from "@/components/stig-comments/StigBadge";
import { cn } from "@/lib/utils";

// Highlights @mentions inside a note body.
const renderText = (t) =>
  t.split(/(@\w+)/g).map((part, i) => (part.startsWith("@")
    ? <span key={i} className="font-semibold text-indigo-600 dark:text-indigo-300">{part}</span>
    : <span key={i}>{part}</span>));

// Internal-only STIG-level notes (NOT customer facing). Distinct indigo theme.
export function StigComments({ comments = [], onPost, canPost = true, prefix = "stig-comments", collapsible = false, defaultOpen = true, mentionable = [], unread = 0, onOpen, onResolve }) {
  const [open, setOpen] = useState(defaultOpen);
  const [val, setVal] = useState("");

  const toggle = () => { const n = !open; setOpen(n); if (n) onOpen?.(); };
  const addMention = (name) => setVal((v) => `${v}${v && !v.endsWith(" ") ? " " : ""}@${name.split(" ")[0]} `);
  const post = () => {
    if (!val.trim()) return;
    const mentions = mentionable.filter((m) => new RegExp(`@${m.name.split(" ")[0]}\\b`, "i").test(val)).map((m) => m.name);
    onPost(val.trim(), mentions);
    setVal("");
  };

  const header = (
    <div className="flex items-center gap-2 min-w-0">
      <Lock className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-primary)]">STIG Comments</span>
      <span className="rounded border border-indigo-500/40 bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-600 dark:text-indigo-300">Internal</span>
      <span className="text-[11px] text-[var(--text-muted)]">({comments.length})</span>
      {unread > 0 && <StigBadge count={unread} />}
    </div>
  );

  return (
    <div data-testid={prefix} onClick={() => { if (!collapsible) onOpen?.(); }} className="rounded-xl border border-indigo-500/30 bg-indigo-500/[0.04] p-4">
      {collapsible ? (
        <button data-testid={`${prefix}-toggle`} onClick={toggle} className="w-full flex items-center justify-between">
          {header}
          <ChevronDown className={cn("h-4 w-4 text-[var(--text-muted)] transition-transform duration-150", open && "rotate-180")} />
        </button>
      ) : (
        <div className="flex items-center justify-between">{header}</div>
      )}

      {(!collapsible || open) && (
        <>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">Not customer-facing · internal team only</p>
          <div className="mt-3 space-y-3 max-h-72 overflow-y-auto pr-1">
            {comments.length === 0 && <p className="text-xs text-[var(--text-muted)]">No internal notes yet.</p>}
            {comments.map((c, i) => (
              <div key={`${c.time}-${c.author}-${i}`} data-testid={`${prefix}-item-${i}`} className={cn("flex gap-2 rounded-lg", c.resolved && "opacity-60")}>
                <Avatar initials={c.initials} name={c.author} className="h-6 w-6 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">{c.author}</span>
                    <span className="rounded border border-[var(--border-c)] px-1 py-0.5 text-[9px] text-[var(--text-muted)]">{c.role}</span>
                    {c.resolved && <span className="inline-flex items-center gap-1 rounded border border-emerald-500/40 bg-emerald-500/10 px-1 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-300"><Check className="h-2.5 w-2.5" /> Resolved</span>}
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)]">{c.time}</p>
                  <p className={cn("text-xs mt-0.5 leading-relaxed", c.resolved ? "line-through text-[var(--text-muted)]" : "text-[var(--text-secondary)]")}>{renderText(c.text)}</p>
                </div>
                {onResolve && (
                  <button data-testid={`${prefix}-resolve-${i}`} onClick={(e) => { e.stopPropagation(); onResolve(i); }} className={cn("shrink-0 self-start rounded-md border px-1.5 py-0.5 text-[9px] font-semibold transition-colors duration-150", c.resolved ? "border-[var(--border-c)] text-[var(--text-muted)] hover:text-[var(--text-primary)]" : "border-emerald-500/40 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/10")}>
                    {c.resolved ? "Reopen" : "Resolve"}
                  </button>
                )}
              </div>
            ))}
          </div>
          {canPost && (
            <div className="mt-3 pt-3 border-t border-indigo-500/20">
              {mentionable.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 mb-2">
                  <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">Ping:</span>
                  {mentionable.map((m) => (
                    <button key={m.name} data-testid={`${prefix}-mention-${m.initials}`} onClick={() => addMention(m.name)} className="rounded-full border border-indigo-500/30 px-2 py-0.5 text-[10px] text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/10 transition-colors duration-150">@{m.name.split(" ")[0]}</button>
                  ))}
                </div>
              )}
              <textarea data-testid={`${prefix}-input`} value={val} onChange={(e) => setVal(e.target.value)} rows={2} placeholder="Internal note (e.g., good with this, verify the tech spelling) — @mention to ping…" className="w-full rounded-lg bg-[var(--bg-primary)] border border-[var(--border-c)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 resize-none" />
              <button data-testid={`${prefix}-post`} onClick={post} className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors duration-150"><Send className="h-4 w-4" /> Post Internal Note</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

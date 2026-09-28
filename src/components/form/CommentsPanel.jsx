import { MessageSquare, Send } from "lucide-react";
import { Avatar, SeniorFlag } from "@/components/Badges";
import { cn } from "@/lib/utils";

// Shared comments thread + composer used by the record editors.
// `idPrefix` namespaces the testids ("" for requirements, "testing-" for testing).
export function CommentsPanel({ thread, value, onChange, onPost, onKeyDown, idPrefix = "" }) {
  return (
    <div className="rounded-xl border border-[var(--border-c)] bg-[var(--surface)] p-4">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Comments ({thread.length})</h4>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {thread.length === 0 && <p className="text-xs text-[var(--text-muted)]">No comments yet.</p>}
        {thread.map((c, i) => {
          const senior = c.role === "Senior Review";
          return (
            <div key={`${c.time}-${c.author}-${i}`} data-testid={`${idPrefix}comment-${i}`} className={cn("flex gap-2 rounded-lg", senior && "border border-amber-500/50 bg-amber-500/10 p-2")}>
              <Avatar initials={c.initials} name={c.author} className={cn("h-7 w-7 mt-0.5", senior && "bg-amber-500 text-white ring-amber-500")} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">{c.author}</span>
                  {senior
                    ? <SeniorFlag />
                    : <span className="rounded border border-[var(--border-c)] px-1 py-0.5 text-[9px] text-[var(--text-muted)]">{c.role}</span>}
                </div>
                <p className="text-[10px] text-[var(--text-muted)]">{c.time}</p>
                <p className={cn("text-xs mt-0.5 leading-relaxed", senior ? "text-amber-800 dark:text-amber-200 font-medium" : "text-[var(--text-secondary)]")}>{c.text}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
        <textarea data-testid={`${idPrefix}comment-input`} value={value} onChange={onChange} onKeyDown={onKeyDown} rows={5} placeholder="Add comment…" className="w-full rounded-lg bg-[var(--bg-primary)] border border-[var(--border-c)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand)] resize-none" />
        <button data-testid={`${idPrefix}post-comment-btn`} onClick={onPost} className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--brand)] py-2 text-xs font-semibold text-white hover:bg-[var(--brand-hover)] transition-colors duration-150"><Send className="h-4 w-4" /> Add Comment</button>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { editCls, txtCls } from "@/components/draft/cells";

// Inline-editable text cell for the draft grid.
export function TextCell({ sel, value, onChange, mono, nowrap }) {
  if (!sel) return <span className={txtCls(mono, nowrap)}>{value || "\u2014"}</span>;
  return <input value={value || ""} onChange={(e) => onChange(e.target.value)} className={cn(editCls, mono && "font-mono")} />;
}

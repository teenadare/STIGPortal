// Shared cell helpers and column config for the draft grid.
import { cn } from "@/lib/utils";
import { SEVERITIES, STATUSES } from "@/data/repository";

export const editCls =
  "w-full rounded-md border border-[var(--brand)]/50 bg-[var(--bg-primary)] px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)]";

export function txtCls(mono, nowrap) {
  return cn("block text-xs text-[var(--text-secondary)]", nowrap ? "whitespace-nowrap truncate" : "line-clamp-2", mono && "font-mono");
}

export const COLS = [
  { key: "cci", label: "CCI", w: 100, mono: true, readonly: true, wrap: true },
  { key: "iaControl", label: "IA Control", w: 120, mono: true, readonly: true },
  { key: "srg", label: "SRG ID", w: 190, mono: true },
  { key: "stigId", label: "STIG ID", w: 150, mono: true, nowrap: true },
  { key: "severity", label: "Severity", w: 120, select: SEVERITIES },
  { key: "title", label: "Requirement", w: 280 },
  { key: "discussion", label: "Vuln Discussion", w: 240 },
  { key: "status", label: "Status", w: 200, select: STATUSES },
  { key: "check", label: "Check", w: 220, mono: true },
  { key: "fix", label: "Fix", w: 220, mono: true },
  { key: "statusJustification", label: "Status Justification", w: 220 },
  { key: "mitigation", label: "Mitigation", w: 200 },
  { key: "artifactDescription", label: "Artifact Description", w: 220 },
  { key: "comments", label: "Comments", w: 200 },
];

export const CHECKBOX_W = 44;
export const cciText = (r) => (Array.isArray(r.cci) ? r.cci.join(", ") : r.cci || "");
export const getVal = (r, key) => (key === "cci" ? cciText(r) : r[key] ?? "");

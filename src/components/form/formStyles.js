// Shared form input styles used across record editors (RequirementEditor, StigTestingRecord).
export const inputCls =
  "w-full rounded-lg bg-[var(--bg-primary)] border border-[var(--border-c)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand)] transition-colors duration-150";
export const monoInputCls = inputCls + " font-mono text-xs";
export const readCls = monoInputCls + " opacity-90 cursor-default";

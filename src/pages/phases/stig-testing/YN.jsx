// Yes/No test indicator used across the STIG Testing grid.
export const YN = ({ v }) => (
  <span className={`font-mono text-xs font-semibold ${v === "Y" ? "text-emerald-500" : "text-red-500"}`}>{v}</span>
);

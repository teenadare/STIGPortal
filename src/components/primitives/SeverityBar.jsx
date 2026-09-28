import { cn } from "@/lib/utils";

// Segmented severity distribution bar
export function SeverityBar({ counts, className }) {
  const total = counts.catI + counts.catII + counts.catIII || 1;
  const seg = (n, color) => (
    <div style={{ width: `${(n / total) * 100}%` }} className={color} />
  );
  return (
    <div className={cn("flex h-2 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]", className)}>
      {seg(counts.catI, "bg-red-500")}
      {seg(counts.catII, "bg-amber-500")}
      {seg(counts.catIII, "bg-emerald-500")}
    </div>
  );
}

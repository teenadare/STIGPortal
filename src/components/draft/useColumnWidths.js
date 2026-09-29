import { useState } from "react";

// Column resize hook for the draft grid.
export function useColumnWidths(cols) {
  const [widths, setWidths] = useState(cols.map((c) => c.w));
  const startResize = (i) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = widths[i];
    const move = (ev) => {
      const next = Math.max(80, startW + (ev.clientX - startX));
      setWidths((prev) => { const n = [...prev]; n[i] = next; return n; });
    };
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };
  return [widths, startResize];
}

import { useState } from "react";

// Shared multi-select state for list views.
export function useSelection() {
  const [selected, setSelected] = useState([]);
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const clear = () => setSelected([]);
  return { selected, setSelected, toggle, clear };
}

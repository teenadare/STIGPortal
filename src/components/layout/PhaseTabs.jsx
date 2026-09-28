import { useNavigate } from "react-router-dom";
import { PHASES } from "@/data/repository";
import { useApp, PHASE_HOME } from "@/context/AppContext";
import { cn } from "@/lib/utils";

// With a project open, a phase tab jumps straight to that phase's screen;
// otherwise it returns to Projects so the user can open one first.
export function PhaseTabs() {
  const navigate = useNavigate();
  const { allowedPhases, currentPhaseId, setCurrentPhaseId, setOpenProjectId, openProject } = useApp();
  const phases = PHASES.filter((p) => allowedPhases.includes(p.id));

  const pick = (id) => {
    setCurrentPhaseId(id);
    // Delivery has its own project picker, so it opens directly even with no project open.
    if (openProject || id === "delivery") navigate(PHASE_HOME[id] || "/");
    else { setOpenProjectId(null); navigate("/"); }
  };

  return (
    <div data-testid="phase-tabs" className="bg-[var(--bg-secondary)] border-b border-[var(--border-c)] sticky top-14 z-30 px-2 overflow-x-auto">
      <div className="flex items-center gap-1 min-w-max">
        {phases.map((p) => (
          <button
            key={p.id}
            data-testid={`phase-tab-${p.id}`}
            onClick={() => pick(p.id)}
            className={cn(
              "relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-150 border-b-2",
              currentPhaseId === p.id
                ? "border-[var(--brand)] text-[var(--brand)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

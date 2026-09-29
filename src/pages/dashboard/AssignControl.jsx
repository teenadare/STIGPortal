import { useState, useRef, useEffect } from "react";
import { UserPlus, Check } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/Badges";
import { teamMembers } from "@/data/repository";

// Popover control (Gov SME / PMRC) for assigning a STIG Writer lead to a project.
export function AssignControl({ project, onAssign }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        data-testid={`assign-btn-${project.id}`}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md border border-[var(--border-c)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--text-primary)] transition-colors duration-150"
      >
        <UserPlus className="h-3.5 w-3.5" /> Assign
      </button>
      {open && (
        <div data-testid={`assign-menu-${project.id}`} className="absolute right-0 bottom-full mb-1 w-56 rounded-lg border border-[var(--border-c)] bg-[var(--bg-secondary)] shadow-xl z-50 p-1 animate-fade-up">
          <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Assign STIG Writer</p>
          {teamMembers.map((m) => (
            <button
              key={m.name}
              data-testid={`assign-option-${project.id}-${m.initials}`}
              onClick={() => { onAssign(project.id, m.name); setOpen(false); toast.success(`${m.name} assigned to ${project.name}`); }}
              className="w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-left hover:bg-[var(--surface-hover)] transition-colors duration-150"
            >
              <Avatar initials={m.initials} name={m.name} className="h-6 w-6 text-[10px]" />
              <span className="text-sm text-[var(--text-primary)] flex-1">{m.name}</span>
              {project.lead === m.name && <Check className="h-4 w-4 text-[var(--brand)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

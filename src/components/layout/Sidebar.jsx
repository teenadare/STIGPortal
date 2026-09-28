import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, ListChecks, Network, Library, ScanSearch,
  CheckSquare, History, FolderOpen, Download, FilePlus, Layers,
  FlaskConical, Copy, Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { NEW_STIG_ROLES, MANAGE_SRG_ROLES } from "@/data/repository";

// Phase-specific label for the read-only archive shortcut in the top nav.
const ARCHIVE_LABELS = {
  "stig-draft": "Archived Drafts",
  "stig-testing": "Archived Testing",
  "tech-edits": "Archived Projects",
};

export function Sidebar() {
  const { openProject, setOpenProjectId, roleId, currentPhaseId } = useApp();
  const canNewStig = NEW_STIG_ROLES.includes(roleId);
  const canManageSrg = MANAGE_SRG_ROLES.includes(roleId);
  const isVendor = roleId === "vendor";
  const hideTestingTools = isVendor || currentPhaseId === "vendor-draft";

  const projectTools = [
    { to: "/requirements", label: "Requirements", icon: ListChecks, testid: "nav-requirements-grid" },
    { to: "/srg", label: "SRG Hierarchy", icon: Network, testid: "nav-srg-mapping" },
    !isVendor && { to: "/cci", label: "CCI Library", icon: Library, testid: "nav-cci-library" },
    !isVendor && { to: "/cci-check", label: "CCI Mapping Check", icon: ScanSearch, testid: "nav-cci-check" },
    { to: "/review", label: "Review Queue", icon: CheckSquare, testid: "nav-review-queue" },
    { to: "/audit", label: "Audit & History", icon: History, testid: "nav-audit-log" },
    !hideTestingTools && { to: "/testing/inspec", label: "InSpec Validation", icon: FlaskConical, testid: "nav-inspec-validation" },
    !hideTestingTools && { to: "/testing/duplicate-scan", label: "Duplicate Scan", icon: Copy, testid: "nav-duplicate-scan" },
    { to: "/export", label: "Import/Export", icon: Download, testid: "nav-export" },
  ].filter(Boolean);

  const link = ({ isActive }) =>
    cn(
      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
      isActive ? "bg-[var(--brand)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
    );

  return (
    <aside
      data-testid="app-sidebar"
      className="w-60 min-w-[15rem] bg-[var(--bg-secondary)] border-r border-[var(--border-c)] h-[calc(100vh-6.5rem)] sticky top-[6.5rem] hidden md:flex flex-col py-5 px-3 overflow-y-auto"
    >
      <nav className="space-y-1">
        <NavLink to="/" end data-testid="nav-projects" onClick={() => setOpenProjectId(null)} className={link}>
          <LayoutDashboard className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
          Projects
        </NavLink>
        {ARCHIVE_LABELS[currentPhaseId] && (
          <NavLink to="/archived" data-testid="nav-archived" className={link}>
            <Archive className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
            {ARCHIVE_LABELS[currentPhaseId]}
          </NavLink>
        )}
        {canNewStig && (
          <NavLink to="/phase/gov-sme" data-testid="nav-new-stig" className={link}>
            <FilePlus className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
            New STIG
          </NavLink>
        )}
        {canManageSrg && (
          <NavLink to="/srg-library" data-testid="nav-srg-library" className={link}>
            <Layers className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
            Manage SRGs
          </NavLink>
        )}
      </nav>

      {openProject && (
        <>
          <div className="mt-5 mb-3 px-3 py-2.5 rounded-lg bg-[var(--brand)]/5 border border-[var(--brand)]/20">
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-0.5 flex items-center gap-1"><FolderOpen className="h-3 w-3" /> Open Project</p>
            <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">{openProject.name}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">{openProject.version}</p>
          </div>
          <nav className="space-y-1">
            {projectTools.map((item) => (
              <NavLink key={item.to} to={item.to} data-testid={item.testid} className={link}>
                <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </>
      )}
    </aside>
  );
}

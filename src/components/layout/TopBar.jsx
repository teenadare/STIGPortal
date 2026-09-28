import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Sun, Moon, ChevronDown, Users } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useApp } from "@/context/AppContext";
import { ROLES } from "@/data/repository";
import { Avatar } from "@/components/Badges";

export function TopBar() {
  const { theme, toggle } = useTheme();
  const { role, roleId, setRoleId } = useApp();
  const [roleOpen, setRoleOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && setRoleOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <>
      <div
        data-testid="classification-banner"
        className="h-6 w-full bg-emerald-700 text-white flex items-center justify-center text-[11px] font-semibold tracking-[0.2em] uppercase"
      >
        Unclassified // CUI
      </div>
      <header className="h-14 bg-[var(--bg-secondary)] border-b border-[var(--border-c)] z-40 px-4 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-4">
          {/* Role switcher (demo) */}
          <div className="relative" ref={ref}>
            <button
              data-testid="role-switcher"
              onClick={() => setRoleOpen((o) => !o)}
              className="flex items-center gap-2 h-9 rounded-lg border border-[var(--border-c)] bg-[var(--surface)] pl-2.5 pr-2 text-sm text-[var(--text-primary)] hover:border-[var(--brand)] transition-colors duration-150"
            >
              <Users className="h-4 w-4 text-[var(--brand)]" />
              <span className="hidden sm:inline">{role.label}</span>
              <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            </button>
            {roleOpen && (
              <div className="absolute left-0 mt-1 w-60 rounded-lg border border-[var(--border-c)] bg-[var(--bg-secondary)] shadow-xl z-50 p-1 animate-fade-up">
                <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Switch role (demo)</p>
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    data-testid={`role-option-${r.id}`}
                    onClick={() => { setRoleId(r.id); setRoleOpen(false); navigate("/"); }}
                    className={`w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-left transition-colors duration-150 ${roleId === r.id ? "bg-[var(--brand)]/10" : "hover:bg-[var(--surface-hover)]"}`}
                  >
                    <Avatar initials={r.initials} name={r.user} className="h-7 w-7" />
                    <div>
                      <p className="text-sm text-[var(--text-primary)]">{r.label}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{r.user}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="leading-none hidden md:block">
            <p className="text-sm font-bold text-[var(--text-primary)] tracking-tight">STIG Development Collaboration Portal</p>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 max-w-sm mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input
              data-testid="global-search-input"
              placeholder="Cross-reference search: STIG IDs, SRGs, CCIs, text…"
              className="w-full h-9 rounded-lg bg-[var(--surface)] border border-[var(--border-c)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand)] transition-colors duration-150"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            data-testid="theme-toggle-btn"
            onClick={toggle}
            className="h-9 w-9 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors duration-150"
          >
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
          <button data-testid="notifications-btn" className="h-9 w-9 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors duration-150 relative">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>
          <div className="flex items-center gap-2 pl-2 ml-1 border-l border-[var(--border-c)]" data-testid="user-menu">
            <Avatar initials={role.initials} name={role.user} className="h-8 w-8 bg-[var(--brand)] text-white ring-0 text-xs" />
            <div className="hidden sm:block leading-none">
              <p className="text-xs font-semibold text-[var(--text-primary)]">{role.user}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{role.label}</p>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

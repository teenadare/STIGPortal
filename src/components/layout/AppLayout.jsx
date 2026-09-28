import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { PhaseTabs } from "./PhaseTabs";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <TopBar />
      <PhaseTabs />
      <div className="flex">
        <Sidebar />
        <main data-testid="main-content" className="flex-1 min-w-0 overflow-y-auto p-5 md:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

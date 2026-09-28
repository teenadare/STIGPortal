import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/Primitives";
import { ccis, stigIdOf } from "@/data/repository";

export default function CCILibrary() {
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const q = query.toLowerCase();
    return ccis.filter(
      (c) => !q || c.id.toLowerCase().includes(q) || c.def.toLowerCase().includes(q) || c.nist.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div>
      <PageHeader
        title="CCI Reference Library"
        subtitle="Control Correlation Identifiers mapped to NIST 800-53 controls and STIG rules"
        testid="cci-header"
      />
      <div className="relative max-w-md mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
        <input
          data-testid="cci-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search CCI, NIST control, or definition…"
          className="w-full h-9 rounded-lg bg-[var(--surface)] border border-[var(--border-c)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand)] transition-colors duration-150"
        />
      </div>

      <p data-testid="cci-count" className="text-xs text-[var(--text-muted)] mb-3">Showing <span className="font-semibold text-[var(--text-primary)]">{rows.length}</span> of {ccis.length} CCIs</p>

      <div className="rounded-xl border border-[var(--border-c)] bg-[var(--surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--bg-secondary)] text-left text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                <th className="px-4 py-3 font-semibold">CCI ID</th>
                <th className="px-4 py-3 font-semibold min-w-[360px]">Definition</th>
                <th className="px-4 py-3 font-semibold">NIST 800-53</th>
                <th className="px-4 py-3 font-semibold">Mapped Rules</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} data-testid={`cci-row-${c.id}`} className="border-t border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] transition-colors duration-150">
                  <td className="px-4 py-3 align-top"><span className="font-mono text-xs text-[var(--brand)] font-medium whitespace-nowrap">{c.id}</span></td>
                  <td className="px-4 py-3 align-top text-[var(--text-secondary)] leading-relaxed max-w-[520px]">{c.def}</td>
                  <td className="px-4 py-3 align-top"><span className="font-mono text-xs rounded-md border border-[var(--border-c)] bg-[var(--bg-primary)] px-2 py-1 text-[var(--text-primary)] whitespace-nowrap">{c.nist}</span></td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      {c.mappedRules.map((rid) => {
                        const sid = stigIdOf(rid);
                        return (
                          <Link key={rid} to={`/requirements/${sid}`} className="font-mono text-[11px] rounded border border-[var(--border-c)] bg-[var(--bg-primary)] px-1.5 py-0.5 text-[var(--brand)] hover:border-[var(--brand)] transition-colors duration-150">{sid}</Link>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Reusable page header
export function PageHeader({ title, subtitle, children, testid }) {
  return (
    <div data-testid={testid} className="flex flex-wrap items-end justify-between gap-4 mb-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{title}</h1>
        {subtitle && <p className="text-sm text-[var(--text-secondary)] mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

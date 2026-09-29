# STIG Development Collaboration Portal — PRD & Architecture

## What it is
Internal, high-fidelity tool for a team that authors DISA **STIGs** (Security Technical
Implementation Guides) derived from parent **SRGs** (Security Requirements Guides). Multiple
roles collaborate to move a STIG project through a multi-phase workflow:
**Vendor Draft → STIG Draft → STIG Testing → Tech Edits → PMRC review → Delivery**.
The UI is conditionally rendered per role.

This was ported from a Vite + react-router SPA (github.com/teenadare/ToolDemo) to the platform's
Next.js 15 template. It is a **frontend-only, in-memory mock** (no backend / DB yet).

## Runtime architecture (important)
- **Next.js App Router** hosts the app, but the UI itself is a **client-side react-router SPA**.
- The SPA is mounted on a single Next.js catch-all route: `app/[[...slug]]/page.js`
  (a `'use client'` mounted-guard that renders `@/App` **client-only**, so react-router's
  `BrowserRouter` never runs during SSR).
- Why this shape: Next 15's App Router client navigation (Link / router.push / RSC streaming)
  is unreliable behind this environment's dev proxy. react-router navigates via the History API
  (no server round-trip) and **preserves in-memory workflow state across route changes**.
- React was upgraded to **19.2.0** (Next 15 App Router requires React 19).

## Module map (add features here — no core rewrite needed)
```
app/
  layout.js                 # <html class="light"> + globals.css (root shell only)
  [[...slug]]/page.js       # mounts the SPA (client-only)
  api/[[...path]]/route.js  # template API (unused; ready for a real backend)
  globals.css               # Tactical Slate palette + shadcn tokens (Tailwind v3)

src/                        # @/* alias -> ./src/*  (all app logic lives here)
  App.jsx                   # Providers (QueryClient, Theme, App) + <BrowserRouter> route table
  pages/                    # one screen per route (Dashboard, Requirements, RequirementEditor,
                            #   SRGMapping, CCILibrary, ReviewQueue, AuditLog, ExportPage, ...)
    phases/                 # phase screens (GovSME, VendorDraft, StigDraft, StigTesting,
                            #   TechEdits, Delivery)
  components/               # shared UI (layout/, form/, primitives/, badges, tables, menus)
    ui/                     # shadcn/ui primitives
    layout/                 # AppLayout (chrome) + TopBar + PhaseTabs + Sidebar
  context/AppContext.jsx    # global state: role, open project, requirements, comments,
                            #   PHASE_ACCESS / PHASE_HOME (role→phase→home-route rules)
  data/                     # repository.js + mockData.js + workflowData.js (single swap point:
                            #   replace these with API calls to add a backend)
  lib/                      # theme.js (.light/.dark), utils.js (cn), queryClient.js
  hooks/                    # use-toast, etc.
```

## How to add features
- **New screen/route**: add `src/pages/Foo.jsx`, then one `<Route path="/foo" element={<Foo/>}/>`
  in `src/App.jsx`. Add a `NavItem`/tab in `components/layout/Sidebar.jsx` or `PhaseTabs.jsx`.
- **New role / phase rules**: edit `PHASE_ACCESS` / `PHASE_HOME` and role list in
  `context/AppContext.jsx` (+ `data/repository.js`).
- **Real backend**: implement endpoints in `app/api/[[...path]]/route.js` (MongoDB via
  `process.env.MONGO_URL`) and swap the mock reads/writes in `src/data/` to `fetch('/api/...')`.

## Status
- All screens render; role switcher, phase tabs, sidebar, light/dark theme, project cards,
  requirements grid, and the requirement editor (incl. deep-link `/requirements/:stigId`) verified.
- Client-side navigation + in-memory state persistence working.

## DB deliverables hand-off package (docs/)
Single source of truth: `src/server/normalizedSeed.js`. Generators (no DB, no deps):
`scripts/export_sql.mjs` (→ `seed.sql`, `seed_data/*.csv`, auto-updates DELIVERABLES row counts)
and `scripts/gen_data_dictionary.mjs` (→ `DATA_DICTIONARY.md`, `data_dictionary.csv`, `comments.sql`).
- `docs/schema.sql` — DDL, now **idempotent** (`IF NOT EXISTS` / `OR REPLACE` / `DROP POLICY IF EXISTS`).
- `docs/seed.sql` + `docs/seed_data/*.csv` — static, reviewable seed (incl. `requirement_test` +
  CORE→DERIVED SRG lineage; projects seeded with `workflow_status`/`phase`).
- `docs/DATA_DICTIONARY.md` / `.csv` + `docs/comments.sql` — column-level metadata.
- `docs/DELIVERABLES.md` — manifest (audience per artifact, 2-command build, synthetic-data note).
- `src/server/pgStore.js` — applies DDL only when schema absent (`to_regclass`), so live Postgres
  survives app restarts.


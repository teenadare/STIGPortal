# STIG Portal — Database Hand-off Package

**Start here.** This folder is a self-contained database hand-off package. Every file is
plain-text and can be reviewed or used **without running the app or Node**.

> **Status:** Nothing is wired to a live database yet — the app currently runs on a
> **static, in-memory mock**. These files are the ready-to-use schema, seed data, and
> docs for when a PostgreSQL instance is provisioned (`DATABASE_URL`).
>
> **Data classification:** all sample data is **synthetic** — no real CUI, classified,
> or production content.

## Where to go first

| If you are… | Read / use |
|---|---|
| New to the schema | **`SCHEMA_GUIDE.md`** — plain-language tour of every table (with ER diagram) |
| Looking up a column | **`DATA_DICTIONARY.md`** (or `data_dictionary.csv`) |
| A DBA building the DB | **`schema.sql`** → **`seed.sql`** → `comments.sql` |
| Reviewing data without SQL | **`seed_data/*.csv`** (open in Excel/Sheets) |
| Mapping UI ↔ DB | `DATA_MODEL.md` |
| Wanting the diagram source | `ER_DIAGRAM.md` (Mermaid) |
| Maintaining these files | See “Regenerating” below |

## Build a fully-seeded database (2–3 commands)

```bash
psql "$DATABASE_URL" -f docs/schema.sql     # 1. structure (idempotent, safe to re-run)
psql "$DATABASE_URL" -f docs/seed.sql       # 2. sample data (88 rows)
psql "$DATABASE_URL" -f docs/comments.sql   # 3. (optional) column comments into the DB
```

Recipients need only PostgreSQL + `psql`. No app, no Node.

## File index

**Documentation**
- `README.md` — this landing page.
- `DELIVERABLES.md` — the manifest: what each artifact is, which team it's for.
- `SCHEMA_GUIDE.md` — table-by-table purpose, contents, relationships (+ embedded ER diagram).
- `DATA_DICTIONARY.md` / `data_dictionary.csv` — column-level reference.
- `DATA_MODEL.md` — UI mock ↔ normalized table mapping / gap analysis.
- `ER_DIAGRAM.md` — canonical Mermaid ER diagram.

**Runnable SQL**
- `schema.sql` — DDL (tables, keys, indexes, `v_project_rollup` view, RLS). Build first.
- `seed.sql` — static sample-data INSERTs (deterministic IDs). Run after schema.
- `comments.sql` — `COMMENT ON` statements (descriptions into PostgreSQL).

**CSV (non-SQL review)** — `seed_data/` : one CSV per table (13 files).

**Generator scripts** (repo root `scripts/`, maintainers only; plain Node ESM, no deps)
- `export_sql.mjs` — regenerates `seed.sql`, `seed_data/*.csv`, and the row counts in `DELIVERABLES.md`.
- `gen_data_dictionary.mjs` — regenerates `DATA_DICTIONARY.md`, `data_dictionary.csv`, `comments.sql`.
- `seed_postgres.mjs` — one-step: apply schema + insert data straight into a DB.

## Single source of truth & regenerating

All generated artifacts derive from **`src/server/normalizedSeed.js`** (+ `src/data/*`),
so structure and data never drift. Do **not** hand-edit generated files; instead:

```bash
node scripts/export_sql.mjs           # seed.sql + CSVs + DELIVERABLES row counts
node scripts/gen_data_dictionary.mjs  # DATA_DICTIONARY.md + data_dictionary.csv + comments.sql
```

## Tech context

PostgreSQL target via the `pg` driver. The app (Next.js 15 + React 19, JavaScript/JSX)
uses a pluggable store: **in-memory mock by default**, switching to PostgreSQL
(`src/server/pgStore.js`) automatically when `DATABASE_URL` is set.

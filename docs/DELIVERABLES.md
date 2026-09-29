# STIG Portal — Database Deliverables

This folder holds the **database hand-off package**. Each artifact is standalone
and plain-text, so it can be reviewed and used **without running the app or Node**.
Everything is generated from a single source of truth
(`src/server/normalizedSeed.js`), so the structure and the data never drift apart.

## What to hand to which team

| Artifact | For | What it is | How to use |
|---|---|---|---|
| `schema.sql` | DB / Infra / DBA | DDL only — tables, keys, indexes, views, RLS. Builds the database structure. | `psql "$DATABASE_URL" -f docs/schema.sql` |
| `DATA_DICTIONARY.md` / `data_dictionary.csv` | DB / QA / Analysts | Column-level reference for every table: type, nullable, key (PK/FK/UQ), default, references, allowed values, description. | Read the `.md`; open the `.csv` in Excel. |
| `seed.sql` | DB / QA | Static, readable `INSERT` statements for realistic test data (incl. `requirement_test` + SRG lineage). | Run **after** `schema.sql`: `psql "$DATABASE_URL" -f docs/seed.sql` |
| `seed_data/*.csv` | Analysts / Business reviewers | One CSV per table — open in Excel/Sheets to eyeball the exact values. | Open the file. No SQL needed. |
| `DATA_MODEL.md` | Architects | Maps each UI mock object to the normalized tables (gap analysis). | Read. |
| `ER_DIAGRAM.md` | Architects | Entity-relationship diagram (Mermaid). | Read / render. |

## Build a fresh, fully-seeded database (2 commands)

```bash
psql "$DATABASE_URL" -f docs/schema.sql   # 1. structure
psql "$DATABASE_URL" -f docs/seed.sql     # 2. data
```

The receiving team needs only PostgreSQL + `psql`. No app, no Node.

## Regenerating the data artifacts (maintainers only)

`seed.sql` and the CSVs are **generated** — do not hand-edit them.
Edit the source (`src/server/normalizedSeed.js` / `src/data/*`) then run:

```bash
node scripts/export_sql.mjs             # rewrites docs/seed.sql + docs/seed_data/*.csv
node scripts/gen_data_dictionary.mjs    # rewrites docs/DATA_DICTIONARY.md + docs/data_dictionary.csv
```

UUIDs in the generated files are **deterministic**, so re-running produces stable,
diff-friendly output for code review.

> Alternative (programmatic load straight into a DB, no static file):
> `DATABASE_URL=... node scripts/seed_postgres.mjs` — applies `schema.sql` then
> inserts the same rows with random UUIDs. Use `seed.sql` for a reviewable file;
> use this when you just want a DB populated quickly.

## Seed contents (row counts)

| Table | Rows | Notes |
|---|---|---|
| vendor | 3 | |
| app_user | 8 | |
| product | 5 | |
| srg | 2 | CORE (OS-SRG) + DERIVED (VMM-SRG) — shows SRG lineage |
| srg_requirement | 5 | attached to VMM-SRG, enriched with discussion/check/fix/IA control |
| cci | 9 | shared reference |
| stig_project | 5 | |
| requirement | 8 | each links to its `source_srg_requirement_id` |
| requirement_cci | 9 | requirement ↔ CCI mapping |
| comment | 9 | |
| requirement_field_change | 4 | edit history |
| requirement_test | 11 | QA results: met / not-met / N/A, check-fail, fix-fail, + re-test history |
| audit_event | 10 | |

_Regenerate this table with `node scripts/export_sql.mjs` if the counts change._

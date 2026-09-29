# STIG Portal — Updated Data Model & Schema (developer deliverable)

This reconciles the original **STIG Collaboration Portal Data Model** document with the
built **UI mock-up**. It is meant to hand to the implementation team so they can build the
Central PostgreSQL schema that backs the mock-up.

**Files**
- `docs/schema.sql` — ready-to-run PostgreSQL DDL (14 core tables + 3 mock-up-driven tables + rollup view + RLS).
- `docs/DATA_MODEL.md` — this document (gap analysis, field mapping, workflow, suggestions).
- Live reference implementation of the same shape already runs at `/api/*` (see `BACKEND.md`).

---
## 1. What stayed the same (original design is the foundation)
The original 14-table model is sound and is kept verbatim in intent:
`app_user (USER)`, `user_vendor_access`, `vendor`, `product`, `stig_project`, `srg`,
`srg_requirement`, `requirement`, `requirement_revision`, `cci`, `requirement_cci`,
`comment`, `document`, `audit_event`. Multi-tenant `vendor_id` + RLS, the self-referencing
SRG / SRG-requirement hierarchy, and full-snapshot revisions are all retained.

---
## 2. Gap analysis — what the mock-up adds (and why)
Every item below is traced to a specific screen in the running app. All are marked `[MOCKUP]`
in `schema.sql`.

| # | Change | Where in the UI | Schema impact |
|---|--------|-----------------|---------------|
| 1 | **`requirement.approval_status`** (`APPROVED`/`PENDING_APPROVAL`/`RETURNED`) | Requirements grid badge, editor "Approval Status", dashboard breakdown | New column + CHECK. Distinct from `status` (determination) and `workflow_status`. |
| 2 | **`requirement.assigned_to`** (FK USER) | Assignee avatar column; audit "Assigned requirement" | New FK column. |
| 3 | **`requirement.ia_control`** | "IA Control" column, editor header | New column (denormalized from CCI→NIST for display/grouping). |
| 4 | **`cci.nist_control`** | CCI Library "NIST" column, CCI Mapping Check | New column on shared `cci`. |
| 5 | **`requirement.satisfied_by_requirement_id`** (self-FK) | Duplicate Scan → "Group as Duplicates", "Satisfies / Satisfied By" | New self-referencing FK (parent rule *Satisfies*, child *Satisfied By*). |
| 6 | **`stig_project.phase` + `workflow_status`** aligned to the real pipeline | Phase tabs, project stage buttons, Senior-Review pipeline | Two CHECK-constrained columns (see §4). Original single `workflow_status` was simpler. |
| 7 | **`stig_project.assigned_writer`** (FK USER) | Project card "Lead", Gov-SME/PMRC "Assign" | New FK column. |
| 8 | **Government (cross-vendor) roles** `GOV_SME`, `PMRC`, `SENIOR_REVIEWER` | Role switcher; these users work across vendors | `user_vendor_access.access_role` enum extended; `vendor_id` made NULL-able (= global scope) + `app_user.is_global`. **Key reconciliation** — the original model was vendor-tenant-only. |
| 9 | **`requirement_field_change`** (field, old→new) | Requirement editor "Revision History" panel | New lightweight table complementing full `requirement_revision` snapshots. |
| 10 | **`requirement_test`** | STIG Testing phase / InSpec validation grid (Security Feature Met, Check Valid, Fix Valid) | New table (future-facing; deferred in original). |
| 11 | **Derived project rollups** (progress %, CAT I/II/III counts, approval breakdown) | Dashboard cards | `v_project_rollup` **view** — computed, not stored. |
| 12 | **`vendor.vendor_org`, `app_user.initials`** | Card labels / avatars | Cosmetic columns. |

No original tables were removed.

---
## 3. Determination vs. approval vs. workflow (three distinct axes)
The mock-up makes explicit that these are separate — model them separately:
- **`requirement.status`** = engineering determination: `MEETS`, `CONFIGURABLE`,
  `DOES_NOT_MEET`, `INHERENTLY_MEETS`, `NOT_APPLICABLE` (UI shows "Applicable - …").
  (`CONFIGURABLE` added vs. the original four.)
- **`requirement.approval_status`** = review outcome: `APPROVED` / `PENDING_APPROVAL` / `RETURNED`.
- **`stig_project.workflow_status` / `phase`** = where the project sits in the pipeline.

---
## 4. Workflow pipeline (from the mock-up)
Project phases (`stig_project.phase`): `VENDOR_DRAFT → STIG_DRAFT → STIG_TESTING → TECH_EDITS → DELIVERY`.

Stage pipeline (`stig_project.workflow_status`) with the acting role:

| workflow_status | UI label | owner role | advance action |
|---|---|---|---|
| `VENDOR_PROGRESS` | Draft in Progress | Vendor | Ready for STIG Writer |
| `VENDOR_READY` | Ready for STIG Writer | Vendor | Send to STIG Writer |
| `READY_TESTING` | Ready for Testing | STIG Writer | Ready for Testing |
| `READY_TECHEDIT` | Ready for TechEdit | STIG Writer | Ready for TechEdit |
| `READY_PMRC` | Ready for PMRC | STIG Writer | Ready for PMRC |
| `PMRC` | PMRC Review | PMRC | Approve for Delivery |
| `DELIVERED` | Delivered | PMRC | — |

Roles (portal): `vendor` (AUTHOR/REVIEWER/APPROVER within a vendor), `stig-writer`,
`gov-sme`, `pmrc`, `senior-review` (moderator). Government roles are cross-vendor (§2 #8).

---
## 5. Field mapping (mock-up → schema)
**Requirement** (`src/data/mockData.js` → `requirement`)
`id`→internal join key (use `requirement_id`); `stigId`→`stig_id`; `srg`→`srg_id` (+ lineage
via `source_srg_requirement_id`); `iaControl`→`ia_control`; `cci[]`→`requirement_cci`;
`title`→`requirement_text`; `discussion`→`vul_discussion`; `status`→`status`;
`check`→`check_text`; `fix`→`fix_text`; `severity`→`severity`; `mitigation`→`mitigation`;
`artifactDescription`→`artifact_description`; `statusJustification`→`status_justification`;
`notes`→`notes`; `approvalStatus`→`approval_status`; `assignee`→`assigned_to`; `updated`→`updated_at`.

**Project** → `stig_project` (+ `product`, `vendor`): `name`/`product`→`product` + `project_name`;
`version`→`stig_version`; `sourceSrg`→`source_srg_id`; `status`/`stage`→`workflow_status`/`phase`;
`lead`→`assigned_writer`; `progress`/`counts`/`breakdown`→`v_project_rollup` (computed).

**Comment** `{author,role,time,text}` → `comment` (author→`created_by`, role derived from
`user_vendor_access`, time→`created_at`, text→`comment_text`, plus `field_name`).
**Revisions** `{field,from,to,author,time}` → `requirement_field_change`.
**auditLog** `{user,action,target,type,time}` → `audit_event`.
**ccis** `{id,def,nist,mappedRules}` → `cci` (+ `requirement_cci`).
**srgTree** `{id,title,severity,derived[]}` → `srg_requirement` (+ `requirement.source_srg_requirement_id`; `mapped` = a requirement exists).
**testingByReqId** → `requirement_test`; `satisfies`/`satisfiedBy` → `satisfied_by_requirement_id`.

---
## 6. Suggestions to make ingestion easy for the developers
1. **Run the DDL as migration `V1__core.sql`** (Flyway/Liquibase). It is idempotent-friendly and self-contained.
2. **Seed from the mock-up automatically** — the mock data already lives in `src/data/*.js` and
   is exposed at `/api/requirements`, `/api/projects`, `/api/ccis`, `/api/srg-tree`, `/api/audit-log`.
   A short ETL can `GET` those endpoints and `INSERT` into the tables (field map in §5) to get a
   realistic, populated dev database on day one.
3. **The API contract is already written** — `src/services/stigService.js` + `app/api/[[...path]]/route.js`
   define request/response shapes. Point them at Postgres by setting `DATABASE_URL` (see `BACKEND.md`);
   `src/server/pgStore.js` already creates a JSONB-backed schema — treat `docs/schema.sql` as the
   normalized target it migrates toward.
4. **Keep rollups as views** (`v_project_rollup`) so dashboard numbers can never drift from the rows.
5. **Resolve three status axes early** (§3) — the single biggest source of confusion; they are separate columns.
6. **Decide the government-access model up front** (§2 #8). Recommended: `vendor_id NULL = all vendors`
   for `GOV_SME`/`PMRC`/`SENIOR_REVIEWER`, and have the app set `app.vendor_id` to the project's vendor
   on each request so one RLS policy covers both vendor and government users.
7. **Enums**: start with `CHECK` constraints (in the DDL) for speed; promote to PostgreSQL `ENUM`
   types later if desired. Values are listed in §3/§4.
8. **Deliverable diagram**: the original `.docx` Mermaid ER diagram still holds — add the four new
   edges (`requirement → satisfied_by_requirement_id` self, `requirement → requirement_test`,
   `requirement → requirement_field_change`, government `user_vendor_access` with NULL vendor).

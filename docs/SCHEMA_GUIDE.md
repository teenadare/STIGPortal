# STIG Portal — Schema Guide (tables, purpose & relationships)

A plain-language tour of the database in `docs/schema.sql`. For each table it answers
three questions: **why it exists**, **what data it holds**, and **how it connects to the
other tables**. For exact column types/constraints see `docs/DATA_DICTIONARY.md`; for the
visual map see `docs/ER_DIAGRAM.md`.

## Big picture

The database backs a **multi-tenant STIG (Security Technical Implementation Guide)
authoring portal**. Software **vendors** author security **requirements** for their
**products**, guided by government **SRG** source content, and government reviewers
move each **project** through a review **pipeline** to delivery. Everything a vendor
owns carries a `vendor_id` so tenants stay isolated (enforced by Row-Level Security).

The tables fall into six groups:

1. **Identity & tenancy** — who the users are, which vendor they belong to: `app_user`, `vendor`, `user_vendor_access`
2. **Shared reference (government source content)** — the same for all vendors: `srg`, `srg_requirement`, `cci`
3. **Vendor / project structure** — what is being worked on: `product`, `stig_project`
4. **Core content** — the actual STIG rules: `requirement`, `requirement_cci`
5. **History, review & collaboration** — how content evolves and is reviewed: `requirement_revision`, `requirement_field_change`, `comment`, `document`, `requirement_test`, `audit_event`
6. **Derived** — computed, not stored: `v_project_rollup` (view)

A one-line data flow:

```
vendor → product → stig_project → requirement → (cci mappings, tests, comments, revisions, docs)
                         ↑                ↑
                    source SRG      source SRG requirement   (government reference content)
```

---

## 1. Identity & tenancy

### `app_user`
- **Why:** Every action (authoring, commenting, approving, testing) must be attributable to a person, and identities are shared across vendors. This is the single people table.
- **Holds:** One row per person — login identity (`external_subject_id` = the Keycloak/JWT `sub`), `username`, `display_name`, `email`, avatar `initials`, and `is_global` (true for government users who work across all vendors).
- **Interacts:** Referenced by almost everything as the "who" — `user_vendor_access.user_id`, `stig_project.assigned_writer/created_by/updated_by`, `requirement.assigned_to/created_by/reviewed_by/approved_by`, `comment.created_by`, `requirement_test.tested_by`, `audit_event.user_id`, etc.

### `vendor`
- **Why:** The tenant boundary. Each software company using the portal is a vendor; all their data is partitioned by `vendor_id` for isolation and Row-Level Security.
- **Holds:** One row per vendor — `vendor_name`, unique `vendor_code`, and `vendor_org` (a parent-org label, e.g. "Rancher" under SUSE).
- **Interacts:** The parent of `product`, `stig_project`, and every vendor-owned content/history table (they all carry `vendor_id`). Also referenced by `user_vendor_access`.

### `user_vendor_access`
- **Why:** A person's role is **per vendor** — someone can be an AUTHOR for one vendor and have no access to another. Government users need cross-vendor access. This join table expresses that many-to-many relationship with a role.
- **Holds:** One row per (user, vendor, role) grant — `access_role` (`AUTHOR`, `REVIEWER`, `APPROVER`, `READ_ONLY`, `VENDOR_LEAD`, plus government `GOV_SME`, `PMRC`, `SENIOR_REVIEWER`), who granted it, and expiry.
- **Interacts:** Links `app_user` ↔ `vendor`. A **NULL `vendor_id`** means "all vendors" (global/government scope) — the key reconciliation that lets government roles act across tenants under a single RLS policy.

---

## 2. Shared reference (government source content)

This content is **not** vendor-owned — it's the authoritative government material every vendor authors against, so it has no `vendor_id` and no RLS.

### `srg`
- **Why:** Requirements Guides come in a hierarchy — a **Core** SRG (e.g. Operating System) and **Derived** SRGs (e.g. Virtualization/VMM) that inherit from it. Projects declare which SRG they build from.
- **Holds:** One row per SRG — `srg_code`, `srg_name`, `srg_type` (CORE/DERIVED), version/release, and `parent_srg_id` (self-reference: NULL = Core, else the SRG it derives from).
- **Interacts:** Self-referencing tree via `parent_srg_id`; parent of `srg_requirement`; referenced by `stig_project.source_srg_id`.

### `srg_requirement`
- **Why:** The individual source requirements inside an SRG (e.g. `SRG-OS-000023-VMM-000060`). A vendor's STIG requirement is authored **from** one of these, giving traceability ("lineage") back to the government source.
- **Holds:** The SRG requirement `code`, its text, discussion, generic check/fix guidance, severity, and a default IA control. Can itself be hierarchical via `parent_srg_requirement_id`.
- **Interacts:** Belongs to an `srg`; the **source** of vendor `requirement` rows via `requirement.source_srg_requirement_id` (this is the traceability link).

### `cci`
- **Why:** CCIs (Control Correlation Identifiers) are the standard bridge between a requirement and NIST controls. They're shared reference data reused across all requirements and vendors.
- **Holds:** One row per CCI — `cci_number` (e.g. `CCI-000048`), its `definition`, and the mapped `nist_control` (e.g. `AC-8 a`).
- **Interacts:** Linked to requirements many-to-many through `requirement_cci`.

---

## 3. Vendor / project structure

### `product`
- **Why:** A vendor ships multiple products, and each STIG project targets one product. Separating product from project lets a product have several STIG efforts (versions) over time.
- **Holds:** One row per product — `product_name`, description, owning `vendor_id`.
- **Interacts:** Belongs to `vendor`; parent of `stig_project`.

### `stig_project`
- **Why:** The unit of work and the thing that moves through the review pipeline. It ties together the vendor, the product, and the source SRG, and tracks where it sits in the workflow.
- **Holds:** Project `name`, `stig_version`/`stig_release`, and two **distinct pipeline axes**: `phase` (coarse tab: `VENDOR_DRAFT → STIG_DRAFT → STIG_TESTING → TECH_EDITS → DELIVERY`) and `workflow_status` (fine stage: `VENDOR_PROGRESS`, `VENDOR_READY`, `READY_TESTING`, `READY_TECHEDIT`, `READY_PMRC`, `PMRC`, `DELIVERED`). Also the `assigned_writer` (project lead).
- **Interacts:** Belongs to `vendor` + `product`; references its `source_srg_id`; parent of `requirement` (and of `document`). Its progress numbers are computed by `v_project_rollup`.

---

## 4. Core content

### `requirement`
- **Why:** The heart of the system — a single STIG rule being authored for a product. Almost every other table hangs off this.
- **Holds:** The authored content — `stig_id`, `requirement_text` (title), `vul_discussion`, `check_text`, `fix_text`, `severity` (CAT I/II/III), `mitigation`, `artifact_description`, `notes`, plus **three independent state axes**:
  - `status` — engineering **determination** (`MEETS`, `CONFIGURABLE`, `DOES_NOT_MEET`, `INHERENTLY_MEETS`, `NOT_APPLICABLE`)
  - `approval_status` — **review outcome** (`APPROVED`, `PENDING_APPROVAL`, `RETURNED`)
  - the project's `workflow_status`/`phase` — **pipeline** position (lives on `stig_project`)
  It also keeps `current_revision`, `assigned_to`, and the people/timestamps for created/updated/reviewed/approved.
- **Interacts:** Belongs to `vendor` + `stig_project`; traces to `srg_requirement` via `source_srg_requirement_id`; **self-references** `satisfied_by_requirement_id` to group duplicate rules ("Satisfies / Satisfied By"); mapped to CCIs via `requirement_cci`; parent of `requirement_revision`, `requirement_field_change`, `comment`, `document`, and `requirement_test`.

### `requirement_cci`
- **Why:** A requirement can map to several CCIs and a CCI to several requirements — a classic many-to-many that needs its own junction table.
- **Holds:** Just the pairing — `requirement_id` + `cci_id` (composite primary key). No other data.
- **Interacts:** Joins `requirement` ↔ `cci`. Cascades on requirement delete.

---

## 5. History, review & collaboration

There are three *history-ish* tables that are deliberately different — see the comparison at the end.

### `requirement_revision`
- **Why:** Full **version history** for rollback and version-to-version diffing — a complete snapshot of a requirement's content each time a version is committed. Important for provenance in a DoD authoring process.
- **Holds:** A complete copy of the content fields (text, discussion, check/fix, status, severity, justification, notes) tagged with `revision_number` and who/when created it.
- **Interacts:** Child of `requirement` (and carries `vendor_id`); `requirement.current_revision` points at the active version. Unique per `(requirement_id, revision_number)`.

### `requirement_field_change`
- **Why:** A lightweight, human-readable **change log** ("Status changed from X to Y") that powers the editor's Revision History panel — cheaper and more granular than full snapshots.
- **Holds:** One row per field edit — `field_name`, `old_value`, `new_value`, who changed it and when.
- **Interacts:** Child of `requirement` (carries `vendor_id`). Complements `requirement_revision` (deltas vs. full snapshots).

### `comment`
- **Why:** Reviewers and authors discuss a requirement (often a specific field) in a threaded, resolvable conversation.
- **Holds:** `comment_text`, optional `field_name` (what part is under discussion), author, and resolution (`resolved_by`/`resolved_at`).
- **Interacts:** Child of `requirement` (carries `vendor_id`); author/resolver reference `app_user`.

### `document`
- **Why:** Requirements and projects need supporting **evidence/artifacts** (screenshots, exports, scan results). Binary files live in object storage, not the database; this table is the metadata/pointer.
- **Holds:** `title`, `file_name`, `object_key` (storage key), `url`, `document_type`, uploader and time. **The file bytes are NOT stored in Postgres.**
- **Interacts:** Optionally linked to a `stig_project` and/or a `requirement`; carries `vendor_id`; `uploaded_by` references `app_user`.

### `requirement_test`
- **Why:** During the STIG Testing phase, each requirement's check/fix is validated (e.g. via InSpec). This records those test outcomes over time, including re-tests.
- **Holds:** `determination_status` at test time, booleans `security_feature_met` / `check_valid` / `fix_valid`, `inspec_control`, free-text `test_comments`, tester and timestamp.
- **Interacts:** Child of `requirement` (carries `vendor_id`); `tested_by` references `app_user`. Multiple rows per requirement give a test history.

### `audit_event`
- **Why:** A system-wide, tamper-evident **action log** for security/compliance — who did what, when, from where. Distinct from content history.
- **Holds:** `event_type`, `object_type` + `object_id` (a soft/polymorphic pointer to the affected row), `action`, `result`, timestamp, `source_ip`, `request_id`, and a JSONB `details` bag.
- **Interacts:** References `vendor` and the acting `app_user`. `object_id` is intentionally **not** a hard FK so one audit table can reference any object type.

---

## 6. Derived

### `v_project_rollup` (view)
- **Why:** Dashboard numbers (progress %, CAT I/II/III counts, approval breakdown) must always match the underlying rows — so they're **computed on read**, never stored (which would drift).
- **Holds:** Nothing physically — it aggregates `requirement` rows per `stig_project`.
- **Interacts:** Reads `stig_project` + `requirement`; consumed by the projects/dashboard API.

---

## The three "history" tables at a glance

| Table | Granularity | Answers | UI |
|---|---|---|---|
| `requirement_revision` | Whole-record snapshot per version | "What did it look like at revision N?" / roll back | Version restore & full diff |
| `requirement_field_change` | Single-field delta (old→new) | "What changed, field by field?" | Revision History panel |
| `audit_event` | Action/event | "Who did what action, when?" | Audit log screen |

## Multi-tenancy & Row-Level Security (RLS)

Every **vendor-owned** table carries `vendor_id`: `product`, `stig_project`, `requirement`,
`requirement_revision`, `requirement_field_change`, `comment`, `document`,
`requirement_test`, `audit_event`, and the access grants in `user_vendor_access`.
RLS policies key off `vendor_id` so a vendor only sees its own rows, while government
users (a NULL-vendor grant / `is_global`) act across tenants by setting the request's
`app.vendor_id`. The **shared reference** tables (`srg`, `srg_requirement`, `cci`) have
no `vendor_id` and no RLS — they're the same for everyone.

_See `docs/DATA_DICTIONARY.md` for every column and `docs/DATA_MODEL.md` for how these
tables map to the UI mock-up._

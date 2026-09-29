# STIG Portal — Data Dictionary

_Generated from `docs/schema.sql` by `scripts/gen_data_dictionary.mjs`. Do not hand-edit._

Tables: **16** · Columns: **175**

| Legend | |
|---|---|
| PK | Primary key |
| FK | Foreign key (see References) |
| UQ | Unique constraint |

## `app_user`

IDENTITY

| Column | Type | Null | Key | Default | References | Allowed values | Description |
|---|---|---|---|---|---|---|---|
| `user_id` | UUID | NO | PK | `gen_random_uuid()` |  |  |  |
| `external_subject_id` | VARCHAR | YES | UQ |  |  |  | Keycloak JWT 'sub' |
| `username` | VARCHAR | NO |  |  |  |  |  |
| `display_name` | VARCHAR | YES |  |  |  |  |  |
| `email` | VARCHAR | YES |  |  |  |  |  |
| `initials` | VARCHAR(4) | YES |  |  |  |  | [MOCKUP] avatar initials (TB, JV...) |
| `is_global` | BOOLEAN | NO |  | `false` |  |  | [MOCKUP] government user (Gov SME/PMRC/Senior Review) not bound to one vendor |
| `active` | BOOLEAN | NO |  | `true` |  |  |  |
| `created_at` | TIMESTAMPTZ | NO |  | `now()` |  |  |  |
| `updated_at` | TIMESTAMPTZ | NO |  | `now()` |  |  |  |

## `vendor`

| Column | Type | Null | Key | Default | References | Allowed values | Description |
|---|---|---|---|---|---|---|---|
| `vendor_id` | UUID | NO | PK | `gen_random_uuid()` |  |  |  |
| `vendor_name` | VARCHAR | NO |  |  |  |  |  |
| `vendor_code` | VARCHAR | NO | UQ |  |  |  |  |
| `vendor_org` | VARCHAR | YES |  |  |  |  | [MOCKUP] parent org label (e.g. Rancher under SUSE) |
| `description` | TEXT | YES |  |  |  |  |  |
| `active` | BOOLEAN | NO |  | `true` |  |  |  |
| `created_at` | TIMESTAMPTZ | NO |  | `now()` |  |  |  |
| `updated_at` | TIMESTAMPTZ | NO |  | `now()` |  |  |  |

## `user_vendor_access`

access_role: vendor-scoped roles AUTHOR/REVIEWER/APPROVER/READ_ONLY/VENDOR_LEAD. [MOCKUP] government roles GOV_SME/PMRC/SENIOR_REVIEWER are cross-vendor: grant them with vendor_id = NULL to mean "all vendors" (see RLS note §RLS).

| Column | Type | Null | Key | Default | References | Allowed values | Description |
|---|---|---|---|---|---|---|---|
| `user_vendor_access_id` | UUID | NO | PK | `gen_random_uuid()` |  |  |  |
| `user_id` | UUID | NO | FK |  | app_user.user_id |  |  |
| `vendor_id` | UUID | YES | FK |  | vendor.vendor_id |  | NULL = global/government scope [MOCKUP] |
| `access_role` | VARCHAR | NO |  |  |  | AUTHOR, REVIEWER, APPROVER, READ_ONLY, VENDOR_LEAD, GOV_SME, PMRC, SENIOR_REVIEWER |  |
| `granted_by` | UUID | YES | FK |  | app_user.user_id |  |  |
| `granted_at` | TIMESTAMPTZ | NO |  | `now()` |  |  |  |
| `expires_at` | TIMESTAMPTZ | YES |  |  |  |  |  |
| `active` | BOOLEAN | NO |  | `true` |  |  |  |

## `srg`

SRG HIERARCHY (shared reference)

| Column | Type | Null | Key | Default | References | Allowed values | Description |
|---|---|---|---|---|---|---|---|
| `srg_id` | UUID | NO | PK | `gen_random_uuid()` |  |  |  |
| `parent_srg_id` | UUID | YES | FK |  | srg.srg_id |  | NULL = Core SRG; else derived-from |
| `srg_code` | VARCHAR | NO | UQ |  |  |  | e.g. 'Virtualization SRG' |
| `srg_name` | VARCHAR | NO |  |  |  |  |  |
| `srg_type` | VARCHAR | YES |  |  |  |  | CORE \| DERIVED |
| `version` | VARCHAR | YES |  |  |  |  |  |
| `release` | VARCHAR | YES |  |  |  |  |  |
| `description` | TEXT | YES |  |  |  |  |  |
| `active` | BOOLEAN | NO |  | `true` |  |  |  |

## `srg_requirement`

| Column | Type | Null | Key | Default | References | Allowed values | Description |
|---|---|---|---|---|---|---|---|
| `srg_requirement_id` | UUID | NO | PK | `gen_random_uuid()` |  |  |  |
| `srg_id` | UUID | NO | FK |  | srg.srg_id |  |  |
| `parent_srg_requirement_id` | UUID | YES | FK |  | srg_requirement.srg_requirement_id |  |  |
| `srg_requirement_code` | VARCHAR | NO |  |  |  |  | e.g. 'SRG-OS-000023-VMM-000060' |
| `requirement_text` | TEXT | YES |  |  |  |  |  |
| `discussion` | TEXT | YES |  |  |  |  |  |
| `check_text` | TEXT | YES |  |  |  |  |  |
| `fix_text` | TEXT | YES |  |  |  |  |  |
| `severity` | VARCHAR | YES |  |  |  | CAT_I, CAT_II, CAT_III |  |
| `default_ia_control` | VARCHAR | YES |  |  |  |  | [MOCKUP] IA control shown on SRG rows (AC-8...) |
| `source_version` | VARCHAR | YES |  |  |  |  |  |

## `cci`

CCI (shared reference)

| Column | Type | Null | Key | Default | References | Allowed values | Description |
|---|---|---|---|---|---|---|---|
| `cci_id` | UUID | NO | PK | `gen_random_uuid()` |  |  |  |
| `cci_number` | VARCHAR | NO | UQ |  |  |  | 'CCI-000048' |
| `definition` | TEXT | YES |  |  |  |  |  |
| `nist_control` | VARCHAR | YES |  |  |  |  | [MOCKUP] mapped NIST control ('AC-8 a') |
| `status` | VARCHAR | YES |  |  |  |  |  |
| `reference_source` | VARCHAR | YES |  |  |  |  |  |

## `product`

VENDOR / PROJECT STRUCTURE

| Column | Type | Null | Key | Default | References | Allowed values | Description |
|---|---|---|---|---|---|---|---|
| `product_id` | UUID | NO | PK | `gen_random_uuid()` |  |  |  |
| `vendor_id` | UUID | NO | FK |  | vendor.vendor_id |  |  |
| `product_name` | VARCHAR | NO |  |  |  |  |  |
| `description` | TEXT | YES |  |  |  |  |  |
| `active` | BOOLEAN | NO |  | `true` |  |  |  |
| `created_at` | TIMESTAMPTZ | NO |  | `now()` |  |  |  |
| `updated_at` | TIMESTAMPTZ | NO |  | `now()` |  |  |  |

## `stig_project`

workflow_status aligned to the UI stage pipeline (WORKFLOW_STAGES). phase is the coarse tab the UI renders (PHASES).

| Column | Type | Null | Key | Default | References | Allowed values | Description |
|---|---|---|---|---|---|---|---|
| `project_id` | UUID | NO | PK | `gen_random_uuid()` |  |  |  |
| `vendor_id` | UUID | NO | FK |  | vendor.vendor_id |  |  |
| `product_id` | UUID | NO | FK |  | product.product_id |  |  |
| `source_srg_id` | UUID | YES | FK |  | srg.srg_id |  |  |
| `project_name` | VARCHAR | NO |  |  |  |  |  |
| `product_version` | VARCHAR | YES |  |  |  |  |  |
| `stig_version` | VARCHAR | YES |  |  |  |  | e.g. 'V1R2 (Draft)' |
| `stig_release` | VARCHAR | YES |  |  |  |  |  |
| `phase` | VARCHAR | YES |  |  |  | VENDOR_DRAFT, STIG_DRAFT, STIG_TESTING, TECH_EDITS, DELIVERY | [MOCKUP] |
| `workflow_status` | VARCHAR | YES |  |  |  | VENDOR_PROGRESS, VENDOR_READY, READY_TESTING, READY_TECHEDIT, READY_PMRC, PMRC, DELIVERED | [MOCKUP] pipeline stage |
| `assigned_writer` | UUID | YES | FK |  | app_user.user_id |  | [MOCKUP] project lead / STIG writer |
| `created_by` | UUID | YES | FK |  | app_user.user_id |  |  |
| `created_at` | TIMESTAMPTZ | NO |  | `now()` |  |  |  |
| `updated_by` | UUID | YES | FK |  | app_user.user_id |  |  |
| `updated_at` | TIMESTAMPTZ | NO |  | `now()` |  |  |  |

## `requirement`

REQUIREMENT (STIG content)

| Column | Type | Null | Key | Default | References | Allowed values | Description |
|---|---|---|---|---|---|---|---|
| `requirement_id` | UUID | NO | PK | `gen_random_uuid()` |  |  |  |
| `vendor_id` | UUID | NO | FK |  | vendor.vendor_id |  |  |
| `project_id` | UUID | NO | FK |  | stig_project.project_id |  |  |
| `source_srg_requirement_id` | UUID | YES | FK |  | srg_requirement.srg_requirement_id |  |  |
| `satisfied_by_requirement_id` | UUID | YES | FK |  | requirement.requirement_id |  | [MOCKUP] duplicate/"Satisfied By" grouping |
| `srg_id` | VARCHAR | YES |  |  |  |  | denormalized SRG code shown in grid |
| `stig_id` | VARCHAR | NO |  |  |  |  | 'HRZN-8X-000010' (draft STIGs have no Vuln ID) |
| `ia_control` | VARCHAR | YES |  |  |  |  | [MOCKUP] IA control column (AC-8) |
| `requirement_text` | TEXT | YES |  |  |  |  | UI 'Requirement' / title |
| `vul_discussion` | TEXT | YES |  |  |  |  |  |
| `status` | VARCHAR | YES |  |  |  | MEETS, CONFIGURABLE, DOES_NOT_MEET, INHERENTLY_MEETS, NOT_APPLICABLE | requirement determination |
| `check_text` | TEXT | YES |  |  |  |  |  |
| `fix_text` | TEXT | YES |  |  |  |  |  |
| `severity` | VARCHAR | YES |  |  |  | CAT_I, CAT_II, CAT_III |  |
| `mitigation` | TEXT | YES |  |  |  |  |  |
| `artifact_description` | TEXT | YES |  |  |  |  |  |
| `status_justification` | TEXT | YES |  |  |  |  |  |
| `notes` | TEXT | YES |  |  |  |  |  |
| `approval_status` | VARCHAR | YES |  |  |  | APPROVED, PENDING_APPROVAL, RETURNED | [MOCKUP] review outcome |
| `workflow_status` | VARCHAR | YES |  |  |  |  | optional per-rule state |
| `current_revision` | INTEGER | NO |  | `1` |  |  |  |
| `assigned_to` | UUID | YES | FK |  | app_user.user_id |  | [MOCKUP] per-requirement assignee |
| `created_by` | UUID | YES | FK |  | app_user.user_id |  |  |
| `created_at` | TIMESTAMPTZ | NO |  | `now()` |  |  |  |
| `updated_by` | UUID | YES | FK |  | app_user.user_id |  |  |
| `updated_at` | TIMESTAMPTZ | NO |  | `now()` |  |  |  |
| `reviewed_by` | UUID | YES | FK |  | app_user.user_id |  |  |
| `reviewed_at` | TIMESTAMPTZ | YES |  |  |  |  |  |
| `approved_by` | UUID | YES | FK |  | app_user.user_id |  |  |
| `approved_at` | TIMESTAMPTZ | YES |  |  |  |  |  |

## `requirement_cci`

| Column | Type | Null | Key | Default | References | Allowed values | Description |
|---|---|---|---|---|---|---|---|
| `requirement_id` | UUID | NO | FK |  | requirement.requirement_id |  |  |
| `cci_id` | UUID | NO | FK |  | cci.cci_id |  |  |

## `requirement_revision`

Full-snapshot history of authoring content.

| Column | Type | Null | Key | Default | References | Allowed values | Description |
|---|---|---|---|---|---|---|---|
| `revision_id` | UUID | NO | PK | `gen_random_uuid()` |  |  |  |
| `requirement_id` | UUID | NO | FK |  | requirement.requirement_id |  |  |
| `vendor_id` | UUID | NO | FK |  | vendor.vendor_id |  |  |
| `revision_number` | INTEGER | NO |  |  |  |  |  |
| `srg_id` | VARCHAR | YES |  |  |  |  |  |
| `stig_id` | VARCHAR | YES |  |  |  |  |  |
| `requirement_text` | TEXT | YES |  |  |  |  |  |
| `vul_discussion` | TEXT | YES |  |  |  |  |  |
| `status` | VARCHAR | YES |  |  |  |  |  |
| `check_text` | TEXT | YES |  |  |  |  |  |
| `fix_text` | TEXT | YES |  |  |  |  |  |
| `severity` | VARCHAR | YES |  |  |  |  |  |
| `mitigation` | TEXT | YES |  |  |  |  |  |
| `artifact_description` | TEXT | YES |  |  |  |  |  |
| `status_justification` | TEXT | YES |  |  |  |  |  |
| `notes` | TEXT | YES |  |  |  |  |  |
| `created_by` | UUID | YES | FK |  | app_user.user_id |  |  |
| `created_at` | TIMESTAMPTZ | NO |  | `now()` |  |  |  |

## `requirement_field_change`

[MOCKUP] Field-level change log powering the "Revision History" panel (field, from -> to). Complements full snapshots above.

| Column | Type | Null | Key | Default | References | Allowed values | Description |
|---|---|---|---|---|---|---|---|
| `change_id` | UUID | NO | PK | `gen_random_uuid()` |  |  |  |
| `requirement_id` | UUID | NO | FK |  | requirement.requirement_id |  |  |
| `vendor_id` | UUID | NO | FK |  | vendor.vendor_id |  |  |
| `field_name` | VARCHAR | NO |  |  |  |  | 'status' \| 'check' \| 'approval_status' ... |
| `old_value` | TEXT | YES |  |  |  |  |  |
| `new_value` | TEXT | YES |  |  |  |  |  |
| `changed_by` | UUID | YES | FK |  | app_user.user_id |  |  |
| `changed_at` | TIMESTAMPTZ | NO |  | `now()` |  |  |  |

## `comment`

| Column | Type | Null | Key | Default | References | Allowed values | Description |
|---|---|---|---|---|---|---|---|
| `comment_id` | UUID | NO | PK | `gen_random_uuid()` |  |  |  |
| `vendor_id` | UUID | NO | FK |  | vendor.vendor_id |  |  |
| `requirement_id` | UUID | NO | FK |  | requirement.requirement_id |  |  |
| `field_name` | VARCHAR | YES |  |  |  |  | portion under discussion |
| `comment_text` | TEXT | NO |  |  |  |  |  |
| `created_by` | UUID | YES | FK |  | app_user.user_id |  |  |
| `created_at` | TIMESTAMPTZ | NO |  | `now()` |  |  |  |
| `resolved_by` | UUID | YES | FK |  | app_user.user_id |  |  |
| `resolved_at` | TIMESTAMPTZ | YES |  |  |  |  |  |

## `document`

| Column | Type | Null | Key | Default | References | Allowed values | Description |
|---|---|---|---|---|---|---|---|
| `document_id` | UUID | NO | PK | `gen_random_uuid()` |  |  |  |
| `vendor_id` | UUID | NO | FK |  | vendor.vendor_id |  |  |
| `project_id` | UUID | YES | FK |  | stig_project.project_id |  |  |
| `requirement_id` | UUID | YES | FK |  | requirement.requirement_id |  |  |
| `document_type` | VARCHAR | YES |  |  |  |  |  |
| `title` | VARCHAR | NO |  |  |  |  |  |
| `file_name` | VARCHAR | YES |  |  |  |  |  |
| `object_key` | VARCHAR | YES |  |  |  |  | object storage; files are NOT in PG |
| `url` | TEXT | YES |  |  |  |  |  |
| `uploaded_by` | UUID | YES | FK |  | app_user.user_id |  |  |
| `uploaded_at` | TIMESTAMPTZ | NO |  | `now()` |  |  |  |

## `requirement_test`

[MOCKUP] STIG Testing phase results (InSpec validation grid).

| Column | Type | Null | Key | Default | References | Allowed values | Description |
|---|---|---|---|---|---|---|---|
| `test_id` | UUID | NO | PK | `gen_random_uuid()` |  |  |  |
| `requirement_id` | UUID | NO | FK |  | requirement.requirement_id |  |  |
| `vendor_id` | UUID | NO | FK |  | vendor.vendor_id |  |  |
| `determination_status` | VARCHAR | YES |  |  |  |  | mirrors requirement.status at test time |
| `security_feature_met` | BOOLEAN | YES |  |  |  |  | 'Y'/'N' in UI |
| `check_valid` | BOOLEAN | YES |  |  |  |  |  |
| `fix_valid` | BOOLEAN | YES |  |  |  |  |  |
| `inspec_control` | VARCHAR | YES |  |  |  |  |  |
| `test_comments` | TEXT | YES |  |  |  |  |  |
| `tested_by` | UUID | YES | FK |  | app_user.user_id |  |  |
| `tested_at` | TIMESTAMPTZ | NO |  | `now()` |  |  |  |

## `audit_event`

| Column | Type | Null | Key | Default | References | Allowed values | Description |
|---|---|---|---|---|---|---|---|
| `audit_event_id` | UUID | NO | PK | `gen_random_uuid()` |  |  |  |
| `vendor_id` | UUID | YES | FK |  | vendor.vendor_id |  |  |
| `user_id` | UUID | YES | FK |  | app_user.user_id |  |  |
| `event_type` | VARCHAR | NO |  |  |  |  | REQUIREMENT_UPDATED, COMMENT_CREATED ... |
| `object_type` | VARCHAR | YES |  |  |  |  | REQUIREMENT \| COMMENT \| PROJECT ... |
| `object_id` | UUID | YES |  |  |  |  |  |
| `action` | VARCHAR | YES |  |  |  |  |  |
| `result` | VARCHAR | YES |  |  |  |  |  |
| `ts` | TIMESTAMPTZ | NO |  | `now()` |  |  |  |
| `source_ip` | VARCHAR | YES |  |  |  |  |  |
| `request_id` | VARCHAR | YES |  |  |  |  |  |
| `details` | JSONB | YES |  |  |  |  |  |

-- =============================================================================
-- STIG Collaboration Portal — Central PostgreSQL physical schema
-- Reconciles the original data-model document with the built UI mock-up.
-- Naming: snake_case, UUID PKs (gen_random_uuid), TIMESTAMPTZ, enums via CHECK.
-- Vendor-owned tables carry vendor_id for Row-Level Security (RLS).
-- Lines marked [MOCKUP] are additions surfaced by the application mock-up.
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()

-- ------------------------------------------------------------------ IDENTITY
CREATE TABLE IF NOT EXISTS app_user (
  user_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_subject_id VARCHAR UNIQUE,          -- Keycloak JWT 'sub'
  username            VARCHAR NOT NULL,
  display_name        VARCHAR,
  email               VARCHAR,
  initials            VARCHAR(4),              -- [MOCKUP] avatar initials (TB, JV...)
  is_global           BOOLEAN NOT NULL DEFAULT false, -- [MOCKUP] government user (Gov SME/PMRC/Senior Review) not bound to one vendor
  active              BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor (
  vendor_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name VARCHAR NOT NULL,
  vendor_code VARCHAR UNIQUE NOT NULL,
  vendor_org  VARCHAR,                          -- [MOCKUP] parent org label (e.g. Rancher under SUSE)
  description TEXT,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- access_role: vendor-scoped roles AUTHOR/REVIEWER/APPROVER/READ_ONLY/VENDOR_LEAD.
-- [MOCKUP] government roles GOV_SME/PMRC/SENIOR_REVIEWER are cross-vendor:
--   grant them with vendor_id = NULL to mean "all vendors" (see RLS note §RLS).
CREATE TABLE IF NOT EXISTS user_vendor_access (
  user_vendor_access_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES app_user(user_id),
  vendor_id   UUID REFERENCES vendor(vendor_id),        -- NULL = global/government scope [MOCKUP]
  access_role VARCHAR NOT NULL CHECK (access_role IN
              ('AUTHOR','REVIEWER','APPROVER','READ_ONLY','VENDOR_LEAD',
               'GOV_SME','PMRC','SENIOR_REVIEWER')),   -- last 3 = government [MOCKUP]
  granted_by  UUID REFERENCES app_user(user_id),
  granted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ,
  active      BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (user_id, vendor_id, access_role)
);

-- ------------------------------------------------------------- SRG HIERARCHY (shared reference)
CREATE TABLE IF NOT EXISTS srg (
  srg_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_srg_id UUID REFERENCES srg(srg_id),   -- NULL = Core SRG; else derived-from
  srg_code      VARCHAR UNIQUE NOT NULL,        -- e.g. 'Virtualization SRG'
  srg_name      VARCHAR NOT NULL,
  srg_type      VARCHAR,                        -- CORE | DERIVED
  version       VARCHAR,
  release       VARCHAR,
  description   TEXT,
  active        BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS srg_requirement (
  srg_requirement_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  srg_id                    UUID NOT NULL REFERENCES srg(srg_id),
  parent_srg_requirement_id UUID REFERENCES srg_requirement(srg_requirement_id),
  srg_requirement_code      VARCHAR NOT NULL,   -- e.g. 'SRG-OS-000023-VMM-000060'
  requirement_text          TEXT,
  discussion                TEXT,
  check_text                TEXT,
  fix_text                  TEXT,
  severity                  VARCHAR CHECK (severity IN ('CAT_I','CAT_II','CAT_III')),
  default_ia_control        VARCHAR,            -- [MOCKUP] IA control shown on SRG rows (AC-8...)
  source_version            VARCHAR
);

-- ------------------------------------------------------------------- CCI (shared reference)
CREATE TABLE IF NOT EXISTS cci (
  cci_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cci_number       VARCHAR UNIQUE NOT NULL,     -- 'CCI-000048'
  definition       TEXT,
  nist_control     VARCHAR,                     -- [MOCKUP] mapped NIST control ('AC-8 a')
  status           VARCHAR,
  reference_source VARCHAR
);

-- --------------------------------------------------------- VENDOR / PROJECT STRUCTURE
CREATE TABLE IF NOT EXISTS product (
  product_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id    UUID NOT NULL REFERENCES vendor(vendor_id),
  product_name VARCHAR NOT NULL,
  description  TEXT,
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- workflow_status aligned to the UI stage pipeline (WORKFLOW_STAGES).
-- phase is the coarse tab the UI renders (PHASES).
CREATE TABLE IF NOT EXISTS stig_project (
  project_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id         UUID NOT NULL REFERENCES vendor(vendor_id),
  product_id        UUID NOT NULL REFERENCES product(product_id),
  source_srg_id     UUID REFERENCES srg(srg_id),
  project_name      VARCHAR NOT NULL,
  product_version   VARCHAR,
  stig_version      VARCHAR,                    -- e.g. 'V1R2 (Draft)'
  stig_release      VARCHAR,
  phase             VARCHAR CHECK (phase IN                     -- [MOCKUP]
                    ('VENDOR_DRAFT','STIG_DRAFT','STIG_TESTING','TECH_EDITS','DELIVERY')),
  workflow_status   VARCHAR CHECK (workflow_status IN           -- [MOCKUP] pipeline stage
                    ('VENDOR_PROGRESS','VENDOR_READY','READY_TESTING',
                     'READY_TECHEDIT','READY_PMRC','PMRC','DELIVERED')),
  assigned_writer   UUID REFERENCES app_user(user_id),         -- [MOCKUP] project lead / STIG writer
  created_by        UUID REFERENCES app_user(user_id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by        UUID REFERENCES app_user(user_id),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------- REQUIREMENT (STIG content)
CREATE TABLE IF NOT EXISTS requirement (
  requirement_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id                 UUID NOT NULL REFERENCES vendor(vendor_id),
  project_id                UUID NOT NULL REFERENCES stig_project(project_id),
  source_srg_requirement_id UUID REFERENCES srg_requirement(srg_requirement_id),
  satisfied_by_requirement_id UUID REFERENCES requirement(requirement_id), -- [MOCKUP] duplicate/"Satisfied By" grouping
  srg_id                    VARCHAR,            -- denormalized SRG code shown in grid
  stig_id                   VARCHAR NOT NULL,   -- 'HRZN-8X-000010' (draft STIGs have no Vuln ID)
  ia_control                VARCHAR,            -- [MOCKUP] IA control column (AC-8)
  requirement_text          TEXT,               -- UI 'Requirement' / title
  vul_discussion            TEXT,
  status                    VARCHAR CHECK (status IN            -- requirement determination
                            ('MEETS','CONFIGURABLE','DOES_NOT_MEET','INHERENTLY_MEETS','NOT_APPLICABLE')),
  check_text                TEXT,
  fix_text                  TEXT,
  severity                  VARCHAR CHECK (severity IN ('CAT_I','CAT_II','CAT_III')),
  mitigation                TEXT,
  artifact_description       TEXT,
  status_justification       TEXT,
  notes                     TEXT,
  approval_status           VARCHAR CHECK (approval_status IN   -- [MOCKUP] review outcome
                            ('APPROVED','PENDING_APPROVAL','RETURNED')),
  workflow_status           VARCHAR,            -- optional per-rule state
  current_revision          INTEGER NOT NULL DEFAULT 1,
  assigned_to               UUID REFERENCES app_user(user_id), -- [MOCKUP] per-requirement assignee
  created_by                UUID REFERENCES app_user(user_id),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by                UUID REFERENCES app_user(user_id),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by               UUID REFERENCES app_user(user_id),
  reviewed_at               TIMESTAMPTZ,
  approved_by               UUID REFERENCES app_user(user_id),
  approved_at               TIMESTAMPTZ,
  UNIQUE (project_id, stig_id)
);

CREATE TABLE IF NOT EXISTS requirement_cci (
  requirement_id UUID NOT NULL REFERENCES requirement(requirement_id) ON DELETE CASCADE,
  cci_id         UUID NOT NULL REFERENCES cci(cci_id),
  PRIMARY KEY (requirement_id, cci_id)
);

-- Full-snapshot history of authoring content.
CREATE TABLE IF NOT EXISTS requirement_revision (
  revision_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id       UUID NOT NULL REFERENCES requirement(requirement_id),
  vendor_id            UUID NOT NULL REFERENCES vendor(vendor_id),
  revision_number      INTEGER NOT NULL,
  srg_id               VARCHAR,
  stig_id              VARCHAR,
  requirement_text     TEXT,
  vul_discussion       TEXT,
  status               VARCHAR,
  check_text           TEXT,
  fix_text             TEXT,
  severity             VARCHAR,
  mitigation           TEXT,
  artifact_description TEXT,
  status_justification TEXT,
  notes                TEXT,
  created_by           UUID REFERENCES app_user(user_id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (requirement_id, revision_number)
);

-- [MOCKUP] Field-level change log powering the "Revision History" panel
-- (field, from -> to). Complements full snapshots above.
CREATE TABLE IF NOT EXISTS requirement_field_change (
  change_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id UUID NOT NULL REFERENCES requirement(requirement_id),
  vendor_id      UUID NOT NULL REFERENCES vendor(vendor_id),
  field_name     VARCHAR NOT NULL,             -- 'status' | 'check' | 'approval_status' ...
  old_value      TEXT,
  new_value      TEXT,
  changed_by     UUID REFERENCES app_user(user_id),
  changed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comment (
  comment_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id      UUID NOT NULL REFERENCES vendor(vendor_id),
  requirement_id UUID NOT NULL REFERENCES requirement(requirement_id),
  field_name     VARCHAR,                       -- portion under discussion
  comment_text   TEXT NOT NULL,
  created_by     UUID REFERENCES app_user(user_id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_by    UUID REFERENCES app_user(user_id),
  resolved_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS document (
  document_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id     UUID NOT NULL REFERENCES vendor(vendor_id),
  project_id    UUID REFERENCES stig_project(project_id),
  requirement_id UUID REFERENCES requirement(requirement_id),
  document_type VARCHAR,
  title         VARCHAR NOT NULL,
  file_name     VARCHAR,
  object_key    VARCHAR,                        -- object storage; files are NOT in PG
  url           TEXT,
  uploaded_by   UUID REFERENCES app_user(user_id),
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- [MOCKUP] STIG Testing phase results (InSpec validation grid).
CREATE TABLE IF NOT EXISTS requirement_test (
  test_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id        UUID NOT NULL REFERENCES requirement(requirement_id),
  vendor_id             UUID NOT NULL REFERENCES vendor(vendor_id),
  determination_status  VARCHAR,                -- mirrors requirement.status at test time
  security_feature_met  BOOLEAN,                -- 'Y'/'N' in UI
  check_valid           BOOLEAN,
  fix_valid             BOOLEAN,
  inspec_control        VARCHAR,
  test_comments         TEXT,
  tested_by             UUID REFERENCES app_user(user_id),
  tested_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_event (
  audit_event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id      UUID REFERENCES vendor(vendor_id),
  user_id        UUID REFERENCES app_user(user_id),
  event_type     VARCHAR NOT NULL,              -- REQUIREMENT_UPDATED, COMMENT_CREATED ...
  object_type    VARCHAR,                       -- REQUIREMENT | COMMENT | PROJECT ...
  object_id      UUID,
  action         VARCHAR,
  result         VARCHAR,
  ts             TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_ip      VARCHAR,
  request_id     VARCHAR,
  details        JSONB
);

-- --------------------------------------------------------------------- INDEXES
CREATE INDEX IF NOT EXISTS ix_uva_user           ON user_vendor_access(user_id);
CREATE INDEX IF NOT EXISTS ix_uva_vendor         ON user_vendor_access(vendor_id);
CREATE INDEX IF NOT EXISTS ix_product_vendor     ON product(vendor_id);
CREATE INDEX IF NOT EXISTS ix_project_vendor     ON stig_project(vendor_id);
CREATE INDEX IF NOT EXISTS ix_project_product    ON stig_project(product_id);
CREATE INDEX IF NOT EXISTS ix_req_vendor         ON requirement(vendor_id);
CREATE INDEX IF NOT EXISTS ix_req_project        ON requirement(project_id);
CREATE INDEX IF NOT EXISTS ix_req_srgreq         ON requirement(source_srg_requirement_id);
CREATE INDEX IF NOT EXISTS ix_req_satisfiedby    ON requirement(satisfied_by_requirement_id);
CREATE INDEX IF NOT EXISTS ix_reqcci_cci         ON requirement_cci(cci_id);
CREATE INDEX IF NOT EXISTS ix_rev_req            ON requirement_revision(requirement_id);
CREATE INDEX IF NOT EXISTS ix_change_req         ON requirement_field_change(requirement_id);
CREATE INDEX IF NOT EXISTS ix_comment_req        ON comment(requirement_id);
CREATE INDEX IF NOT EXISTS ix_doc_req            ON document(requirement_id);
CREATE INDEX IF NOT EXISTS ix_test_req           ON requirement_test(requirement_id);
CREATE INDEX IF NOT EXISTS ix_audit_vendor_ts    ON audit_event(vendor_id, ts DESC);
CREATE INDEX IF NOT EXISTS ix_srgreq_srg         ON srg_requirement(srg_id);

-- --------------------------------------------------- DERIVED PROJECT ROLLUPS (views)
-- The UI dashboard shows progress %, CAT I/II/III counts and an approval breakdown.
-- These are computed, not stored.
CREATE OR REPLACE VIEW v_project_rollup AS
SELECT p.project_id,
       COUNT(r.*)                                                   AS total,
       COUNT(*) FILTER (WHERE r.severity='CAT_I')                   AS cat_i,
       COUNT(*) FILTER (WHERE r.severity='CAT_II')                  AS cat_ii,
       COUNT(*) FILTER (WHERE r.severity='CAT_III')                 AS cat_iii,
       COUNT(*) FILTER (WHERE r.approval_status='APPROVED')         AS approved,
       COUNT(*) FILTER (WHERE r.approval_status='PENDING_APPROVAL') AS in_review,
       COUNT(*) FILTER (WHERE r.approval_status='RETURNED')         AS returned,
       ROUND(100.0 * COUNT(*) FILTER (WHERE r.approval_status='APPROVED')
             / NULLIF(COUNT(r.*),0))                                AS progress_pct
FROM stig_project p
LEFT JOIN requirement r ON r.project_id = p.project_id
GROUP BY p.project_id;

-- ------------------------------------------------------------------------ RLS
-- Enable per vendor-owned table; government (is_global) users set app.vendor_id
-- per request as they act on a specific vendor's project.
ALTER TABLE requirement ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS requirement_vendor_isolation ON requirement;
CREATE POLICY requirement_vendor_isolation ON requirement
  USING (vendor_id = current_setting('app.vendor_id', true)::uuid);
-- Repeat ENABLE + POLICY for: product, stig_project, requirement_revision,
-- requirement_field_change, comment, document, requirement_test, audit_event,
-- user_vendor_access.  srg, srg_requirement, cci are shared reference (no RLS).

-- =============================================================================
-- STIG Portal - COMMENT ON statements (table & column descriptions)
-- Generated from docs/schema.sql by scripts/gen_data_dictionary.mjs.
-- Run AFTER schema.sql:  psql "$DATABASE_URL" -f docs/comments.sql
-- =============================================================================

COMMENT ON TABLE app_user IS 'IDENTITY';
COMMENT ON COLUMN app_user.external_subject_id IS 'Keycloak JWT ''sub''';
COMMENT ON COLUMN app_user.initials IS '[MOCKUP] avatar initials (TB, JV...)';
COMMENT ON COLUMN app_user.is_global IS '[MOCKUP] government user (Gov SME/PMRC/Senior Review) not bound to one vendor';

COMMENT ON COLUMN vendor.vendor_org IS '[MOCKUP] parent org label (e.g. Rancher under SUSE)';

COMMENT ON TABLE user_vendor_access IS 'access_role: vendor-scoped roles AUTHOR/REVIEWER/APPROVER/READ_ONLY/VENDOR_LEAD. [MOCKUP] government roles GOV_SME/PMRC/SENIOR_REVIEWER are cross-vendor: grant them with vendor_id = NULL to mean "all vendors" (see RLS note §RLS).';
COMMENT ON COLUMN user_vendor_access.vendor_id IS 'NULL = global/government scope [MOCKUP]';

COMMENT ON TABLE srg IS 'SRG HIERARCHY (shared reference)';
COMMENT ON COLUMN srg.parent_srg_id IS 'NULL = Core SRG; else derived-from';
COMMENT ON COLUMN srg.srg_code IS 'e.g. ''Virtualization SRG''';
COMMENT ON COLUMN srg.srg_type IS 'CORE | DERIVED';

COMMENT ON COLUMN srg_requirement.srg_requirement_code IS 'e.g. ''SRG-OS-000023-VMM-000060''';
COMMENT ON COLUMN srg_requirement.default_ia_control IS '[MOCKUP] IA control shown on SRG rows (AC-8...)';

COMMENT ON TABLE cci IS 'CCI (shared reference)';
COMMENT ON COLUMN cci.cci_number IS '''CCI-000048''';
COMMENT ON COLUMN cci.nist_control IS '[MOCKUP] mapped NIST control (''AC-8 a'')';

COMMENT ON TABLE product IS 'VENDOR / PROJECT STRUCTURE';

COMMENT ON TABLE stig_project IS 'workflow_status aligned to the UI stage pipeline (WORKFLOW_STAGES). phase is the coarse tab the UI renders (PHASES).';
COMMENT ON COLUMN stig_project.stig_version IS 'e.g. ''V1R2 (Draft)''';
COMMENT ON COLUMN stig_project.phase IS '[MOCKUP]';
COMMENT ON COLUMN stig_project.workflow_status IS '[MOCKUP] pipeline stage';
COMMENT ON COLUMN stig_project.assigned_writer IS '[MOCKUP] project lead / STIG writer';

COMMENT ON TABLE requirement IS 'REQUIREMENT (STIG content)';
COMMENT ON COLUMN requirement.satisfied_by_requirement_id IS '[MOCKUP] duplicate/"Satisfied By" grouping';
COMMENT ON COLUMN requirement.srg_id IS 'denormalized SRG code shown in grid';
COMMENT ON COLUMN requirement.stig_id IS '''HRZN-8X-000010'' (draft STIGs have no Vuln ID)';
COMMENT ON COLUMN requirement.ia_control IS '[MOCKUP] IA control column (AC-8)';
COMMENT ON COLUMN requirement.requirement_text IS 'UI ''Requirement'' / title';
COMMENT ON COLUMN requirement.status IS 'requirement determination';
COMMENT ON COLUMN requirement.approval_status IS '[MOCKUP] review outcome';
COMMENT ON COLUMN requirement.workflow_status IS 'optional per-rule state';
COMMENT ON COLUMN requirement.assigned_to IS '[MOCKUP] per-requirement assignee';


COMMENT ON TABLE requirement_revision IS 'Full-snapshot history of authoring content.';

COMMENT ON TABLE requirement_field_change IS '[MOCKUP] Field-level change log powering the "Revision History" panel (field, from -> to). Complements full snapshots above.';
COMMENT ON COLUMN requirement_field_change.field_name IS '''status'' | ''check'' | ''approval_status'' ...';

COMMENT ON COLUMN comment.field_name IS 'portion under discussion';

COMMENT ON COLUMN document.object_key IS 'object storage; files are NOT in PG';

COMMENT ON TABLE requirement_test IS '[MOCKUP] STIG Testing phase results (InSpec validation grid).';
COMMENT ON COLUMN requirement_test.determination_status IS 'mirrors requirement.status at test time';
COMMENT ON COLUMN requirement_test.security_feature_met IS '''Y''/''N'' in UI';

COMMENT ON COLUMN audit_event.event_type IS 'REQUIREMENT_UPDATED, COMMENT_CREATED ...';
COMMENT ON COLUMN audit_event.object_type IS 'REQUIREMENT | COMMENT | PROJECT ...';

# STIG Portal — Updated ER Diagram (Central PostgreSQL)

Reflects the reconciled model in `docs/schema.sql`. New edges/entities surfaced by the
mock-up are annotated. Paste into any Mermaid renderer.

```mermaid
erDiagram
    APP_USER ||--o{ USER_VENDOR_ACCESS : assigned
    VENDOR   ||--o{ USER_VENDOR_ACCESS : controls
    VENDOR   ||--o{ PRODUCT : owns
    VENDOR   ||--o{ STIG_PROJECT : owns
    PRODUCT  ||--o{ STIG_PROJECT : contains
    APP_USER ||--o{ STIG_PROJECT : "assigned_writer"

    SRG o|--o{ SRG : "parent/derived"
    SRG ||--o{ SRG_REQUIREMENT : contains
    SRG_REQUIREMENT o|--o{ SRG_REQUIREMENT : "parent/derived"
    SRG ||--o{ STIG_PROJECT : "source (core or derived)"
    STIG_PROJECT ||--o{ REQUIREMENT : contains
    SRG_REQUIREMENT ||--o{ REQUIREMENT : "source lineage"

    REQUIREMENT o|--o{ REQUIREMENT : "satisfied_by (duplicate group)"
    REQUIREMENT ||--o{ REQUIREMENT_REVISION : "snapshots"
    REQUIREMENT ||--o{ REQUIREMENT_FIELD_CHANGE : "field history"
    REQUIREMENT ||--o{ REQUIREMENT_TEST : "inspec results"
    REQUIREMENT ||--o{ COMMENT : receives
    REQUIREMENT ||--o{ DOCUMENT : supports
    REQUIREMENT ||--o{ REQUIREMENT_CCI : maps
    CCI ||--o{ REQUIREMENT_CCI : mapped

    APP_USER ||--o{ REQUIREMENT : "assigned_to"
    APP_USER ||--o{ REQUIREMENT_REVISION : creates
    APP_USER ||--o{ REQUIREMENT_FIELD_CHANGE : makes
    APP_USER ||--o{ REQUIREMENT_TEST : runs
    APP_USER ||--o{ COMMENT : writes
    APP_USER ||--o{ AUDIT_EVENT : performs

    APP_USER {
      uuid user_id PK
      varchar external_subject_id
      varchar display_name
      varchar initials "MOCKUP"
      boolean is_global "MOCKUP govt user"
    }
    USER_VENDOR_ACCESS {
      uuid user_vendor_access_id PK
      uuid vendor_id FK "NULL = global (MOCKUP)"
      varchar access_role "AUTHOR..VENDOR_LEAD + GOV_SME/PMRC/SENIOR_REVIEWER (MOCKUP)"
    }
    STIG_PROJECT {
      uuid project_id PK
      uuid source_srg_id FK
      varchar phase "MOCKUP"
      varchar workflow_status "MOCKUP pipeline"
      uuid assigned_writer FK "MOCKUP"
    }
    REQUIREMENT {
      uuid requirement_id PK
      uuid source_srg_requirement_id FK
      uuid satisfied_by_requirement_id FK "MOCKUP"
      varchar stig_id
      varchar ia_control "MOCKUP"
      varchar status "determination"
      varchar approval_status "MOCKUP"
      uuid assigned_to FK "MOCKUP"
    }
    CCI {
      uuid cci_id PK
      varchar cci_number
      varchar nist_control "MOCKUP"
    }
    REQUIREMENT_TEST {
      uuid test_id PK "MOCKUP entity"
      boolean security_feature_met
      boolean check_valid
      boolean fix_valid
    }
    REQUIREMENT_FIELD_CHANGE {
      uuid change_id PK "MOCKUP entity"
      varchar field_name
      text old_value
      text new_value
    }
```

// Workflow model: roles, phases, and per-requirement SRG parent + testing data.

export const ROLES = [
  { id: "gov-sme", label: "Gov SME", user: "David Shultz", initials: "DS" },
  { id: "vendor", label: "Vendor", user: "Joe Vendor", initials: "JV", org: "Rancher" },
  { id: "stig-writer", label: "STIG Writer", user: "Teena Brinkley", initials: "TB" },
  { id: "pmrc", label: "PMRC", user: "PMRC", initials: "PM" },
  { id: "senior-review", label: "Senior Review", user: "Aaron Kegrreis", initials: "AK" },
];

export const PHASES = [
  { id: "vendor-draft", label: "Vendor Draft", path: "/phase/vendor-draft" },
  { id: "stig-draft", label: "STIG Draft", path: "/phase/stig-draft" },
  { id: "stig-testing", label: "STIG Testing", path: "/phase/stig-testing" },
  { id: "tech-edits", label: "Tech Edits", path: "/phase/tech-edits" },
  { id: "delivery", label: "Delivery", path: "/phase/delivery" },
];

// Which workflow phases each role can access (others are hidden).
export const PHASE_ACCESS = {
  "gov-sme": ["vendor-draft"],
  vendor: ["vendor-draft", "stig-draft", "stig-testing"],
  "stig-writer": ["stig-draft", "stig-testing", "tech-edits"],
  pmrc: ["tech-edits", "delivery"],
  // Senior Review is the moderator: full visibility across every phase.
  "senior-review": ["vendor-draft", "stig-draft", "stig-testing", "tech-edits", "delivery"],
};

export const CREATE_STIGID_ROLES = ["stig-writer", "pmrc", "senior-review"];

// Roles that can start a new STIG (SRG selection & authoring) via the sidebar.
export const NEW_STIG_ROLES = ["gov-sme", "pmrc", "senior-review"];

// Roles that can import & manage the SRG library via the sidebar.
export const MANAGE_SRG_ROLES = ["pmrc", "senior-review"];

// Internal team roles that can see/post internal (not customer-facing) STIG Comments.
export const INTERNAL_ROLES = ["stig-writer", "pmrc", "senior-review"];

// Delivery workflow stages, grouped by the role that "owns" them. The advance
// action is surfaced on the Projects dashboard (and Vendor Draft screen).
export const WORKFLOW_STAGES = [
  { id: "vendor-progress", label: "Draft in Progress",     owner: "vendor", action: "Ready for STIG Writer", next: "vendor-ready" },
  { id: "vendor-ready",    label: "Ready for STIG Writer", owner: "vendor", action: "Send to STIG Writer",   next: "ready-testing" },
  { id: "ready-testing",   label: "Ready for Testing",     owner: "writer", action: "Ready for Testing",     next: "ready-techedit" },
  { id: "ready-techedit",  label: "Ready for TechEdit",    owner: "writer", action: "Ready for TechEdit",    next: "ready-pmrc" },
  { id: "ready-pmrc",      label: "Ready for PMRC",        owner: "writer", action: "Ready for PMRC",        next: "pmrc" },
  { id: "pmrc",            label: "PMRC Review",           owner: "pmrc",   action: "Approve for Delivery",  next: "delivered" },
  { id: "delivered",       label: "Delivered",             owner: "pmrc",   action: null,                    next: null },
];

// Available parent SRG families a Gov SME can import/select (multi-select).
export const srgFamilies = [
  { id: "app-core", label: "Application Core", full: "Application Security and Development", count: 286 },
  { id: "gap", label: "GAP", full: "General Application Platform", count: 141 },
  { id: "alg", label: "ALG", full: "Application Layer Gateway", count: 98 },
  { id: "container", label: "Container Platform", full: "Container Platform SRG", count: 132 },
  { id: "os", label: "OS", full: "Operating System SRG", count: 204 },
  { id: "gpos", label: "GPOS", full: "General Purpose Operating System", count: 246 },
];

export const TEST_STATUSES = [
  "Applicable - Inherently Meets",
  "Applicable - Configurable",
  "Not Applicable",
  "Applicable - Does Not Meet",
];

export const defaultTestSteps = (status) =>
  status === "Applicable - Configurable" ? "Standard Test Steps" : "Verify Status";

// Parent SRG catalog the Gov SME can select from to seed a new STIG.
export const srgCatalog = [
  { id: "SRG-OS-000023-VMM-000060", title: "Display the Standard Mandatory DoD Notice and Consent Banner before granting access.", severity: "CAT II", ia: "AC-8", cci: "CCI-000048" },
  { id: "SRG-OS-000029-VMM-000110", title: "Initiate a session lock after an organization-defined inactivity period.", severity: "CAT II", ia: "AC-11", cci: "CCI-000057" },
  { id: "SRG-OS-000033-VMM-000140", title: "Implement cryptographic mechanisms to protect confidentiality of remote access sessions.", severity: "CAT II", ia: "AC-17", cci: "CCI-000068" },
  { id: "SRG-OS-000105-VMM-000530", title: "Use multifactor authentication for privileged accounts.", severity: "CAT I", ia: "IA-2", cci: "CCI-000765" },
  { id: "SRG-OS-000250-VMM-000860", title: "Implement cryptographic mechanisms using FIPS-validated modules.", severity: "CAT II", ia: "SC-23", cci: "CCI-001184" },
  { id: "SRG-OS-000341-VMM-001220", title: "Allocate audit record storage capacity per organization-defined requirements.", severity: "CAT III", ia: "AU-4", cci: "CCI-001849" },
  { id: "SRG-OS-000423-VMM-001700", title: "Protect the confidentiality of transmitted information.", severity: "CAT I", ia: "SC-8", cci: "CCI-002418" },
  { id: "SRG-OS-000480-VMM-002000", title: "Configure security-relevant settings per organization-defined configuration.", severity: "CAT II", ia: "CM-6", cci: "CCI-000366" },
];

// Parent-SRG source text + relationships, keyed by requirement internal id.
export const srgDetailByReqId = {
  "r-260101": { srgRequirement: "The application must display the Standard Mandatory DoD Notice and Consent Banner before granting access.", srgDiscussion: "Display of a standardized approved use notification before granting access ensures privacy and security notification verbiage is consistent with applicable law.", srgCheck: "Verify the application displays the DoD banner before granting access. If it does not, this is a finding.", srgFix: "Configure the application to display the Standard Mandatory DoD Notice and Consent Banner.", satisfies: "", satisfiedBy: "" },
  "r-260104": { srgRequirement: "The application must protect the confidentiality of transmitted information.", srgDiscussion: "Unprotected communications can be intercepted and either read or altered.", srgCheck: "Verify TLS 1.2+ is enforced. If not, this is a finding.", srgFix: "Enforce TLS 1.2 or higher for all transmitted information.", satisfies: "", satisfiedBy: "" },
  "r-260108": { srgRequirement: "The application must initiate a session lock after an inactivity period not to exceed 15 minutes.", srgDiscussion: "A session lock prevents access when a user steps away without logging out.", srgCheck: "Verify the session timeout is 15 minutes or less. If not, this is a finding.", srgFix: "Configure the session timeout to 15 minutes or less.", satisfies: "", satisfiedBy: "" },
  "r-260112": { srgRequirement: "The application must allocate audit record storage capacity to retain audit records per policy.", srgDiscussion: "Sufficient storage prevents loss of audit data required for accountability.", srgCheck: "Verify audit storage retains at least one week of events. If not, this is a finding.", srgFix: "Allocate audit storage to retain at least one week of events.", satisfies: "", satisfiedBy: "" },
  "r-260117": { srgRequirement: "The application must use multifactor authentication for privileged accounts.", srgDiscussion: "MFA significantly reduces the risk of credential compromise.", srgCheck: "Verify MFA is enforced for administrators. If not, this is a finding.", srgFix: "Configure and enforce MFA for all privileged accounts.", satisfies: "", satisfiedBy: "" },
  "r-260123": { srgRequirement: "The application must configure security-relevant settings per organization-defined configuration.", srgDiscussion: "Uncontrolled data flows can be used to exfiltrate sensitive data.", srgCheck: "Verify the setting is configured. If not, this is a finding.", srgFix: "Apply the organization-defined configuration setting.", satisfies: "", satisfiedBy: "" },
  "r-260130": { srgRequirement: "The application must implement cryptographic mechanisms using FIPS-validated modules.", srgDiscussion: "Weak or untested encryption undermines the protection of data.", srgCheck: "Verify FIPS mode is enabled. If not, this is a finding.", srgFix: "Enable FIPS-validated cryptographic modules.", satisfies: "", satisfiedBy: "" },
  "r-260136": { srgRequirement: "The application must implement cryptographic mechanisms to protect confidentiality of remote access sessions.", srgDiscussion: "Unencrypted remote sessions expose keystrokes and screen content.", srgCheck: "Verify remote display sessions are encrypted. If not, this is a finding.", srgFix: "Enable encryption for all remote display sessions.", satisfies: "", satisfiedBy: "" },
};

// STIG Testing data keyed by requirement internal id.
export const testingByReqId = {
  "r-260101": { status: "Applicable - Inherently Meets", securityFeatureMet: "Y", checkValid: "Y", fixValid: "Y", comments: "Banner shown by default in the console.", satisfies: "", satisfiedBy: "" },
  "r-260104": { status: "Applicable - Configurable", securityFeatureMet: "Y", checkValid: "Y", fixValid: "Y", comments: "TLS configurable via locked.properties.", satisfies: "", satisfiedBy: "" },
  "r-260108": { status: "Applicable - Does Not Meet", securityFeatureMet: "N", checkValid: "Y", fixValid: "N", comments: "Fix does not cover client-session forced logoff.", satisfies: "", satisfiedBy: "" },
  "r-260112": { status: "Applicable - Configurable", securityFeatureMet: "Y", checkValid: "Y", fixValid: "Y", comments: "Retention configurable in Event Configuration.", satisfies: "", satisfiedBy: "" },
  "r-260117": { status: "Applicable - Configurable", securityFeatureMet: "Y", checkValid: "Y", fixValid: "Y", comments: "MFA configured via SAML IdP.", satisfies: "", satisfiedBy: "" },
  "r-260123": { status: "Applicable - Configurable", securityFeatureMet: "Y", checkValid: "Y", fixValid: "Y", comments: "Duplicate of clipboard policy in HRZN-8X-000230.", satisfies: "HRZN-8X-000230", satisfiedBy: "" },
  "r-260130": { status: "Applicable - Does Not Meet", securityFeatureMet: "N", checkValid: "Y", fixValid: "Y", comments: "FIPS not enabled at install; rebuild required.", satisfies: "", satisfiedBy: "" },
  "r-260136": { status: "Applicable - Inherently Meets", securityFeatureMet: "Y", checkValid: "Y", fixValid: "Y", comments: "Blast Secure Gateway encrypts sessions by default.", satisfies: "", satisfiedBy: "" },
};

// AI-detected duplicate check/fix clusters (MOCKED). Parent + child STIG IDs.
export const duplicateClusters = [
  {
    id: "dup-clipboard",
    theme: "Clipboard / peripheral redirection",
    parent: "HRZN-8X-000230",
    children: ["HRZN-8X-000231", "HRZN-8X-000232"],
    confidence: 0.94,
    note: "Three rules share near-identical GPO check/fix for redirection policies. Consolidate under the parent and mark children as Satisfied By.",
  },
  {
    id: "dup-tls",
    theme: "TLS transport protection",
    parent: "HRZN-8X-000040",
    children: ["HRZN-8X-000041"],
    confidence: 0.88,
    note: "Two rules verify TLS 1.2 in locked.properties. Consolidate the check under the parent.",
  },
];

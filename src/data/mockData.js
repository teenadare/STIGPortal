// Mock data for the STIG Writer Portal visual mockup.

export const currentUser = {
  name: "Teena Brinkley",
  initials: "TB",
  role: "STIG Author",
  vendor: "Omnissa",
};

export const projects = [
  {
    id: "horizon",
    name: "Omnissa Horizon 8 STIG",
    product: "Omnissa Horizon 8",
    vendor: "Omnissa",
    vendorOrg: "Omnissa",
    version: "V1R2 (Draft)",
    sourceSrg: "Virtualization SRG V1R2",
    status: "Under Review",
    progress: 64,
    total: 176,
    counts: { catI: 24, catII: 118, catIII: 34 },
    breakdown: { draft: 38, review: 74, revision: 21, approved: 43 },
    updated: "2026-06-24",
    lead: "Teena Brinkley",
  },
  {
    id: "rke2",
    name: "Rancher RKE2 STIG",
    product: "Rancher RKE2 1.29",
    vendor: "SUSE",
    vendorOrg: "Rancher",
    version: "V2R1 (Draft)",
    sourceSrg: "Container Platform SRG V1R4",
    status: "Draft",
    progress: 41,
    total: 148,
    counts: { catI: 31, catII: 92, catIII: 25 },
    breakdown: { draft: 71, review: 44, revision: 12, approved: 21 },
    updated: "2026-06-22",
    lead: "Teena Brinkley",
  },
  {
    id: "coldfusion",
    name: "Adobe ColdFusion 2023 STIG",
    product: "Adobe ColdFusion 2023",
    vendor: "Adobe",
    vendorOrg: "Adobe",
    version: "V1R1 (Draft)",
    sourceSrg: "Application Server SRG V3R3",
    status: "Needs Revision",
    progress: 52,
    total: 133,
    counts: { catI: 19, catII: 88, catIII: 26 },
    breakdown: { draft: 34, review: 39, revision: 28, approved: 32 },
    updated: "2026-06-23",
    lead: "Marcus Reilly",
  },
  {
    id: "rancher-mcm",
    name: "Rancher MCM STIG",
    product: "Rancher MCM 2.9",
    vendor: "SUSE",
    vendorOrg: "Rancher",
    version: "V1R1 (Draft)",
    sourceSrg: "Container Platform SRG V1R4",
    status: "Under Review",
    progress: 47,
    total: 132,
    counts: { catI: 22, catII: 84, catIII: 26 },
    breakdown: { draft: 41, review: 48, revision: 15, approved: 28 },
    updated: "2026-06-24",
    lead: "Joe Vendor",
  },
  {
    id: "rancher-harvester",
    name: "Rancher Harvester STIG",
    product: "Rancher Harvester 1.3",
    vendor: "SUSE",
    vendorOrg: "Rancher",
    version: "V1R1 (Draft)",
    sourceSrg: "Virtualization SRG V1R2",
    status: "Draft",
    progress: 29,
    total: 118,
    counts: { catI: 18, catII: 76, catIII: 24 },
    breakdown: { draft: 63, review: 31, revision: 9, approved: 15 },
    updated: "2026-06-22",
    lead: "Joe Vendor",
  },
];

export const activeProjectId = "horizon";

export const teamMembers = [
  { name: "Teena Brinkley", initials: "TB" },
  { name: "Marcus Reilly", initials: "MR" },
  { name: "Sam Whitfield", initials: "SW" },
  { name: "Dana Okonkwo", initials: "DO" },
];

const assignees = [
  { name: "Teena Brinkley", initials: "TB" },
  { name: "Marcus Reilly", initials: "MR" },
  { name: "Joe Vendor", initials: "JV" },
  { name: "Sam Whitfield", initials: "SW" },
];

// NOTE: Draft STIGs are identified by STIG ID only (no Vuln ID). `id` is an
// internal join key used for comments/revisions/audit references.
export const requirements = [
  {
    id: "r-260101",
    stigId: "HRZN-8X-000010",
    approvalStatus: "Approved",
    iaControl: "AC-8",
    cci: ["CCI-000048", "CCI-000050"],
    srg: "SRG-OS-000023-VMM-000060",
    title: "Omnissa Horizon Connection Server must display the Standard Mandatory DoD Notice and Consent Banner before granting access to the administrative console.",
    discussion:
      "Display of a standardized and approved use notification before granting access ensures privacy and security notification verbiage is consistent with applicable federal laws, Executive Orders, directives, policies, regulations, standards, and guidance.",
    status: "Applicable - Inherently Meets",
    check:
      "Verify the Horizon Connection Server displays the DoD Notice and Consent Banner.\n\n1. Log in to the Horizon Console.\n2. Navigate to Settings >> Global Settings >> General Settings.\n3. Confirm 'Display a pre-login message' is enabled and contains the DoD banner text.\n\nIf the banner is not displayed, this is a finding.",
    fix:
      "Configure the Horizon Connection Server pre-login banner.\n\n1. In the Horizon Console, go to Settings >> Global Settings >> General Settings >> Edit.\n2. Enable 'Display a pre-login message' and paste the approved DoD banner text.\n3. Click OK.",
    severity: "CAT II",
    mitigation: "N/A — control is fully implemented via the Global Settings pre-login message.",
    artifactDescription: "Screenshot of Global Settings showing the enabled DoD pre-login banner text.",
    statusJustification: "Banner text validated against the DoD standard verbiage on 2026-06-20.",
    notes: "Applies to all Connection Server replicas in the pod.",
    assignee: assignees[0],
    updated: "2026-06-24",
  },
  {
    id: "r-260104",
    stigId: "HRZN-8X-000040",
    approvalStatus: "Pending Approval",
    iaControl: "SC-8",
    cci: ["CCI-002418"],
    srg: "SRG-OS-000423-VMM-001700",
    title: "Omnissa Horizon must protect the confidentiality of transmitted configuration and session data using TLS 1.2 or higher.",
    discussion:
      "Without protection of the transmission of information, confidentiality and integrity may be compromised because unprotected communications can be intercepted and either read or altered.",
    status: "Applicable - Configurable",
    check:
      "Verify TLS configuration on the Connection Server.\n\n1. On the Connection Server, open locked.properties.\n2. Confirm 'secureProtocols.1=TLSv1.2' (or higher) and that older protocols are absent.\n\n$ type C:\\Program Files\\Omnissa\\Horizon\\Server\\sslgateway\\conf\\locked.properties\n\nIf TLS 1.2+ is not enforced, this is a finding.",
    fix:
      "Enforce TLS 1.2 on the Connection Server.\n\n1. Edit locked.properties.\n2. Add: secureProtocols.1=TLSv1.2\n           preferredSecureProtocol=TLSv1.2\n3. Restart the Horizon Connection Server service.",
    severity: "CAT I",
    mitigation: "Interim: upstream load balancer terminates TLS 1.2 until server-level enforcement is verified.",
    artifactDescription: "Copy of locked.properties and SSL Labs scan output for the Connection Server FQDN.",
    statusJustification: "Awaiting approver confirmation of scan artifact.",
    notes: "Coordinate restart window with the VDI operations team.",
    assignee: assignees[1],
    updated: "2026-06-24",
  },
  {
    id: "r-260108",
    stigId: "HRZN-8X-000080",
    approvalStatus: "Returned",
    iaControl: "AC-11",
    cci: ["CCI-000057"],
    srg: "SRG-OS-000029-VMM-000110",
    title: "Omnissa Horizon must terminate idle administrative sessions after 15 minutes of inactivity.",
    discussion:
      "A session time-out lock is a temporary action taken when a user stops work and moves away from the immediate vicinity of the system but does not log out.",
    status: "Applicable - Does Not Meet",
    check:
      "Verify the Horizon Console session timeout.\n\n1. Navigate to Settings >> Global Settings >> General Settings.\n2. Confirm 'Console Session Timeout' is set to 15 minutes or less.\n\nIf the timeout exceeds 15 minutes, this is a finding.",
    fix:
      "Set the Horizon Console session timeout.\n\n1. Settings >> Global Settings >> General Settings >> Edit.\n2. Set 'Console Session Timeout' to 15.\n3. Click OK.",
    severity: "CAT II",
    mitigation: "None.",
    artifactDescription: "Screenshot of Global Settings showing the 15-minute console timeout.",
    statusJustification: "Returned by approver — check text must reference the Forced Logoff setting for client sessions as well.",
    notes: "Split client-session timeout into a separate rule (HRZN-8X-000081).",
    assignee: assignees[0],
    updated: "2026-06-23",
  },
  {
    id: "r-260112",
    stigId: "HRZN-8X-000120",
    approvalStatus: "Pending Approval",
    iaControl: "AU-4",
    cci: ["CCI-001849"],
    srg: "SRG-OS-000341-VMM-001220",
    title: "Omnissa Horizon must allocate audit record storage capacity to retain at least one week of event logs.",
    discussion:
      "In order to ensure sufficient storage capacity for the audit logs, the application must be able to allocate audit record storage capacity.",
    status: "Applicable - Does Not Meet",
    check:
      "Verify event database retention.\n\n1. Navigate to Settings >> Event Configuration.\n2. Confirm 'Show events for' and log retention meet the one-week minimum.\n\nIf retention is less than 7 days, this is a finding.",
    fix:
      "Configure the Horizon event database retention to a minimum of 7 days in Settings >> Event Configuration.",
    severity: "CAT III",
    mitigation: "External syslog forwarding retains 90 days of events as a compensating control.",
    artifactDescription: "Event Configuration screenshot and syslog retention policy document.",
    statusJustification: "Event DB currently retains 3 days — remediation planned.",
    notes: "Verify event DB disk sizing before submitting for review.",
    assignee: assignees[2],
    updated: "2026-06-21",
  },
  {
    id: "r-260117",
    stigId: "HRZN-8X-000170",
    approvalStatus: "Approved",
    iaControl: "IA-2",
    cci: ["CCI-000765"],
    srg: "SRG-OS-000105-VMM-000530",
    title: "Omnissa Horizon must enforce multifactor authentication for administrative access to the Connection Server.",
    discussion:
      "Multifactor authentication requires the use of two or more different factors to achieve authentication and significantly reduces the risk of credential compromise.",
    status: "Applicable - Inherently Meets",
    check:
      "Verify MFA is enabled for the Horizon Console.\n\n1. Navigate to Settings >> Servers >> Connection Servers >> Authentication.\n2. Confirm a 2-factor authenticator (RADIUS or SAML) is configured and enforced for administrators.\n\nIf MFA is not enforced, this is a finding.",
    fix:
      "Configure a 2-factor authenticator under Settings >> Servers >> Connection Servers >> Authentication and set enforcement to Required.",
    severity: "CAT I",
    mitigation: "None.",
    artifactDescription: "Authentication configuration screenshot and IdP SAML metadata.",
    statusJustification: "SAML MFA validated with the enterprise IdP on 2026-06-19.",
    notes: "SAML integration uses the enterprise PIV/CAC IdP.",
    assignee: assignees[3],
    updated: "2026-06-24",
  },
  {
    id: "r-260123",
    stigId: "HRZN-8X-000230",
    approvalStatus: "Pending Approval",
    iaControl: "CM-6",
    cci: ["CCI-000366"],
    srg: "SRG-OS-000480-VMM-002000",
    title: "Omnissa Horizon Agent must disable clipboard redirection from the remote session to the client by default.",
    discussion:
      "Uncontrolled clipboard redirection can be used to exfiltrate sensitive data from the virtual desktop to the endpoint.",
    status: "Applicable - Configurable",
    check:
      "Verify the Horizon Agent clipboard policy.\n\n1. In the GPO, review VMware View Agent Configuration >> Clipboard redirection.\n2. Confirm redirection is set to 'Disabled' or 'Client to server only'.\n\nIf clipboard redirection is enabled bidirectionally, this is a finding.",
    fix:
      "Set the Horizon Agent 'Configure clipboard redirection' policy to 'Disabled' or 'Client to server only' via GPO and apply to all desktop pools.",
    severity: "CAT II",
    mitigation: "DLP endpoint agent monitors clipboard events as a compensating control.",
    artifactDescription: "GPO export showing the clipboard redirection setting.",
    statusJustification: "Awaiting approver review of the GPO artifact.",
    notes: "Confirm the policy applies to instant-clone pools.",
    assignee: assignees[0],
    updated: "2026-06-23",
  },
  {
    id: "r-260130",
    stigId: "HRZN-8X-000300",
    approvalStatus: "Pending Approval",
    iaControl: "SC-23",
    cci: ["CCI-001184"],
    srg: "SRG-OS-000250-VMM-000860",
    title: "Omnissa Horizon must use FIPS 140-2 validated cryptographic modules for all encryption operations.",
    discussion:
      "Use of weak or untested encryption algorithms undermines the purposes of using encryption to protect data.",
    status: "Applicable - Does Not Meet",
    check:
      "Verify FIPS mode is enabled during Horizon installation.\n\n1. Review the Connection Server installation configuration.\n2. Confirm 'Install in FIPS mode' was selected.\n\nIf FIPS mode is not enabled, this is a finding.",
    fix:
      "Reinstall or reconfigure the Horizon Connection Server with FIPS mode enabled. Note: FIPS mode must be selected at install time.",
    severity: "CAT II",
    mitigation: "None.",
    artifactDescription: "Installation log or registry export confirming FIPS mode.",
    statusJustification: "FIPS mode was not selected at install; rebuild required.",
    notes: "FIPS mode selection is install-time only; plan for a rebuild if not set.",
    assignee: assignees[2],
    updated: "2026-06-20",
  },
  {
    id: "r-260136",
    stigId: "HRZN-8X-000360",
    approvalStatus: "Approved",
    iaControl: "AC-17",
    cci: ["CCI-000068"],
    srg: "SRG-OS-000033-VMM-000140",
    title: "Omnissa Horizon must encrypt all Blast Extreme remote display protocol sessions.",
    discussion:
      "Remote access protocols that transmit unencrypted session data expose keystrokes and screen content to interception.",
    status: "Applicable - Inherently Meets",
    check:
      "Verify Blast Secure Gateway is enabled.\n\n1. Navigate to Settings >> Servers >> Connection Servers >> Edit >> Connection Server Backup.\n2. Confirm 'Use Blast Secure Gateway for Blast connections to machine' is enabled.\n\nIf disabled, this is a finding.",
    fix:
      "Enable the Blast Secure Gateway on each Connection Server so all Blast Extreme sessions are tunneled and encrypted.",
    severity: "CAT II",
    mitigation: "None.",
    artifactDescription: "Connection Server settings screenshot showing Blast Secure Gateway enabled.",
    statusJustification: "Validated on all replicas 2026-06-18.",
    notes: "Applies to external and internal connections.",
    assignee: assignees[1],
    updated: "2026-06-24",
  },
];

// STIG-ID lookup by internal id (used by reference tables below)
export const stigIdOf = (id) => (requirements.find((r) => r.id === id) || {}).stigId || id;

// keyed by internal id
export const comments = {
  "r-260108": [
    { author: "Sam Whitfield", initials: "SW", role: "Approver", time: "2026-06-23 14:22", text: "The check only covers the console session timeout. Client session forced-logoff needs to be addressed for full coverage." },
    { author: "Teena Brinkley", initials: "TB", role: "Author", time: "2026-06-23 15:01", text: "Understood — splitting client session forced-logoff into HRZN-8X-000081 and revising this rule to console scope." },
    { author: "Sam Whitfield", initials: "SW", role: "Approver", time: "2026-06-23 15:40", text: "Returned for that revision. Ping me when ready to re-submit." },
    { author: "Aaron Kegrreis", initials: "AK", role: "Senior Review", time: "2026-06-24 08:15", text: "Moderator note: hold this in Tech Edit until the forced-logoff split is verified. Do not advance to PMRC yet." },
  ],
  "r-260104": [
    { author: "Marcus Reilly", initials: "MR", role: "Author", time: "2026-06-24 09:10", text: "Added locked.properties reference and SSL Labs artifact. Submitting for approval." },
    { author: "Joe Vendor", initials: "JV", role: "Reviewer", time: "2026-06-24 10:32", text: "Confirm the preferredSecureProtocol line is also present before approval." },
  ],
  "r-260101": [
    { author: "Joe Vendor", initials: "JV", role: "Approver", time: "2026-06-20 08:00", text: "Approved. Banner verbiage matches the DoD standard." },
  ],
  "r-260117": [
    { author: "Aaron Kegrreis", initials: "AK", role: "Senior Review", time: "2026-06-24 16:05", text: "Senior review: MFA rule looks solid. Approving the draft to advance toward Tech Edit." },
  ],
  "r-260130": [
    { author: "Aaron Kegrreis", initials: "AK", role: "Senior Review", time: "2026-06-24 16:20", text: "Senior review: FIPS rebuild dependency must be documented in the artifact before this can move to PMRC." },
  ],
};

export const revisions = {
  "r-260108": [
    { time: "2026-06-23 15:40", author: "Sam Whitfield", field: "Approval Status", from: "Pending Approval", to: "Returned" },
    { time: "2026-06-23 15:00", author: "Teena Brinkley", field: "Status Justification", from: "Ready for approval.", to: "Returned — must reference Forced Logoff." },
    { time: "2026-06-22 11:20", author: "Teena Brinkley", field: "Status", from: "Applicable Configurable", to: "Does Not Meet" },
    { time: "2026-06-21 09:15", author: "Teena Brinkley", field: "Check", from: "session timeout note", to: "Console Session Timeout <= 15" },
  ],
};

// audit target references internal id
export const auditLog = [
  { time: "2026-06-24 15:41", user: "Joe Vendor", action: "Approved requirement", target: "r-260117", type: "approve" },
  { time: "2026-06-24 10:32", user: "Joe Vendor", action: "Commented on", target: "r-260104", type: "comment" },
  { time: "2026-06-24 09:10", user: "Marcus Reilly", action: "Edited Check content", target: "r-260104", type: "edit" },
  { time: "2026-06-23 15:40", user: "Sam Whitfield", action: "Returned for revision", target: "r-260108", type: "status" },
  { time: "2026-06-23 15:01", user: "Teena Brinkley", action: "Commented on", target: "r-260108", type: "comment" },
  { time: "2026-06-23 15:00", user: "Teena Brinkley", action: "Edited Status Justification", target: "r-260108", type: "edit" },
  { time: "2026-06-23 11:20", user: "Sam Whitfield", action: "Assigned requirement", target: "r-260123", type: "assign" },
  { time: "2026-06-21 16:44", user: "Teena Brinkley", action: "Created requirement", target: "r-260112", type: "create" },
  { time: "2026-06-20 11:20", user: "Teena Brinkley", action: "Edited Fix content", target: "r-260101", type: "edit" },
  { time: "2026-06-19 09:15", user: "Teena Brinkley", action: "Submitted for review", target: "r-260117", type: "status" },
];

export const srgTree = [
  {
    id: "SRG-OS-000023-VMM-000060",
    title: "The virtualization management server must display the Standard Mandatory DoD Notice and Consent Banner before granting access.",
    severity: "CAT II",
    derived: [
      { rid: "r-260101", title: "Horizon Connection Server must display the DoD banner (admin console).", mapped: true },
    ],
  },
  {
    id: "SRG-OS-000105-VMM-000530",
    title: "The virtualization management server must use multifactor authentication for privileged accounts.",
    severity: "CAT I",
    derived: [
      { rid: "r-260117", title: "Horizon must enforce MFA for administrative access.", mapped: true },
    ],
  },
  {
    id: "SRG-OS-000423-VMM-001700",
    title: "The virtualization management server must protect the confidentiality of transmitted information.",
    severity: "CAT I",
    derived: [
      { rid: "r-260104", title: "Horizon must protect transmitted data using TLS 1.2+.", mapped: true },
    ],
  },
  {
    id: "SRG-OS-000029-VMM-000110",
    title: "The virtualization management server must initiate a session lock after an inactivity period.",
    severity: "CAT II",
    derived: [
      { rid: "r-260108", title: "Horizon must terminate idle admin sessions after 15 minutes.", mapped: true },
    ],
  },
  {
    id: "SRG-OS-000250-VMM-000860",
    title: "The virtualization management server must implement cryptographic mechanisms using FIPS-validated modules.",
    severity: "CAT II",
    derived: [],
  },
];

export const ccis = [
  { id: "CCI-000048", def: "The information system displays an organization-defined system use notification message or banner before granting access.", nist: "AC-8 a", mappedRules: ["r-260101"] },
  { id: "CCI-000050", def: "The information system retains the notification message or banner on the screen until users acknowledge the usage conditions.", nist: "AC-8 b", mappedRules: ["r-260101"] },
  { id: "CCI-000057", def: "The information system initiates a session lock after an organization-defined time period of inactivity.", nist: "AC-11 a", mappedRules: ["r-260108"] },
  { id: "CCI-000068", def: "The information system implements cryptographic mechanisms to protect the confidentiality of remote access sessions.", nist: "AC-17 (2)", mappedRules: ["r-260136"] },
  { id: "CCI-000366", def: "The organization implements the security configuration settings.", nist: "CM-6 b", mappedRules: ["r-260123"] },
  { id: "CCI-000765", def: "The information system implements multifactor authentication for network access to privileged accounts.", nist: "IA-2 (1)", mappedRules: ["r-260117"] },
  { id: "CCI-001184", def: "The information system protects the authenticity of communications sessions.", nist: "SC-23", mappedRules: ["r-260130"] },
  { id: "CCI-001849", def: "The organization allocates audit record storage capacity in accordance with organization-defined audit record storage requirements.", nist: "AU-4", mappedRules: ["r-260112"] },
  { id: "CCI-002418", def: "The information system protects the confidentiality and/or integrity of transmitted information.", nist: "SC-8", mappedRules: ["r-260104"] },
];

// AI-simulated CCI mapping accuracy findings (MOCKED). rid references internal id.
export const cciAudit = [
  {
    rid: "r-260123",
    title: "Horizon Agent must disable clipboard redirection from the remote session to the client by default.",
    currentCci: "CCI-000366",
    currentNist: "CM-6 b",
    confidence: 0.91,
    issue: "Requirement restricts a data-flow (clipboard) rather than a generic configuration setting. CCI-000366 (CM-6) is a catch-all and understates the data-loss intent.",
    suggestedCci: "CCI-001414",
    suggestedNist: "AC-4",
    reason: "AC-4 (Information Flow Enforcement) directly governs restricting information transfer between the session and endpoint, matching the clipboard-redirection control.",
  },
  {
    rid: "r-260130",
    title: "Horizon must use FIPS 140-2 validated cryptographic modules for all encryption operations.",
    currentCci: "CCI-001184",
    currentNist: "SC-23",
    confidence: 0.87,
    issue: "CCI-001184 (SC-23, session authenticity) does not address FIPS-validated module usage. The requirement is about cryptographic module validation.",
    suggestedCci: "CCI-002450",
    suggestedNist: "SC-13",
    reason: "SC-13 (Cryptographic Protection) with CCI-002450 explicitly requires FIPS-validated cryptography, precisely matching the requirement text.",
  },
  {
    rid: "r-260112",
    title: "Horizon must allocate audit record storage capacity to retain at least one week of event logs.",
    currentCci: "CCI-001849",
    currentNist: "AU-4",
    confidence: 0.62,
    issue: "CCI-001849 (AU-4) covers storage capacity but not the retention period. The one-week retention aspect is better represented by AU-11.",
    suggestedCci: "CCI-001914",
    suggestedNist: "AU-11",
    reason: "AU-11 (Audit Record Retention) addresses the retention duration; consider mapping both AU-4 and AU-11 for complete coverage.",
  },
];

export const SEVERITIES = ["CAT I", "CAT II", "CAT III"];
export const STATUSES = ["", "Applicable - Configurable", "Applicable - Does Not Meet", "Applicable - Inherently Meets", "Not Applicable"];
export const APPROVAL_STATUSES = ["Approved", "Pending Approval", "Returned"];

export const GROUP_BY_OPTIONS = [
  { value: "none", label: "No grouping" },
  { value: "severity", label: "Severity" },
  { value: "status", label: "Status" },
  { value: "approvalStatus", label: "Approval Status" },
  { value: "srg", label: "SRG ID" },
  { value: "iaControl", label: "IA Control" },
];

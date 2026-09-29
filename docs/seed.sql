-- =============================================================================
-- STIG Portal - SEED DATA (static, generated)
-- Generated: 2026-09-29T02:41:39.175Z  by scripts/export_sql.mjs
-- Source of truth: src/server/normalizedSeed.js (do not hand-edit this file)
--
-- HOW TO LOAD:
--   1) psql "$DATABASE_URL" -f docs/schema.sql     (create tables)
--   2) psql "$DATABASE_URL" -f docs/seed.sql        (this file - insert data)
--
-- UUIDs are deterministic for review stability. ON CONFLICT DO NOTHING makes
-- re-running safe (idempotent).
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- vendor  (3 rows)
INSERT INTO vendor (vendor_id, vendor_name, vendor_code, vendor_org, active) VALUES
  ('00000000-0000-4000-8000-000000000019', 'Omnissa', 'OMNISSA', 'Omnissa', TRUE),
  ('00000000-0000-4000-8000-00000000001c', 'SUSE', 'SUSE', 'Rancher', TRUE),
  ('00000000-0000-4000-8000-00000000001f', 'Adobe', 'ADOBE', 'Adobe', TRUE)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- app_user  (8 rows)
INSERT INTO app_user (user_id, username, display_name, initials, is_global, active) VALUES
  ('00000000-0000-4000-8000-000000000001', 'David Shultz', 'David Shultz', 'DS', FALSE, TRUE),
  ('00000000-0000-4000-8000-000000000002', 'Joe Vendor', 'Joe Vendor', 'JV', FALSE, TRUE),
  ('00000000-0000-4000-8000-000000000003', 'Teena Brinkley', 'Teena Brinkley', 'TB', FALSE, TRUE),
  ('00000000-0000-4000-8000-000000000004', 'PMRC', 'PMRC', 'PM', TRUE, TRUE),
  ('00000000-0000-4000-8000-000000000005', 'Aaron Kegrreis', 'Aaron Kegrreis', 'AK', FALSE, TRUE),
  ('00000000-0000-4000-8000-000000000006', 'Marcus Reilly', 'Marcus Reilly', 'MR', FALSE, TRUE),
  ('00000000-0000-4000-8000-000000000007', 'Sam Whitfield', 'Sam Whitfield', 'SW', FALSE, TRUE),
  ('00000000-0000-4000-8000-000000000008', 'Dana Okonkwo', 'Dana Okonkwo', 'DO', FALSE, TRUE)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- product  (5 rows)
INSERT INTO product (product_id, vendor_id, product_name, active) VALUES
  ('00000000-0000-4000-8000-00000000001a', '00000000-0000-4000-8000-000000000019', 'Omnissa Horizon 8', TRUE),
  ('00000000-0000-4000-8000-00000000001d', '00000000-0000-4000-8000-00000000001c', 'Rancher RKE2 1.29', TRUE),
  ('00000000-0000-4000-8000-000000000020', '00000000-0000-4000-8000-00000000001f', 'Adobe ColdFusion 2023', TRUE),
  ('00000000-0000-4000-8000-000000000022', '00000000-0000-4000-8000-00000000001c', 'Rancher MCM 2.9', TRUE),
  ('00000000-0000-4000-8000-000000000024', '00000000-0000-4000-8000-00000000001c', 'Rancher Harvester 1.3', TRUE)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- srg  (2 rows)
INSERT INTO srg (srg_id, parent_srg_id, srg_code, srg_name, srg_type, version, release, description, active) VALUES
  ('00000000-0000-4000-8000-000000000012', NULL, 'OS-SRG', 'Operating System SRG', 'CORE', 'V2R1', 'R1', 'Core Operating System Security Requirements Guide.', TRUE),
  ('00000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000012', 'VMM-SRG', 'Virtualization (VMM) SRG', 'DERIVED', 'V1R2', 'R2', 'Virtualization management requirements derived from the OS SRG.', TRUE)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- srg_requirement  (5 rows)
INSERT INTO srg_requirement (srg_requirement_id, srg_id, parent_srg_requirement_id, srg_requirement_code, requirement_text, discussion, check_text, fix_text, severity, default_ia_control, source_version) VALUES
  ('00000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000000013', NULL, 'SRG-OS-000023-VMM-000060', 'The virtualization management server must display the Standard Mandatory DoD Notice and Consent Banner before granting access.', 'Display of a standardized and approved use notification before granting access ensures privacy and security notification verbiage is consistent with applicable federal laws, Executive Orders, directives, policies, regulations, standards, and guidance.', 'Verify the Horizon Connection Server displays the DoD Notice and Consent Banner.

1. Log in to the Horizon Console.
2. Navigate to Settings >> Global Settings >> General Settings.
3. Confirm ''Display a pre-login message'' is enabled and contains the DoD banner text.

If the banner is not displayed, this is a finding.', 'Configure the Horizon Connection Server pre-login banner.

1. In the Horizon Console, go to Settings >> Global Settings >> General Settings >> Edit.
2. Enable ''Display a pre-login message'' and paste the approved DoD banner text.
3. Click OK.', 'CAT_II', 'AC-8', 'V1R2'),
  ('00000000-0000-4000-8000-000000000015', '00000000-0000-4000-8000-000000000013', NULL, 'SRG-OS-000105-VMM-000530', 'The virtualization management server must use multifactor authentication for privileged accounts.', 'Multifactor authentication requires the use of two or more different factors to achieve authentication and significantly reduces the risk of credential compromise.', 'Verify MFA is enabled for the Horizon Console.

1. Navigate to Settings >> Servers >> Connection Servers >> Authentication.
2. Confirm a 2-factor authenticator (RADIUS or SAML) is configured and enforced for administrators.

If MFA is not enforced, this is a finding.', 'Configure a 2-factor authenticator under Settings >> Servers >> Connection Servers >> Authentication and set enforcement to Required.', 'CAT_I', 'IA-2', 'V1R2'),
  ('00000000-0000-4000-8000-000000000016', '00000000-0000-4000-8000-000000000013', NULL, 'SRG-OS-000423-VMM-001700', 'The virtualization management server must protect the confidentiality of transmitted information.', 'Without protection of the transmission of information, confidentiality and integrity may be compromised because unprotected communications can be intercepted and either read or altered.', 'Verify TLS configuration on the Connection Server.

1. On the Connection Server, open locked.properties.
2. Confirm ''secureProtocols.1=TLSv1.2'' (or higher) and that older protocols are absent.

$ type C:\Program Files\Omnissa\Horizon\Server\sslgateway\conf\locked.properties

If TLS 1.2+ is not enforced, this is a finding.', 'Enforce TLS 1.2 on the Connection Server.

1. Edit locked.properties.
2. Add: secureProtocols.1=TLSv1.2
           preferredSecureProtocol=TLSv1.2
3. Restart the Horizon Connection Server service.', 'CAT_I', 'SC-8', 'V1R2'),
  ('00000000-0000-4000-8000-000000000017', '00000000-0000-4000-8000-000000000013', NULL, 'SRG-OS-000029-VMM-000110', 'The virtualization management server must initiate a session lock after an inactivity period.', 'A session time-out lock is a temporary action taken when a user stops work and moves away from the immediate vicinity of the system but does not log out.', 'Verify the Horizon Console session timeout.

1. Navigate to Settings >> Global Settings >> General Settings.
2. Confirm ''Console Session Timeout'' is set to 15 minutes or less.

If the timeout exceeds 15 minutes, this is a finding.', 'Set the Horizon Console session timeout.

1. Settings >> Global Settings >> General Settings >> Edit.
2. Set ''Console Session Timeout'' to 15.
3. Click OK.', 'CAT_II', 'AC-11', 'V1R2'),
  ('00000000-0000-4000-8000-000000000018', '00000000-0000-4000-8000-000000000013', NULL, 'SRG-OS-000250-VMM-000860', 'The virtualization management server must implement cryptographic mechanisms using FIPS-validated modules.', 'Use of weak or untested encryption algorithms undermines the purposes of using encryption to protect data.', 'Verify FIPS mode is enabled during Horizon installation.

1. Review the Connection Server installation configuration.
2. Confirm ''Install in FIPS mode'' was selected.

If FIPS mode is not enabled, this is a finding.', 'Reinstall or reconfigure the Horizon Connection Server with FIPS mode enabled. Note: FIPS mode must be selected at install time.', 'CAT_II', 'SC-23', 'V1R2')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- cci  (9 rows)
INSERT INTO cci (cci_id, cci_number, definition, nist_control, status) VALUES
  ('00000000-0000-4000-8000-000000000009', 'CCI-000048', 'The information system displays an organization-defined system use notification message or banner before granting access.', 'AC-8 a', 'ACTIVE'),
  ('00000000-0000-4000-8000-00000000000a', 'CCI-000050', 'The information system retains the notification message or banner on the screen until users acknowledge the usage conditions.', 'AC-8 b', 'ACTIVE'),
  ('00000000-0000-4000-8000-00000000000b', 'CCI-000057', 'The information system initiates a session lock after an organization-defined time period of inactivity.', 'AC-11 a', 'ACTIVE'),
  ('00000000-0000-4000-8000-00000000000c', 'CCI-000068', 'The information system implements cryptographic mechanisms to protect the confidentiality of remote access sessions.', 'AC-17 (2)', 'ACTIVE'),
  ('00000000-0000-4000-8000-00000000000d', 'CCI-000366', 'The organization implements the security configuration settings.', 'CM-6 b', 'ACTIVE'),
  ('00000000-0000-4000-8000-00000000000e', 'CCI-000765', 'The information system implements multifactor authentication for network access to privileged accounts.', 'IA-2 (1)', 'ACTIVE'),
  ('00000000-0000-4000-8000-00000000000f', 'CCI-001184', 'The information system protects the authenticity of communications sessions.', 'SC-23', 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000010', 'CCI-001849', 'The organization allocates audit record storage capacity in accordance with organization-defined audit record storage requirements.', 'AU-4', 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000011', 'CCI-002418', 'The information system protects the confidentiality and/or integrity of transmitted information.', 'SC-8', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- stig_project  (5 rows)
INSERT INTO stig_project (project_id, vendor_id, product_id, source_srg_id, project_name, stig_version, assigned_writer, created_at, updated_at) VALUES
  ('00000000-0000-4000-8000-00000000001b', '00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-00000000001a', '00000000-0000-4000-8000-000000000012', 'Omnissa Horizon 8 STIG', 'V1R2 (Draft)', '00000000-0000-4000-8000-000000000003', '2026-06-24', '2026-06-24'),
  ('00000000-0000-4000-8000-00000000001e', '00000000-0000-4000-8000-00000000001c', '00000000-0000-4000-8000-00000000001d', '00000000-0000-4000-8000-000000000012', 'Rancher RKE2 STIG', 'V2R1 (Draft)', '00000000-0000-4000-8000-000000000003', '2026-06-22', '2026-06-22'),
  ('00000000-0000-4000-8000-000000000021', '00000000-0000-4000-8000-00000000001f', '00000000-0000-4000-8000-000000000020', '00000000-0000-4000-8000-000000000012', 'Adobe ColdFusion 2023 STIG', 'V1R1 (Draft)', '00000000-0000-4000-8000-000000000006', '2026-06-23', '2026-06-23'),
  ('00000000-0000-4000-8000-000000000023', '00000000-0000-4000-8000-00000000001c', '00000000-0000-4000-8000-000000000022', '00000000-0000-4000-8000-000000000012', 'Rancher MCM STIG', 'V1R1 (Draft)', '00000000-0000-4000-8000-000000000002', '2026-06-24', '2026-06-24'),
  ('00000000-0000-4000-8000-000000000025', '00000000-0000-4000-8000-00000000001c', '00000000-0000-4000-8000-000000000024', '00000000-0000-4000-8000-000000000012', 'Rancher Harvester STIG', 'V1R1 (Draft)', '00000000-0000-4000-8000-000000000002', '2026-06-22', '2026-06-22')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- requirement  (8 rows)
INSERT INTO requirement (requirement_id, vendor_id, project_id, source_srg_requirement_id, srg_id, stig_id, ia_control, requirement_text, vul_discussion, status, check_text, fix_text, severity, mitigation, artifact_description, status_justification, notes, approval_status, current_revision, assigned_to, created_at, updated_at) VALUES
  ('00000000-0000-4000-8000-000000000026', '00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-00000000001b', '00000000-0000-4000-8000-000000000014', 'SRG-OS-000023-VMM-000060', 'HRZN-8X-000010', 'AC-8', 'Omnissa Horizon Connection Server must display the Standard Mandatory DoD Notice and Consent Banner before granting access to the administrative console.', 'Display of a standardized and approved use notification before granting access ensures privacy and security notification verbiage is consistent with applicable federal laws, Executive Orders, directives, policies, regulations, standards, and guidance.', 'INHERENTLY_MEETS', 'Verify the Horizon Connection Server displays the DoD Notice and Consent Banner.

1. Log in to the Horizon Console.
2. Navigate to Settings >> Global Settings >> General Settings.
3. Confirm ''Display a pre-login message'' is enabled and contains the DoD banner text.

If the banner is not displayed, this is a finding.', 'Configure the Horizon Connection Server pre-login banner.

1. In the Horizon Console, go to Settings >> Global Settings >> General Settings >> Edit.
2. Enable ''Display a pre-login message'' and paste the approved DoD banner text.
3. Click OK.', 'CAT_II', 'N/A — control is fully implemented via the Global Settings pre-login message.', 'Screenshot of Global Settings showing the enabled DoD pre-login banner text.', 'Banner text validated against the DoD standard verbiage on 2026-06-20.', 'Applies to all Connection Server replicas in the pod.', 'APPROVED', 1, '00000000-0000-4000-8000-000000000003', '2026-06-24', '2026-06-24'),
  ('00000000-0000-4000-8000-000000000027', '00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-00000000001b', '00000000-0000-4000-8000-000000000016', 'SRG-OS-000423-VMM-001700', 'HRZN-8X-000040', 'SC-8', 'Omnissa Horizon must protect the confidentiality of transmitted configuration and session data using TLS 1.2 or higher.', 'Without protection of the transmission of information, confidentiality and integrity may be compromised because unprotected communications can be intercepted and either read or altered.', 'CONFIGURABLE', 'Verify TLS configuration on the Connection Server.

1. On the Connection Server, open locked.properties.
2. Confirm ''secureProtocols.1=TLSv1.2'' (or higher) and that older protocols are absent.

$ type C:\Program Files\Omnissa\Horizon\Server\sslgateway\conf\locked.properties

If TLS 1.2+ is not enforced, this is a finding.', 'Enforce TLS 1.2 on the Connection Server.

1. Edit locked.properties.
2. Add: secureProtocols.1=TLSv1.2
           preferredSecureProtocol=TLSv1.2
3. Restart the Horizon Connection Server service.', 'CAT_I', 'Interim: upstream load balancer terminates TLS 1.2 until server-level enforcement is verified.', 'Copy of locked.properties and SSL Labs scan output for the Connection Server FQDN.', 'Awaiting approver confirmation of scan artifact.', 'Coordinate restart window with the VDI operations team.', 'PENDING_APPROVAL', 1, '00000000-0000-4000-8000-000000000006', '2026-06-24', '2026-06-24'),
  ('00000000-0000-4000-8000-000000000028', '00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-00000000001b', '00000000-0000-4000-8000-000000000017', 'SRG-OS-000029-VMM-000110', 'HRZN-8X-000080', 'AC-11', 'Omnissa Horizon must terminate idle administrative sessions after 15 minutes of inactivity.', 'A session time-out lock is a temporary action taken when a user stops work and moves away from the immediate vicinity of the system but does not log out.', 'DOES_NOT_MEET', 'Verify the Horizon Console session timeout.

1. Navigate to Settings >> Global Settings >> General Settings.
2. Confirm ''Console Session Timeout'' is set to 15 minutes or less.

If the timeout exceeds 15 minutes, this is a finding.', 'Set the Horizon Console session timeout.

1. Settings >> Global Settings >> General Settings >> Edit.
2. Set ''Console Session Timeout'' to 15.
3. Click OK.', 'CAT_II', 'None.', 'Screenshot of Global Settings showing the 15-minute console timeout.', 'Returned by approver — check text must reference the Forced Logoff setting for client sessions as well.', 'Split client-session timeout into a separate rule (HRZN-8X-000081).', 'RETURNED', 1, '00000000-0000-4000-8000-000000000003', '2026-06-23', '2026-06-23'),
  ('00000000-0000-4000-8000-000000000029', '00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-00000000001b', NULL, 'SRG-OS-000341-VMM-001220', 'HRZN-8X-000120', 'AU-4', 'Omnissa Horizon must allocate audit record storage capacity to retain at least one week of event logs.', 'In order to ensure sufficient storage capacity for the audit logs, the application must be able to allocate audit record storage capacity.', 'DOES_NOT_MEET', 'Verify event database retention.

1. Navigate to Settings >> Event Configuration.
2. Confirm ''Show events for'' and log retention meet the one-week minimum.

If retention is less than 7 days, this is a finding.', 'Configure the Horizon event database retention to a minimum of 7 days in Settings >> Event Configuration.', 'CAT_III', 'External syslog forwarding retains 90 days of events as a compensating control.', 'Event Configuration screenshot and syslog retention policy document.', 'Event DB currently retains 3 days — remediation planned.', 'Verify event DB disk sizing before submitting for review.', 'PENDING_APPROVAL', 1, '00000000-0000-4000-8000-000000000002', '2026-06-21', '2026-06-21'),
  ('00000000-0000-4000-8000-00000000002a', '00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-00000000001b', '00000000-0000-4000-8000-000000000015', 'SRG-OS-000105-VMM-000530', 'HRZN-8X-000170', 'IA-2', 'Omnissa Horizon must enforce multifactor authentication for administrative access to the Connection Server.', 'Multifactor authentication requires the use of two or more different factors to achieve authentication and significantly reduces the risk of credential compromise.', 'INHERENTLY_MEETS', 'Verify MFA is enabled for the Horizon Console.

1. Navigate to Settings >> Servers >> Connection Servers >> Authentication.
2. Confirm a 2-factor authenticator (RADIUS or SAML) is configured and enforced for administrators.

If MFA is not enforced, this is a finding.', 'Configure a 2-factor authenticator under Settings >> Servers >> Connection Servers >> Authentication and set enforcement to Required.', 'CAT_I', 'None.', 'Authentication configuration screenshot and IdP SAML metadata.', 'SAML MFA validated with the enterprise IdP on 2026-06-19.', 'SAML integration uses the enterprise PIV/CAC IdP.', 'APPROVED', 1, '00000000-0000-4000-8000-000000000007', '2026-06-24', '2026-06-24'),
  ('00000000-0000-4000-8000-00000000002b', '00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-00000000001b', NULL, 'SRG-OS-000480-VMM-002000', 'HRZN-8X-000230', 'CM-6', 'Omnissa Horizon Agent must disable clipboard redirection from the remote session to the client by default.', 'Uncontrolled clipboard redirection can be used to exfiltrate sensitive data from the virtual desktop to the endpoint.', 'CONFIGURABLE', 'Verify the Horizon Agent clipboard policy.

1. In the GPO, review VMware View Agent Configuration >> Clipboard redirection.
2. Confirm redirection is set to ''Disabled'' or ''Client to server only''.

If clipboard redirection is enabled bidirectionally, this is a finding.', 'Set the Horizon Agent ''Configure clipboard redirection'' policy to ''Disabled'' or ''Client to server only'' via GPO and apply to all desktop pools.', 'CAT_II', 'DLP endpoint agent monitors clipboard events as a compensating control.', 'GPO export showing the clipboard redirection setting.', 'Awaiting approver review of the GPO artifact.', 'Confirm the policy applies to instant-clone pools.', 'PENDING_APPROVAL', 1, '00000000-0000-4000-8000-000000000003', '2026-06-23', '2026-06-23'),
  ('00000000-0000-4000-8000-00000000002c', '00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-00000000001b', '00000000-0000-4000-8000-000000000018', 'SRG-OS-000250-VMM-000860', 'HRZN-8X-000300', 'SC-23', 'Omnissa Horizon must use FIPS 140-2 validated cryptographic modules for all encryption operations.', 'Use of weak or untested encryption algorithms undermines the purposes of using encryption to protect data.', 'DOES_NOT_MEET', 'Verify FIPS mode is enabled during Horizon installation.

1. Review the Connection Server installation configuration.
2. Confirm ''Install in FIPS mode'' was selected.

If FIPS mode is not enabled, this is a finding.', 'Reinstall or reconfigure the Horizon Connection Server with FIPS mode enabled. Note: FIPS mode must be selected at install time.', 'CAT_II', 'None.', 'Installation log or registry export confirming FIPS mode.', 'FIPS mode was not selected at install; rebuild required.', 'FIPS mode selection is install-time only; plan for a rebuild if not set.', 'PENDING_APPROVAL', 1, '00000000-0000-4000-8000-000000000002', '2026-06-20', '2026-06-20'),
  ('00000000-0000-4000-8000-00000000002d', '00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-00000000001b', NULL, 'SRG-OS-000033-VMM-000140', 'HRZN-8X-000360', 'AC-17', 'Omnissa Horizon must encrypt all Blast Extreme remote display protocol sessions.', 'Remote access protocols that transmit unencrypted session data expose keystrokes and screen content to interception.', 'INHERENTLY_MEETS', 'Verify Blast Secure Gateway is enabled.

1. Navigate to Settings >> Servers >> Connection Servers >> Edit >> Connection Server Backup.
2. Confirm ''Use Blast Secure Gateway for Blast connections to machine'' is enabled.

If disabled, this is a finding.', 'Enable the Blast Secure Gateway on each Connection Server so all Blast Extreme sessions are tunneled and encrypted.', 'CAT_II', 'None.', 'Connection Server settings screenshot showing Blast Secure Gateway enabled.', 'Validated on all replicas 2026-06-18.', 'Applies to external and internal connections.', 'APPROVED', 1, '00000000-0000-4000-8000-000000000006', '2026-06-24', '2026-06-24')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- requirement_cci  (9 rows)
INSERT INTO requirement_cci (requirement_id, cci_id) VALUES
  ('00000000-0000-4000-8000-000000000026', '00000000-0000-4000-8000-000000000009'),
  ('00000000-0000-4000-8000-000000000026', '00000000-0000-4000-8000-00000000000a'),
  ('00000000-0000-4000-8000-000000000027', '00000000-0000-4000-8000-000000000011'),
  ('00000000-0000-4000-8000-000000000028', '00000000-0000-4000-8000-00000000000b'),
  ('00000000-0000-4000-8000-000000000029', '00000000-0000-4000-8000-000000000010'),
  ('00000000-0000-4000-8000-00000000002a', '00000000-0000-4000-8000-00000000000e'),
  ('00000000-0000-4000-8000-00000000002b', '00000000-0000-4000-8000-00000000000d'),
  ('00000000-0000-4000-8000-00000000002c', '00000000-0000-4000-8000-00000000000f'),
  ('00000000-0000-4000-8000-00000000002d', '00000000-0000-4000-8000-00000000000c')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- comment  (9 rows)
INSERT INTO comment (vendor_id, requirement_id, comment_text, created_by, created_at) VALUES
  ('00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000028', 'The check only covers the console session timeout. Client session forced-logoff needs to be addressed for full coverage.', '00000000-0000-4000-8000-000000000007', '2026-06-23 14:22'),
  ('00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000028', 'Understood — splitting client session forced-logoff into HRZN-8X-000081 and revising this rule to console scope.', '00000000-0000-4000-8000-000000000003', '2026-06-23 15:01'),
  ('00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000028', 'Returned for that revision. Ping me when ready to re-submit.', '00000000-0000-4000-8000-000000000007', '2026-06-23 15:40'),
  ('00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000028', 'Moderator note: hold this in Tech Edit until the forced-logoff split is verified. Do not advance to PMRC yet.', '00000000-0000-4000-8000-000000000005', '2026-06-24 08:15'),
  ('00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000027', 'Added locked.properties reference and SSL Labs artifact. Submitting for approval.', '00000000-0000-4000-8000-000000000006', '2026-06-24 09:10'),
  ('00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000027', 'Confirm the preferredSecureProtocol line is also present before approval.', '00000000-0000-4000-8000-000000000002', '2026-06-24 10:32'),
  ('00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000026', 'Approved. Banner verbiage matches the DoD standard.', '00000000-0000-4000-8000-000000000002', '2026-06-20 08:00'),
  ('00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-00000000002a', 'Senior review: MFA rule looks solid. Approving the draft to advance toward Tech Edit.', '00000000-0000-4000-8000-000000000005', '2026-06-24 16:05'),
  ('00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-00000000002c', 'Senior review: FIPS rebuild dependency must be documented in the artifact before this can move to PMRC.', '00000000-0000-4000-8000-000000000005', '2026-06-24 16:20')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- requirement_field_change  (4 rows)
INSERT INTO requirement_field_change (requirement_id, vendor_id, field_name, old_value, new_value, changed_by, changed_at) VALUES
  ('00000000-0000-4000-8000-000000000028', '00000000-0000-4000-8000-000000000019', 'Approval Status', 'Pending Approval', 'Returned', '00000000-0000-4000-8000-000000000007', '2026-06-23 15:40'),
  ('00000000-0000-4000-8000-000000000028', '00000000-0000-4000-8000-000000000019', 'Status Justification', 'Ready for approval.', 'Returned — must reference Forced Logoff.', '00000000-0000-4000-8000-000000000003', '2026-06-23 15:00'),
  ('00000000-0000-4000-8000-000000000028', '00000000-0000-4000-8000-000000000019', 'Status', 'Applicable Configurable', 'Does Not Meet', '00000000-0000-4000-8000-000000000003', '2026-06-22 11:20'),
  ('00000000-0000-4000-8000-000000000028', '00000000-0000-4000-8000-000000000019', 'Check', 'session timeout note', 'Console Session Timeout <= 15', '00000000-0000-4000-8000-000000000003', '2026-06-21 09:15')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- requirement_test  (11 rows)
INSERT INTO requirement_test (test_id, requirement_id, vendor_id, determination_status, security_feature_met, check_valid, fix_valid, inspec_control, test_comments, tested_by, tested_at) VALUES
  ('00000000-0000-4000-8000-00000000002e', '00000000-0000-4000-8000-000000000026', '00000000-0000-4000-8000-000000000019', 'INHERENTLY_MEETS', TRUE, TRUE, TRUE, 'inspec-hrzn-8x-000010', 'Validated: security feature confirmed present and effective per the check procedure.', '00000000-0000-4000-8000-000000000003', '2026-06-24'),
  ('00000000-0000-4000-8000-00000000002f', '00000000-0000-4000-8000-000000000026', '00000000-0000-4000-8000-000000000019', 'DOES_NOT_MEET', FALSE, FALSE, TRUE, 'inspec-hrzn-8x-000010', 'Initial validation failed; requirement returned to vendor for remediation.', '00000000-0000-4000-8000-000000000003', '2026-06-24'),
  ('00000000-0000-4000-8000-000000000030', '00000000-0000-4000-8000-000000000027', '00000000-0000-4000-8000-000000000019', 'CONFIGURABLE', TRUE, FALSE, TRUE, 'inspec-hrzn-8x-000040', 'Check procedure could not be validated as written; step references an unavailable path.', '00000000-0000-4000-8000-000000000006', '2026-06-24'),
  ('00000000-0000-4000-8000-000000000031', '00000000-0000-4000-8000-000000000028', '00000000-0000-4000-8000-000000000019', 'DOES_NOT_MEET', FALSE, TRUE, TRUE, 'inspec-hrzn-8x-000080', 'Security feature not met; remediation required before approval.', '00000000-0000-4000-8000-000000000003', '2026-06-23'),
  ('00000000-0000-4000-8000-000000000032', '00000000-0000-4000-8000-000000000029', '00000000-0000-4000-8000-000000000019', 'DOES_NOT_MEET', FALSE, TRUE, FALSE, 'inspec-hrzn-8x-000120', 'Fix procedure applied but did not fully remediate on first pass; follow-up scheduled.', '00000000-0000-4000-8000-000000000002', '2026-06-21'),
  ('00000000-0000-4000-8000-000000000033', '00000000-0000-4000-8000-000000000029', '00000000-0000-4000-8000-000000000019', 'DOES_NOT_MEET', FALSE, FALSE, TRUE, 'inspec-hrzn-8x-000120', 'Initial validation failed; requirement returned to vendor for remediation.', '00000000-0000-4000-8000-000000000002', '2026-06-21'),
  ('00000000-0000-4000-8000-000000000034', '00000000-0000-4000-8000-00000000002a', '00000000-0000-4000-8000-000000000019', 'INHERENTLY_MEETS', TRUE, TRUE, TRUE, 'inspec-hrzn-8x-000170', 'Validated: security feature confirmed present and effective per the check procedure.', '00000000-0000-4000-8000-000000000007', '2026-06-24'),
  ('00000000-0000-4000-8000-000000000035', '00000000-0000-4000-8000-00000000002b', '00000000-0000-4000-8000-000000000019', 'CONFIGURABLE', TRUE, TRUE, TRUE, 'inspec-hrzn-8x-000230', 'Validated: security feature confirmed present and effective per the check procedure.', '00000000-0000-4000-8000-000000000003', '2026-06-23'),
  ('00000000-0000-4000-8000-000000000036', '00000000-0000-4000-8000-00000000002c', '00000000-0000-4000-8000-000000000019', 'DOES_NOT_MEET', FALSE, FALSE, TRUE, 'inspec-hrzn-8x-000300', 'Check procedure could not be validated as written; step references an unavailable path.', '00000000-0000-4000-8000-000000000002', '2026-06-20'),
  ('00000000-0000-4000-8000-000000000037', '00000000-0000-4000-8000-00000000002c', '00000000-0000-4000-8000-000000000019', 'DOES_NOT_MEET', FALSE, FALSE, TRUE, 'inspec-hrzn-8x-000300', 'Initial validation failed; requirement returned to vendor for remediation.', '00000000-0000-4000-8000-000000000002', '2026-06-20'),
  ('00000000-0000-4000-8000-000000000038', '00000000-0000-4000-8000-00000000002d', '00000000-0000-4000-8000-000000000019', 'INHERENTLY_MEETS', TRUE, TRUE, TRUE, 'inspec-hrzn-8x-000360', 'Validated: security feature confirmed present and effective per the check procedure.', '00000000-0000-4000-8000-000000000006', '2026-06-24')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- audit_event  (10 rows)
INSERT INTO audit_event (vendor_id, user_id, event_type, object_type, object_id, action, result, ts) VALUES
  ('00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000002', 'APPROVE', 'REQUIREMENT', '00000000-0000-4000-8000-00000000002a', 'Approved requirement', 'SUCCESS', '2026-06-24 15:41'),
  ('00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000002', 'COMMENT', 'REQUIREMENT', '00000000-0000-4000-8000-000000000027', 'Commented on', 'SUCCESS', '2026-06-24 10:32'),
  ('00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000006', 'EDIT', 'REQUIREMENT', '00000000-0000-4000-8000-000000000027', 'Edited Check content', 'SUCCESS', '2026-06-24 09:10'),
  ('00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000007', 'STATUS', 'REQUIREMENT', '00000000-0000-4000-8000-000000000028', 'Returned for revision', 'SUCCESS', '2026-06-23 15:40'),
  ('00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000003', 'COMMENT', 'REQUIREMENT', '00000000-0000-4000-8000-000000000028', 'Commented on', 'SUCCESS', '2026-06-23 15:01'),
  ('00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000003', 'EDIT', 'REQUIREMENT', '00000000-0000-4000-8000-000000000028', 'Edited Status Justification', 'SUCCESS', '2026-06-23 15:00'),
  ('00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000007', 'ASSIGN', 'REQUIREMENT', '00000000-0000-4000-8000-00000000002b', 'Assigned requirement', 'SUCCESS', '2026-06-23 11:20'),
  ('00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000003', 'CREATE', 'REQUIREMENT', '00000000-0000-4000-8000-000000000029', 'Created requirement', 'SUCCESS', '2026-06-21 16:44'),
  ('00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000003', 'EDIT', 'REQUIREMENT', '00000000-0000-4000-8000-000000000026', 'Edited Fix content', 'SUCCESS', '2026-06-20 11:20'),
  ('00000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000003', 'STATUS', 'REQUIREMENT', '00000000-0000-4000-8000-00000000002a', 'Submitted for review', 'SUCCESS', '2026-06-19 09:15')
ON CONFLICT DO NOTHING;

COMMIT;

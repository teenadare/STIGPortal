// =============================================================================
// Pure mapping: mock-up data modules -> normalized rows for docs/schema.sql.
// Shared by scripts/seed_postgres.mjs (standalone) and src/server/pgStore.js.
// Takes data as arguments so it has NO @/ imports and runs in plain Node too.
// =============================================================================
import { randomUUID as uuid } from 'crypto';

export const SEV_TO_DB = { 'CAT I': 'CAT_I', 'CAT II': 'CAT_II', 'CAT III': 'CAT_III' };
export const SEV_FROM_DB = { CAT_I: 'CAT I', CAT_II: 'CAT II', CAT_III: 'CAT III' };
export const STATUS_TO_DB = {
  '': null, 'Applicable - Configurable': 'CONFIGURABLE', 'Applicable - Does Not Meet': 'DOES_NOT_MEET',
  'Applicable - Inherently Meets': 'INHERENTLY_MEETS', 'Not Applicable': 'NOT_APPLICABLE',
};
export const STATUS_FROM_DB = {
  CONFIGURABLE: 'Applicable - Configurable', DOES_NOT_MEET: 'Applicable - Does Not Meet',
  INHERENTLY_MEETS: 'Applicable - Inherently Meets', NOT_APPLICABLE: 'Not Applicable', MEETS: 'Applicable - Meets',
};
export const APPROVAL_TO_DB = { Approved: 'APPROVED', 'Pending Approval': 'PENDING_APPROVAL', Returned: 'RETURNED' };
export const APPROVAL_FROM_DB = { APPROVED: 'Approved', PENDING_APPROVAL: 'Pending Approval', RETURNED: 'Returned' };

// Insert order respects FK dependencies.
export const INSERT_ORDER = [
  'vendor', 'app_user', 'product', 'srg', 'srg_requirement', 'cci',
  'stig_project', 'requirement', 'requirement_cci', 'comment',
  'requirement_field_change', 'audit_event',
];

export function buildRows({ mock, workflow }) {
  const t = { vendor: [], app_user: [], product: [], srg: [], srg_requirement: [], cci: [], stig_project: [], requirement: [], requirement_cci: [], comment: [], requirement_field_change: [], audit_event: [] };
  const userId = {}, vendorId = {}, productId = {}, cciId = {}, srgReqId = {}, projId = {};

  const ensureUser = (name, initials) => {
    if (!name) return null;
    if (!userId[name]) {
      const id = uuid(); userId[name] = id;
      t.app_user.push({ user_id: id, username: name, display_name: name, initials: initials || name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase(), is_global: name === 'PMRC', active: true });
    }
    return userId[name];
  };
  const ensureVendor = (name, org) => {
    if (!vendorId[name]) { const id = uuid(); vendorId[name] = id; t.vendor.push({ vendor_id: id, vendor_name: name, vendor_code: name.toUpperCase().replace(/\s+/g, '_'), vendor_org: org || name, active: true }); }
    return vendorId[name];
  };
  const ensureProduct = (vId, name) => {
    const k = vId + '|' + name;
    if (!productId[k]) { const id = uuid(); productId[k] = id; t.product.push({ product_id: id, vendor_id: vId, product_name: name, active: true }); }
    return productId[k];
  };

  (workflow.ROLES || []).forEach((r) => ensureUser(r.user, r.initials));
  (mock.teamMembers || []).forEach((m) => ensureUser(m.name, m.initials));

  // Shared reference: CCI
  (mock.ccis || []).forEach((c) => { const id = uuid(); cciId[c.id] = id; t.cci.push({ cci_id: id, cci_number: c.id, definition: c.def, nist_control: c.nist, status: 'ACTIVE' }); });

  // Shared reference: one Core SRG + its requirements from the SRG tree
  const coreSrg = uuid();
  t.srg.push({ srg_id: coreSrg, parent_srg_id: null, srg_code: 'OS-SRG', srg_name: 'Operating System SRG', srg_type: 'CORE', active: true });
  (mock.srgTree || []).forEach((s) => { const id = uuid(); srgReqId[s.id] = id; t.srg_requirement.push({ srg_requirement_id: id, srg_id: coreSrg, srg_requirement_code: s.id, requirement_text: s.title, severity: SEV_TO_DB[s.severity] || null }); });

  // Vendors / products / projects
  mock.projects.forEach((p) => {
    const vId = ensureVendor(p.vendor, p.vendorOrg);
    const pdId = ensureProduct(vId, p.product);
    const id = uuid(); projId[p.id] = id;
    t.stig_project.push({ project_id: id, vendor_id: vId, product_id: pdId, source_srg_id: coreSrg, project_name: p.name, stig_version: p.version, assigned_writer: ensureUser(p.lead), created_at: p.updated, updated_at: p.updated });
  });

  // Requirements (mock attaches all to the Horizon project)
  const hVendor = ensureVendor('Omnissa', 'Omnissa');
  const hProject = projId['horizon'];
  const reqId = {};
  mock.requirements.forEach((r) => {
    const id = uuid(); reqId[r.id] = id;
    t.requirement.push({
      requirement_id: id, vendor_id: hVendor, project_id: hProject,
      source_srg_requirement_id: srgReqId[r.srg] || null, srg_id: r.srg, stig_id: r.stigId,
      ia_control: r.iaControl, requirement_text: r.title, vul_discussion: r.discussion,
      status: STATUS_TO_DB[r.status] ?? null, check_text: r.check, fix_text: r.fix,
      severity: SEV_TO_DB[r.severity] || null, mitigation: r.mitigation, artifact_description: r.artifactDescription,
      status_justification: r.statusJustification, notes: r.notes, approval_status: APPROVAL_TO_DB[r.approvalStatus] || null,
      current_revision: 1, assigned_to: r.assignee ? ensureUser(r.assignee.name, r.assignee.initials) : null,
      created_at: r.updated, updated_at: r.updated,
    });
    (r.cci || []).forEach((cn) => { if (cciId[cn]) t.requirement_cci.push({ requirement_id: id, cci_id: cciId[cn] }); });
  });

  Object.entries(mock.comments || {}).forEach(([rid, list]) => list.forEach((c) => reqId[rid] && t.comment.push({ vendor_id: hVendor, requirement_id: reqId[rid], comment_text: c.text, created_by: ensureUser(c.author, c.initials), created_at: c.time })));
  Object.entries(mock.revisions || {}).forEach(([rid, list]) => list.forEach((rv) => reqId[rid] && t.requirement_field_change.push({ requirement_id: reqId[rid], vendor_id: hVendor, field_name: rv.field, old_value: rv.from, new_value: rv.to, changed_by: ensureUser(rv.author), changed_at: rv.time })));
  (mock.auditLog || []).forEach((a) => t.audit_event.push({ vendor_id: hVendor, user_id: ensureUser(a.user), event_type: String(a.type || '').toUpperCase(), object_type: 'REQUIREMENT', object_id: reqId[a.target] || null, action: a.action, result: 'SUCCESS', ts: a.time }));

  return t;
}

// Build a parameterized INSERT for one row-set.
export function insertSql(table, rows) {
  if (!rows.length) return null;
  const cols = Object.keys(rows[0]);
  const values = [];
  const params = [];
  let i = 1;
  for (const row of rows) {
    params.push('(' + cols.map(() => `$${i++}`).join(',') + ')');
    cols.forEach((c) => values.push(row[c] === undefined ? null : row[c]));
  }
  return { text: `INSERT INTO ${table} (${cols.join(',')}) VALUES ${params.join(',')} ON CONFLICT DO NOTHING`, values };
}

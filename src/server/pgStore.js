// ============================================================================
// Postgres store over the NORMALIZED schema (docs/schema.sql). Active only when
// DATABASE_URL is set. Dynamic entities (requirements, projects, comments,
// audit) are read/written across normalized tables and shaped back into the
// UI/API object shape. Static reference data is served from seed.js.
// Requires a live PostgreSQL to validate (not exercised without DATABASE_URL).
// ============================================================================
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { query } from '@/server/db';
import { reference } from '@/server/seed';
import * as mock from '@/data/mockData';
import * as workflow from '@/data/workflowData';
import {
  buildRows, insertSql, INSERT_ORDER,
  SEV_FROM_DB, STATUS_FROM_DB, APPROVAL_FROM_DB,
  SEV_TO_DB, STATUS_TO_DB, APPROVAL_TO_DB,
} from '@/server/normalizedSeed';

let ready = null;

async function ensureSchemaAndSeed() {
  // Only apply the DDL if the schema is not present yet (schema.sql is now
  // idempotent, but this avoids re-running the full script on every cold start).
  const { rows: reg } = await query("SELECT to_regclass('public.requirement') AS t");
  if (!reg[0].t) {
    const ddl = readFileSync(join(process.cwd(), 'docs', 'schema.sql'), 'utf8');
    await query(ddl);
  }
  const { rows } = await query('SELECT COUNT(*)::int AS n FROM requirement');
  if (rows[0].n > 0) return;
  const tables = buildRows({ mock, workflow });
  for (const table of INSERT_ORDER) {
    const q = insertSql(table, tables[table]);
    if (q) await query(q, q.values);
  }
}
function init() {
  if (!ready) ready = ensureSchemaAndSeed();
  return ready;
}

// Single shaped SELECT for requirements -> UI object shape.
const REQ_SELECT = `
  SELECT r.requirement_id AS id, r.stig_id AS "stigId", r.approval_status,
         r.ia_control AS "iaControl", r.srg_id AS srg, r.requirement_text AS title,
         r.vul_discussion AS discussion, r.status, r.check_text AS check,
         r.fix_text AS fix, r.severity, r.mitigation,
         r.artifact_description AS "artifactDescription",
         r.status_justification AS "statusJustification", r.notes,
         to_char(r.updated_at, 'YYYY-MM-DD') AS updated,
         COALESCE(json_agg(c.cci_number) FILTER (WHERE c.cci_number IS NOT NULL), '[]') AS cci,
         CASE WHEN u.user_id IS NULL THEN NULL
              ELSE json_build_object('name', u.display_name, 'initials', u.initials) END AS assignee
  FROM requirement r
  LEFT JOIN requirement_cci rc ON rc.requirement_id = r.requirement_id
  LEFT JOIN cci c ON c.cci_id = rc.cci_id
  LEFT JOIN app_user u ON u.user_id = r.assigned_to`;
const REQ_GROUP = `
  GROUP BY r.requirement_id, u.user_id
  ORDER BY r.stig_id`;

function shapeReq(row) {
  if (!row) return null;
  const { approval_status, ...rest } = row;
  return {
    ...rest,
    severity: SEV_FROM_DB[row.severity] || row.severity,
    status: STATUS_FROM_DB[row.status] || '',
    approvalStatus: APPROVAL_FROM_DB[approval_status] || approval_status,
  };
}

// Map incoming UI patch (mock field names) -> requirement columns.
const PATCH_MAP = {
  stigId: 'stig_id', iaControl: 'ia_control', srg: 'srg_id', title: 'requirement_text',
  discussion: 'vul_discussion', check: 'check_text', fix: 'fix_text', mitigation: 'mitigation',
  artifactDescription: 'artifact_description', statusJustification: 'status_justification', notes: 'notes',
};

export const pgStore = {
  async listRequirements() { await init(); const { rows } = await query(`${REQ_SELECT} ${REQ_GROUP}`); return rows.map(shapeReq); },
  async getRequirement(stigId) {
    await init();
    const { rows } = await query(`${REQ_SELECT} WHERE r.stig_id = $1 ${REQ_GROUP}`, [stigId]);
    return shapeReq(rows[0]) || null;
  },
  async updateRequirement(stigId, patch) {
    await init();
    const sets = ['updated_at = now()'];
    const vals = [];
    let i = 1;
    for (const [k, v] of Object.entries(patch || {})) {
      if (k === 'severity') { sets.push(`severity = $${i++}`); vals.push(SEV_TO_DB[v] || v); }
      else if (k === 'status') { sets.push(`status = $${i++}`); vals.push(STATUS_TO_DB[v] ?? null); }
      else if (k === 'approvalStatus') { sets.push(`approval_status = $${i++}`); vals.push(APPROVAL_TO_DB[v] || v); }
      else if (PATCH_MAP[k]) { sets.push(`${PATCH_MAP[k]} = $${i++}`); vals.push(v); }
    }
    vals.push(stigId);
    const res = await query(`UPDATE requirement SET ${sets.join(', ')} WHERE stig_id = $${i} RETURNING requirement_id`, vals);
    if (!res.rowCount) return null;
    return this.getRequirement(stigId);
  },
  async createRequirement(rec) {
    await init();
    const { rows: pj } = await query('SELECT project_id, vendor_id FROM stig_project ORDER BY created_at LIMIT 1');
    const p = pj[0] || {};
    const { rows } = await query(
      `INSERT INTO requirement (vendor_id, project_id, stig_id, ia_control, srg_id, requirement_text,
        vul_discussion, status, check_text, fix_text, severity, approval_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING stig_id`,
      [p.vendor_id, p.project_id, rec.stigId, rec.iaControl, rec.srg, rec.title, rec.discussion,
       STATUS_TO_DB[rec.status] ?? null, rec.check, rec.fix, SEV_TO_DB[rec.severity] || null,
       APPROVAL_TO_DB[rec.approvalStatus] || 'PENDING_APPROVAL']);
    return this.getRequirement(rows[0].stig_id);
  },

  async listProjects() {
    await init();
    const { rows } = await query(`
      SELECT p.project_id AS id, p.project_name AS name, pr.product_name AS product,
             v.vendor_name AS vendor, v.vendor_org AS "vendorOrg", p.stig_version AS version,
             p.phase, p.workflow_status AS stage, u.display_name AS lead,
             to_char(p.updated_at, 'YYYY-MM-DD') AS updated,
             COALESCE(rp.total, 0) AS total, COALESCE(rp.progress_pct, 0) AS progress,
             json_build_object('catI', COALESCE(rp.cat_i,0), 'catII', COALESCE(rp.cat_ii,0), 'catIII', COALESCE(rp.cat_iii,0)) AS counts,
             json_build_object('approved', COALESCE(rp.approved,0), 'review', COALESCE(rp.in_review,0), 'revision', COALESCE(rp.returned,0), 'draft', 0) AS breakdown
      FROM stig_project p
      JOIN vendor v ON v.vendor_id = p.vendor_id
      JOIN product pr ON pr.product_id = p.product_id
      LEFT JOIN app_user u ON u.user_id = p.assigned_writer
      LEFT JOIN v_project_rollup rp ON rp.project_id = p.project_id
      ORDER BY p.created_at`);
    return rows;
  },
  async getProject(id) { await init(); return (await this.listProjects()).find((p) => p.id === id) || null; },
  async updateProject(id, patch) {
    await init();
    const map = { name: 'project_name', version: 'stig_version', phase: 'phase', stage: 'workflow_status' };
    const sets = ['updated_at = now()']; const vals = []; let i = 1;
    for (const [k, v] of Object.entries(patch || {})) if (map[k]) { sets.push(`${map[k]} = $${i++}`); vals.push(v); }
    vals.push(id);
    const res = await query(`UPDATE stig_project SET ${sets.join(', ')} WHERE project_id = $${i} RETURNING project_id`, vals);
    return res.rowCount ? this.getProject(id) : null;
  },

  async listComments(stigId) {
    await init();
    const { rows } = await query(`
      SELECT u.display_name AS author, u.initials, uva.access_role AS role,
             to_char(cm.created_at, 'YYYY-MM-DD HH24:MI') AS time, cm.comment_text AS text
      FROM comment cm
      JOIN requirement r ON r.requirement_id = cm.requirement_id AND r.stig_id = $1
      LEFT JOIN app_user u ON u.user_id = cm.created_by
      LEFT JOIN user_vendor_access uva ON uva.user_id = cm.created_by AND uva.vendor_id = cm.vendor_id
      ORDER BY cm.created_at`, [stigId]);
    return rows;
  },
  async addComment(stigId, comment) {
    await init();
    const { rows: rq } = await query('SELECT requirement_id, vendor_id FROM requirement WHERE stig_id = $1', [stigId]);
    if (!rq[0]) return null;
    const { rows: u } = await query('SELECT user_id FROM app_user WHERE display_name = $1', [comment.author]);
    await query('INSERT INTO comment (vendor_id, requirement_id, comment_text, created_by) VALUES ($1,$2,$3,$4)',
      [rq[0].vendor_id, rq[0].requirement_id, comment.text, u[0]?.user_id || null]);
    return { time: new Date().toISOString().slice(0, 16).replace('T', ' '), ...comment };
  },
  async listAudit() {
    await init();
    const { rows } = await query(`
      SELECT to_char(a.ts, 'YYYY-MM-DD HH24:MI') AS time, u.display_name AS user,
             a.action, r.stig_id AS target, lower(a.event_type) AS type
      FROM audit_event a
      LEFT JOIN app_user u ON u.user_id = a.user_id
      LEFT JOIN requirement r ON r.requirement_id = a.object_id
      ORDER BY a.ts DESC`);
    return rows;
  },

  // ---- static reference data (served from seed.js, same as memory store) ----
  async srgTree() { return reference.srgTree(); },
  async ccis() { return reference.ccis(); },
  async cciAudit() { return reference.cciAudit(); },
  async duplicateClusters() { return reference.duplicateClusters(); },
  async srgDetail(reqId) { return reference.srgDetail(reqId); },
  async testing(reqId) { return reference.testing(reqId); },
  async enums() { return reference.enums; },
};

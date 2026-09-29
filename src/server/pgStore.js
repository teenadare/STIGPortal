// ============================================================================
// Postgres store. Active only when DATABASE_URL is set. Dynamic tables
// (requirements, projects, comments, audit) live in Postgres; reference data
// is served from seed. Schema + seed are created lazily on first access.
// ============================================================================
import { query } from '@/server/db';
import { buildSeed, reference, stigIdToInternal } from '@/server/seed';

let ready = null;

async function ensureSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, data JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS requirements (id TEXT PRIMARY KEY, stig_id TEXT UNIQUE NOT NULL, data JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, req_id TEXT NOT NULL, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT now());
    CREATE TABLE IF NOT EXISTS audit_log (id SERIAL PRIMARY KEY, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT now());
  `);
}

async function seedIfEmpty() {
  const { rows } = await query('SELECT COUNT(*)::int AS n FROM requirements');
  if (rows[0].n > 0) return;
  const seed = buildSeed();
  for (const p of seed.projects) await query('INSERT INTO projects(id,data) VALUES($1,$2) ON CONFLICT DO NOTHING', [p.id, p]);
  for (const r of seed.requirements) await query('INSERT INTO requirements(id,stig_id,data) VALUES($1,$2,$3) ON CONFLICT DO NOTHING', [r.id, r.stigId, r]);
  for (const [reqId, list] of Object.entries(seed.comments)) for (const c of list) await query('INSERT INTO comments(req_id,data) VALUES($1,$2)', [reqId, c]);
  for (const a of seed.auditLog) await query('INSERT INTO audit_log(data) VALUES($1)', [a]);
}

async function init() {
  if (!ready) ready = (async () => { await ensureSchema(); await seedIfEmpty(); })();
  return ready;
}

async function allReqs() {
  await init();
  const { rows } = await query('SELECT data FROM requirements ORDER BY stig_id');
  return rows.map((r) => r.data);
}

export const pgStore = {
  async listRequirements() { return allReqs(); },
  async getRequirement(stigId) {
    await init();
    const { rows } = await query('SELECT data FROM requirements WHERE stig_id=$1', [stigId]);
    return rows[0]?.data || null;
  },
  async updateRequirement(stigId, patch) {
    await init();
    const cur = await this.getRequirement(stigId);
    if (!cur) return null;
    const next = { ...cur, ...patch, stigId: cur.stigId, id: cur.id, updated: new Date().toISOString().slice(0, 10) };
    await query('UPDATE requirements SET data=$2 WHERE stig_id=$1', [stigId, next]);
    return next;
  },
  async createRequirement(rec) {
    await init();
    const id = rec.id || `r-${Math.random().toString(36).slice(2, 8)}`;
    const row = { id, updated: new Date().toISOString().slice(0, 10), ...rec };
    await query('INSERT INTO requirements(id,stig_id,data) VALUES($1,$2,$3)', [id, row.stigId, row]);
    return row;
  },
  async listProjects() { await init(); const { rows } = await query('SELECT data FROM projects'); return rows.map((r) => r.data); },
  async getProject(id) { await init(); const { rows } = await query('SELECT data FROM projects WHERE id=$1', [id]); return rows[0]?.data || null; },
  async updateProject(id, patch) {
    const cur = await this.getProject(id);
    if (!cur) return null;
    const next = { ...cur, ...patch, id: cur.id };
    await query('UPDATE projects SET data=$2 WHERE id=$1', [id, next]);
    return next;
  },
  async listComments(stigId) {
    const internal = stigIdToInternal(await allReqs(), stigId);
    if (!internal) return [];
    const { rows } = await query('SELECT data FROM comments WHERE req_id=$1 ORDER BY id', [internal]);
    return rows.map((r) => r.data);
  },
  async addComment(stigId, comment) {
    const internal = stigIdToInternal(await allReqs(), stigId);
    if (!internal) return null;
    const row = { time: new Date().toISOString().slice(0, 16).replace('T', ' '), ...comment };
    await query('INSERT INTO comments(req_id,data) VALUES($1,$2)', [internal, row]);
    return row;
  },
  async listAudit() { await init(); const { rows } = await query('SELECT data FROM audit_log ORDER BY id DESC'); return rows.map((r) => r.data); },
  async srgTree() { return reference.srgTree(); },
  async ccis() { return reference.ccis(); },
  async cciAudit() { return reference.cciAudit(); },
  async duplicateClusters() { return reference.duplicateClusters(); },
  async srgDetail(reqId) { return reference.srgDetail(reqId); },
  async testing(reqId) { return reference.testing(reqId); },
  async enums() { return reference.enums; },
};

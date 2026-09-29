// ============================================================================
// In-memory store (default). Implements the store interface over seed data.
// State lives for the lifetime of the server process. Swap for pgStore by
// setting DATABASE_URL. Both implement the SAME async interface.
// ============================================================================
import { buildSeed, reference, stigIdToInternal } from '@/server/seed';

let data = null;
function db() {
  if (!data) data = buildSeed();
  return data;
}

export const memoryStore = {
  async listRequirements() {
    return db().requirements;
  },
  async getRequirement(stigId) {
    return db().requirements.find((r) => r.stigId === stigId) || null;
  },
  async updateRequirement(stigId, patch) {
    const r = db().requirements.find((x) => x.stigId === stigId);
    if (!r) return null;
    Object.assign(r, patch, { stigId: r.stigId, id: r.id, updated: new Date().toISOString().slice(0, 10) });
    return r;
  },
  async createRequirement(rec) {
    const id = rec.id || `r-${Math.random().toString(36).slice(2, 8)}`;
    const row = { id, updated: new Date().toISOString().slice(0, 10), ...rec };
    db().requirements.push(row);
    return row;
  },
  async listProjects() {
    return db().projects;
  },
  async getProject(id) {
    return db().projects.find((p) => p.id === id) || null;
  },
  async updateProject(id, patch) {
    const p = db().projects.find((x) => x.id === id);
    if (!p) return null;
    Object.assign(p, patch, { id: p.id });
    return p;
  },
  async listComments(stigId) {
    const internal = stigIdToInternal(db().requirements, stigId);
    return internal ? db().comments[internal] || [] : [];
  },
  async addComment(stigId, comment) {
    const internal = stigIdToInternal(db().requirements, stigId);
    if (!internal) return null;
    const list = db().comments[internal] || (db().comments[internal] = []);
    const row = { time: new Date().toISOString().slice(0, 16).replace('T', ' '), ...comment };
    list.push(row);
    return row;
  },
  async listAudit() {
    return db().auditLog;
  },
  // ---- static reference data ----
  async srgTree() { return reference.srgTree(); },
  async ccis() { return reference.ccis(); },
  async cciAudit() { return reference.cciAudit(); },
  async duplicateClusters() { return reference.duplicateClusters(); },
  async srgDetail(reqId) { return reference.srgDetail(reqId); },
  async testing(reqId) { return reference.testing(reqId); },
  async enums() { return reference.enums; },
};

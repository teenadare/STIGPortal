// ============================================================================
// Canonical seed data, derived from the front-end mock modules. Used to hydrate
// the in-memory store and to seed an empty Postgres database on first boot.
// Reference/derived tables (SRG tree, CCIs, AI findings, testing) are treated
// as read-only reference data and always served from here.
// ============================================================================
import * as mock from '@/data/mockData';
import * as workflow from '@/data/workflowData';

// Deep clone so callers can mutate the in-memory copy safely.
const clone = (v) => JSON.parse(JSON.stringify(v));

export function buildSeed() {
  return {
    requirements: clone(mock.requirements),
    projects: clone(mock.projects),
    comments: clone(mock.comments || {}),      // keyed by internal req id
    revisions: clone(mock.revisions || {}),
    auditLog: clone(mock.auditLog || []),
  };
}

// Static reference data (not persisted / not user-editable in this build).
export const reference = {
  srgTree: () => clone(mock.srgTree || []),
  ccis: () => clone(mock.ccis || []),
  cciAudit: () => clone(mock.cciAudit || []),
  duplicateClusters: () => clone(workflow.duplicateClusters || []),
  srgDetail: (reqId) => clone((workflow.srgDetailByReqId || {})[reqId] || {}),
  testing: (reqId) => clone((workflow.testingByReqId || {})[reqId] || {}),
  enums: {
    SEVERITIES: mock.SEVERITIES,
    STATUSES: mock.STATUSES,
    APPROVAL_STATUSES: mock.APPROVAL_STATUSES,
    GROUP_BY_OPTIONS: mock.GROUP_BY_OPTIONS,
  },
};

export const stigIdToInternal = (reqs, stigId) => {
  const r = reqs.find((x) => x.stigId === stigId);
  return r ? r.id : null;
};

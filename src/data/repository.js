// ============================================================================
// Data-access layer — single source of truth for the front-end.
//
// Every screen, form and component imports its data/enums from THIS module,
// never from the raw mock files directly. To connect a real FastAPI backend,
// change ONLY this file: replace the getter bodies below with `fetch(...)`
// calls and drop the mock re-exports. That makes backend wiring a one-file swap.
//
// • Prefer the get*/find* helpers below (the intended API surface).
// • The `export *` lines re-expose the raw mock arrays/enums so existing
//   reference screens keep working during the transition.
// ============================================================================
import * as mock from "@/data/mockData";
import * as workflow from "@/data/workflowData";

// Re-export every constant, enum and mock table so consumers import from here.
export * from "@/data/mockData";
export * from "@/data/workflowData";

/* ---- Dynamic record data (backend-served in production) ---- */
export const getRequirements = () => mock.requirements;
export const getRequirementByStigId = (stigId) => mock.requirements.find((r) => r.stigId === stigId) || null;
export const getProjects = () => mock.projects;
export const getComments = (reqId) => mock.comments[reqId] || [];
export const getRevisions = (reqId) => mock.revisions[reqId] || [];
export const getCciAudit = () => mock.cciAudit;
export const findCciAuditByReqId = (reqId) => mock.cciAudit.find((c) => c.rid === reqId) || null;
export const getSrgDetail = (reqId) => workflow.srgDetailByReqId[reqId] || {};
export const getTesting = (reqId) => workflow.testingByReqId[reqId] || {};
export const getAuditLog = () => mock.auditLog;
export const getSrgTree = () => mock.srgTree;
export const getCcis = () => mock.ccis;
export const getDuplicateClusters = () => workflow.duplicateClusters;

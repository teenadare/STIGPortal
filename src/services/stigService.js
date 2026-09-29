// ============================================================================
// Domain data service (live backend). Mirrors the getters in
// `@/data/repository` but talks to the API. Use this to move a screen from
// mock to live data with minimal changes (add loading/error handling).
// ============================================================================
import { api } from '@/services/apiClient';

export const stigService = {
  getRequirements: () => api.get('/requirements'),
  getRequirement: (stigId) => api.get(`/requirements/${stigId}`),
  updateRequirement: (stigId, patch) => api.put(`/requirements/${stigId}`, patch),
  createRequirement: (rec) => api.post('/requirements', rec),

  getProjects: () => api.get('/projects'),
  getProject: (id) => api.get(`/projects/${id}`),
  updateProject: (id, patch) => api.put(`/projects/${id}`, patch),

  getComments: (stigId) => api.get(`/requirements/${stigId}/comments`),
  addComment: (stigId, comment) => api.post(`/requirements/${stigId}/comments`, comment),

  getAuditLog: () => api.get('/audit-log'),
  getSrgTree: () => api.get('/srg-tree'),
  getCcis: () => api.get('/ccis'),
  getCciAudit: () => api.get('/cci-audit'),
  getDuplicateClusters: () => api.get('/duplicate-clusters'),
  getSrgDetail: (reqId) => api.get(`/requirements/${reqId}/srg-detail`),
  getTesting: (reqId) => api.get(`/requirements/${reqId}/testing`),
  getEnums: () => api.get('/enums'),
};

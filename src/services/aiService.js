// ============================================================================
// AI service (live backend). Calls the provider-agnostic `/api/ai/*` routes.
// UI hook points: RequirementEditor 'Similar verbiage', CCIMappingCheck.
// ============================================================================
import { api } from '@/services/apiClient';

export const aiService = {
  // field: 'check' | 'fix' | 'discussion' | ...
  similarVerbiage: ({ field, text, excludeStigId }) =>
    api.post('/ai/similar-verbiage', { field, text, excludeStigId }),
  cciSuggestions: (args = {}) => api.post('/ai/cci-suggestions', args),
};

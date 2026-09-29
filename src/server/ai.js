// ============================================================================
// AI provider abstraction. `AI_PROVIDER` selects the implementation. The
// default 'mock' provider is deterministic and needs no API key. To plug in a
// real LLM (OpenAI / Anthropic / Gemini / Emergent), implement `llmComplete`
// and set AI_PROVIDER + the relevant key — no caller changes needed.
// ============================================================================
import { store } from '@/server/store';

const PROVIDER = process.env.AI_PROVIDER || 'mock';

const words = (s) => String(s || '').toLowerCase().match(/[a-z0-9]{4,}/g) || [];
function score(a, b) {
  const sa = new Set(words(a));
  const sb = new Set(words(b));
  let hits = 0;
  for (const w of sb) if (sa.has(w)) hits++;
  return sb.size ? hits / sb.size : 0;
}

// ---- Mock provider (default) --------------------------------------------
const mockProvider = {
  async similarVerbiage({ field, text, excludeStigId }) {
    const reqs = await store.listRequirements();
    return reqs
      .filter((r) => r.stigId !== excludeStigId && r[field])
      .map((r) => ({ stigId: r.stigId, title: r.title, value: r[field], confidence: Number(score(text, r[field]).toFixed(2)) }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  },
  async cciSuggestions() {
    // Reference AI findings already model this; expose them through the AI seam.
    return store.cciAudit();
  },
};

// ---- Real LLM provider (stub seam) --------------------------------------
// Implement this to go live; wire it into the methods below.
async function llmComplete(/* { system, prompt } */) {
  throw new Error(`AI_PROVIDER='${PROVIDER}' has no llmComplete implementation yet. See BACKEND.md.`);
}

export const ai = PROVIDER === 'mock' ? mockProvider : {
  async similarVerbiage(args) {
    const suggestion = await llmComplete({ system: 'STIG verbiage assistant', prompt: JSON.stringify(args) });
    return suggestion;
  },
  async cciSuggestions(args) {
    const suggestion = await llmComplete({ system: 'CCI mapping assistant', prompt: JSON.stringify(args) });
    return suggestion;
  },
};

export { PROVIDER as aiProvider };

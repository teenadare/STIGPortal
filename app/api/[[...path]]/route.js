// ============================================================================
// STIG Portal API. Thin HTTP router that delegates to the pluggable data
// `store` (in-memory or Postgres) and the `ai` provider. All backend wiring
// lives behind those two seams — this file only maps routes to methods.
// ============================================================================
import { NextResponse } from 'next/server';
import { store, backendKind } from '@/server/store';
import { ai, aiProvider } from '@/server/ai';

function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res;
}
const json = (data, status = 200) => cors(NextResponse.json(data, { status }));

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 200 }));
}

async function handle(request, { params }) {
  const { path = [] } = await params;
  const seg = path;
  const route = `/${seg.join('/')}`;
  const method = request.method;
  const body = ['POST', 'PUT', 'PATCH'].includes(method)
    ? await request.json().catch(() => ({}))
    : {};

  try {
    // Health
    if ((route === '/' || route === '/health') && method === 'GET')
      return json({ status: 'ok', service: 'stig-portal-api', backend: backendKind, ai: aiProvider });

    // Enums / reference
    if (route === '/enums' && method === 'GET') return json(await store.enums());
    if (route === '/srg-tree' && method === 'GET') return json(await store.srgTree());
    if (route === '/ccis' && method === 'GET') return json(await store.ccis());
    if (route === '/cci-audit' && method === 'GET') return json(await store.cciAudit());
    if (route === '/duplicate-clusters' && method === 'GET') return json(await store.duplicateClusters());
    if (route === '/audit-log' && method === 'GET') return json(await store.listAudit());

    // Projects
    if (route === '/projects' && method === 'GET') return json(await store.listProjects());
    if (seg[0] === 'projects' && seg[1] && method === 'GET') {
      const p = await store.getProject(seg[1]);
      return p ? json(p) : json({ error: 'project not found' }, 404);
    }
    if (seg[0] === 'projects' && seg[1] && (method === 'PUT' || method === 'PATCH')) {
      const p = await store.updateProject(seg[1], body);
      return p ? json(p) : json({ error: 'project not found' }, 404);
    }

    // Requirements
    if (route === '/requirements' && method === 'GET') return json(await store.listRequirements());
    if (route === '/requirements' && method === 'POST') return json(await store.createRequirement(body), 201);
    if (seg[0] === 'requirements' && seg[1] && !seg[2] && method === 'GET') {
      const r = await store.getRequirement(seg[1]);
      return r ? json(r) : json({ error: 'requirement not found' }, 404);
    }
    if (seg[0] === 'requirements' && seg[1] && !seg[2] && (method === 'PUT' || method === 'PATCH')) {
      const r = await store.updateRequirement(seg[1], body);
      return r ? json(r) : json({ error: 'requirement not found' }, 404);
    }
    // Comments: /requirements/:stigId/comments
    if (seg[0] === 'requirements' && seg[2] === 'comments' && method === 'GET')
      return json(await store.listComments(seg[1]));
    if (seg[0] === 'requirements' && seg[2] === 'comments' && method === 'POST') {
      const c = await store.addComment(seg[1], body);
      return c ? json(c, 201) : json({ error: 'requirement not found' }, 404);
    }
    // Derived per-requirement data
    if (seg[0] === 'requirements' && seg[2] === 'srg-detail' && method === 'GET')
      return json(await store.srgDetail(seg[1]));
    if (seg[0] === 'requirements' && seg[2] === 'testing' && method === 'GET')
      return json(await store.testing(seg[1]));

    // AI
    if (route === '/ai/similar-verbiage' && method === 'POST')
      return json(await ai.similarVerbiage(body));
    if (route === '/ai/cci-suggestions' && (method === 'POST' || method === 'GET'))
      return json(await ai.cciSuggestions(body));

    return json({ error: `Route ${route} not found` }, 404);
  } catch (e) {
    console.error('API Error:', e);
    return json({ error: e.message || 'Internal server error' }, 500);
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;

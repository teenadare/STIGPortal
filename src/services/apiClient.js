// ============================================================================
// Frontend API client. Thin fetch wrapper around the Next `/api` backend.
// This is the seam the UI uses to talk to the server; swapping the whole app
// from mock data to live data means importing from `@/services/*` instead of
// `@/data/repository`.
// ============================================================================
const BASE = '/api';

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API ${method} ${path} failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  del: (p) => request(p, { method: 'DELETE' }),
};

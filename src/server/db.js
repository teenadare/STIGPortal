// ============================================================================
// Postgres connection (optional). Enabled only when DATABASE_URL is set.
// The rest of the backend talks to `store.js`, never to `pg` directly, so the
// database is a true drop-in: set DATABASE_URL and the store switches to pg.
// ============================================================================
import { Pool } from 'pg';

let pool = null;

export function isDbEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!isDbEnabled()) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === 'require' ? { rejectUnauthorized: false } : undefined,
      max: 5,
    });
  }
  return pool;
}

export async function query(text, params) {
  const p = getPool();
  if (!p) throw new Error('DATABASE_URL not configured');
  return p.query(text, params);
}

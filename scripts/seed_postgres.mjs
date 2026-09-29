#!/usr/bin/env node
// =============================================================================
// Seed a normalized PostgreSQL database (docs/schema.sql) from the UI mock-up.
// Usage:  DATABASE_URL=postgres://user:pass@host:5432/db  node scripts/seed_postgres.mjs
// Idempotent-ish: runs the DDL (IF NOT EXISTS) then INSERT ... ON CONFLICT DO NOTHING.
// =============================================================================
import { Pool } from 'pg';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as mock from '../src/data/mockData.js';
import * as workflow from '../src/data/workflowData.js';
import { buildRows, insertSql, INSERT_ORDER } from '../src/server/normalizedSeed.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) { console.error('Set DATABASE_URL first.'); process.exit(1); }
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const ddl = readFileSync(join(__dirname, '..', 'docs', 'schema.sql'), 'utf8');
  const client = await pool.connect();
  try {
    console.log('Applying schema (docs/schema.sql)...');
    await client.query(ddl);

    const tables = buildRows({ mock, workflow });
    await client.query('BEGIN');
    for (const table of INSERT_ORDER) {
      const q = insertSql(table, tables[table]);
      if (!q) continue;
      await client.query(q);
      console.log(`  seeded ${tables[table].length} -> ${table}`);
    }
    await client.query('COMMIT');
    console.log('Done. Try:  SELECT * FROM v_project_rollup;');
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Seed failed:', e.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}
main();

// ============================================================================
// Store selector — the single seam the API talks to. Picks Postgres when
// DATABASE_URL is set, otherwise the in-memory store. To add a new backend,
// implement the same interface and select it here.
// ============================================================================
import { isDbEnabled } from '@/server/db';
import { memoryStore } from '@/server/memoryStore';
import { pgStore } from '@/server/pgStore';

export const store = isDbEnabled() ? pgStore : memoryStore;
export const backendKind = isDbEnabled() ? 'postgres' : 'memory';

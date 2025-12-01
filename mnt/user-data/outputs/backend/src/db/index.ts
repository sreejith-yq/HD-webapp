// src/db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export function createDb(databaseUrl: string) {
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

export type Database = ReturnType<typeof createDb>;

// For use in Hono middleware
export function getDb(env: { NEON_DATABASE_URL: string }) {
  return createDb(env.NEON_DATABASE_URL);
}

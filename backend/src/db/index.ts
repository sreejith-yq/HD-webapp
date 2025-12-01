import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as relations from './relations';
import type { Env } from '../types/env';

export function getDb(env: Env) {
  const sql = neon(env.DATABASE_URL);
  return drizzle(sql, { schema: { ...schema, ...relations } });
}

export type Database = ReturnType<typeof getDb>;

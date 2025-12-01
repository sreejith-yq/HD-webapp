import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
import * as relations from './relations';
import type { Env } from '../types/env';

export function getDb(env: Env) {
  if (env.ENVIRONMENT === 'development') {
    const client = new pg.Pool({
      connectionString: env.DATABASE_URL,
    });
    return drizzlePg(client, { schema: { ...schema, ...relations } });
  }

  const sql = neon(env.DATABASE_URL);
  return drizzleNeon(sql, { schema: { ...schema, ...relations } });
}

export type Database = ReturnType<typeof getDb>;

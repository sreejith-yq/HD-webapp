// src/middleware/db.ts
import { createMiddleware } from 'hono/factory';
import { getDb, type Database } from '../db';
import type { Env } from '../types/env';

declare module 'hono' {
  interface ContextVariableMap {
    db: Database;
  }
}

export const dbMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const db = getDb(c.env);
  c.set('db', db);
  await next();
});

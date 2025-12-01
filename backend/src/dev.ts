import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { config } from 'dotenv';
import app from './index';

config({ path: '.env.development' });

const port = 8787;

// Simple in-memory KV mock
const kvStore = new Map<string, string>();
const mockKV = {
    get: async (key: string, type?: string) => {
        const val = kvStore.get(key);
        if (val && type === 'json') return JSON.parse(val);
        return val || null;
    },
    put: async (key: string, value: string, options?: { expirationTtl?: number }) => {
        kvStore.set(key, value);
        if (options?.expirationTtl) {
            setTimeout(() => kvStore.delete(key), options.expirationTtl * 1000);
        }
    },
    delete: async (key: string) => {
        kvStore.delete(key);
    },
};

console.log(`Server is running on port ${port}`);

serve({
    fetch: (req) => app.fetch(req, { ...process.env, AUTH_SESSION: mockKV }),
    port,
});

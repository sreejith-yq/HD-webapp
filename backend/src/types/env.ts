// src/types/env.ts

export interface Env {
  // Secrets
  DATABASE_URL: string;
  JWT_SECRET: string;

  // Storage
  MEDIA_BUCKET: R2Bucket;
  AUTH_SESSION: KVNamespace;

  // URLs
  API_URL: string;
  FRONTEND_URL: string;

  // Optional
  ENVIRONMENT?: 'development' | 'staging' | 'production';
}

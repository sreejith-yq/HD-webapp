// src/types/env.ts

export interface Env {
  // Database
  NEON_DATABASE_URL: string;

  // Authentication
  JWT_SECRET: string;

  // Storage
  MEDIA_BUCKET: R2Bucket;

  // URLs
  API_URL: string;
  FRONTEND_URL: string;

  // Optional
  ENVIRONMENT?: 'development' | 'staging' | 'production';
}

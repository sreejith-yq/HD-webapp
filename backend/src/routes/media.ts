// src/routes/media.ts
import { Hono } from 'hono';
import type { Env } from '../types/env';

const app = new Hono<{ Bindings: Env }>();

// Content type mappings
const MIME_TYPES: Record<string, string> = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'mp4': 'video/mp4',
  'webm': 'video/webm',
  'mov': 'video/quicktime',
  'mp3': 'audio/mpeg',
  'wav': 'audio/wav',
  'ogg': 'audio/ogg',
  'oga': 'audio/ogg',
  'm4a': 'audio/mp4',
  'pdf': 'application/pdf',
};

// Generate unique storage key
function generateStorageKey(doctorId: string, contentType: string, extension: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${doctorId}/${contentType}/${timestamp}-${random}.${extension}`;
}

// POST /api/media/upload-url - Get pre-signed upload URL
app.post('/upload-url', async (c) => {
  const doctorId = c.get('doctorId');
  const body = await c.req.json();

  const { filename, contentType } = body;

  if (!filename || !contentType) {
    return c.json({ error: 'filename and contentType are required' }, 400);
  }

  // Extract extension
  const extension = filename.split('.').pop()?.toLowerCase() || 'bin';

  // Determine content category
  let category = 'other';
  if (contentType.startsWith('image/')) category = 'images';
  else if (contentType.startsWith('video/')) category = 'videos';
  else if (contentType.startsWith('audio/')) category = 'audio';
  else if (contentType === 'application/pdf') category = 'documents';

  // Generate storage key
  const key = generateStorageKey(doctorId, category, extension);

  // For R2, we return the key and let the client upload directly
  // In production, you'd generate a presigned URL
  const uploadUrl = `${c.env.API_URL}/api/media/upload/${key}`;

  return c.json({
    key,
    uploadUrl,
    expiresIn: 3600, // 1 hour
  });
});

// PUT /api/media/upload/:key - Handle direct upload to R2
app.put('/upload/*', async (c) => {
  const key = c.req.path.replace('/api/media/upload/', '');

  if (!key) {
    return c.json({ error: 'Invalid key' }, 400);
  }

  try {
    const contentType = c.req.header('Content-Type') || 'application/octet-stream';
    const body = await c.req.arrayBuffer();

    // Upload to R2
    await c.env.MEDIA_BUCKET.put(key, body, {
      httpMetadata: {
        contentType,
      },
    });

    const mediaUrl = `${c.env.API_URL}/api/media/${key}`;

    return c.json({
      success: true,
      key,
      url: mediaUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

// GET /api/media/:key - Retrieve media file
app.get('/*', async (c) => {
  const key = c.req.path.replace('/api/media/', '');

  if (!key || key === 'upload-url') {
    return c.json({ error: 'Invalid key' }, 400);
  }

  try {
    const object = await c.env.MEDIA_BUCKET.get(key);

    if (!object) {
      return c.json({ error: 'File not found' }, 404);
    }

    // Get extension for fallback content type
    const extension = key.split('.').pop()?.toLowerCase() || '';
    const contentType = object.httpMetadata?.contentType || MIME_TYPES[extension] || 'application/octet-stream';

    // Return file with appropriate headers
    return new Response(object.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // 1 year cache
        'ETag': object.httpEtag,
      },
    });
  } catch (error) {
    console.error('Retrieval error:', error);
    return c.json({ error: 'Retrieval failed' }, 500);
  }
});

export default app;

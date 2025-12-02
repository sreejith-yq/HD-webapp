// src/routes/conversations.ts
import { Hono } from 'hono';
import { eq, and, desc, lt, sql, or, ilike } from 'drizzle-orm';
import type { Env } from '../types/env';
import { conversations, messages, patients, patientProgramEnrollments, therapyPrograms } from '../db/schema';

const app = new Hono<{ Bindings: Env }>();

// GET /api/conversations - List conversations with filtering
app.get('/', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');

  const type = c.req.query('type'); // 'all' | 'query' | 'checkin'
  const status = c.req.query('status'); // 'open' | 'closed'
  const search = c.req.query('search');
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');

  // Build where conditions
  const conditions = [eq(conversations.doctorId, doctorId)];

  if (type && type !== 'all') {
    conditions.push(eq(conversations.type, type));
  }

  if (status) {
    conditions.push(eq(conversations.status, status));
  }

  // Get conversations with patient and program info
  let query = db
    .select({
      id: conversations.id,
      type: conversations.type,
      status: conversations.status,
      unreadCount: conversations.unreadCount,
      lastMessageAt: conversations.lastMessageAt,
      lastMessagePreview: conversations.lastMessagePreview,
      lastMessageSender: conversations.lastMessageSender,
      createdAt: conversations.createdAt,
      patient: {
        id: patients.id,
        name: patients.name,
        avatarUrl: patients.avatarUrl,
      },
      program: {
        id: therapyPrograms.id,
        name: therapyPrograms.name,
        icon: therapyPrograms.icon,
        color: therapyPrograms.color,
      },
    })
    .from(conversations)
    .innerJoin(patients, eq(conversations.patientId, patients.id))
    .leftJoin(patientProgramEnrollments, eq(conversations.enrollmentId, patientProgramEnrollments.id))
    .leftJoin(therapyPrograms, eq(patientProgramEnrollments.therapyProgramId, therapyPrograms.id))
    .$dynamic(); // Enable dynamic query building

  // Apply conditions
  query = query.where(and(...conditions));

  // Apply search filter if provided
  if (search) {
    const searchConditions = or(
      ilike(patients.name, `%${search}%`),
      ilike(conversations.lastMessagePreview, `%${search}%`)
    );
    query = query.where(and(...conditions, searchConditions));
  }

  // Apply sorting and pagination
  const results = await query
    .orderBy(desc(conversations.lastMessageAt))
    .limit(limit)
    .offset(offset);

  // Get counts for badges
  const countsResult = await db
    .select({
      total: sql<number>`count(*)::int`,
      unread: sql<number>`sum(${conversations.unreadCount})::int`,
      queries: sql<number>`count(*) filter (where ${conversations.type} = 'query' and ${conversations.status} = 'open')::int`,
      checkins: sql<number>`count(*) filter (where ${conversations.type} = 'checkin' and ${conversations.status} = 'open')::int`,
    })
    .from(conversations)
    .where(eq(conversations.doctorId, doctorId));

  const counts = countsResult[0] || { total: 0, unread: 0, queries: 0, checkins: 0 };

  return c.json({
    data: results,
    counts: {
      total: counts.total || 0,
      unread: counts.unread || 0,
      queries: counts.queries || 0,
      checkins: counts.checkins || 0,
    },
    pagination: { limit, offset, total: counts.total || 0 },
  });
});

// POST /api/conversations - Create new conversation
app.post('/', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');
  const body = await c.req.json();

  const { patientId, enrollmentId, type = 'query', initialMessage } = body;

  if (!patientId) {
    return c.json({ error: 'patientId is required' }, 400);
  }

  const now = new Date();

  // Create conversation
  const [newConversation] = await db.insert(conversations).values({
    doctorId,
    patientId,
    enrollmentId,
    type,
    status: 'open',
    unreadCount: 0,
    lastMessageAt: now,
    lastMessagePreview: initialMessage || null,
    lastMessageSender: initialMessage ? 'Doctor' : null,
    createdAt: now,
    updatedAt: now,
  }).returning();

  // Create initial message if provided
  if (initialMessage) {
    await db.insert(messages).values({
      conversationId: newConversation.id,
      content: initialMessage,
      contentType: 'Text',
      sender: 'Doctor',
      read: true,
      timestamp: now,
      createdAt: now,
    });
  }

  return c.json({ id: newConversation.id }, 201);
});

// GET /api/conversations/:id - Get conversation details
app.get('/:id', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');
  const conversationId = c.req.param('id');

  const result = await db
    .select({
      id: conversations.id,
      type: conversations.type,
      status: conversations.status,
      unreadCount: conversations.unreadCount,
      lastMessageAt: conversations.lastMessageAt,
      createdAt: conversations.createdAt,
      patient: {
        id: patients.id,
        name: patients.name,
        phone: patients.phone,
        avatarUrl: patients.avatarUrl,
      },
      program: {
        id: therapyPrograms.id,
        name: therapyPrograms.name,
        icon: therapyPrograms.icon,
        color: therapyPrograms.color,
      },
    })
    .from(conversations)
    .innerJoin(patients, eq(conversations.patientId, patients.id))
    .leftJoin(patientProgramEnrollments, eq(conversations.enrollmentId, patientProgramEnrollments.id))
    .leftJoin(therapyPrograms, eq(patientProgramEnrollments.therapyProgramId, therapyPrograms.id))
    .where(and(
      eq(conversations.id, conversationId),
      eq(conversations.doctorId, doctorId)
    ))
    .limit(1);

  if (result.length === 0) {
    return c.json({ error: 'Conversation not found' }, 404);
  }

  return c.json({ data: result[0] });
});

// GET /api/conversations/:id/messages - Get messages with pagination
app.get('/:id/messages', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');
  const conversationId = c.req.param('id');

  const limit = parseInt(c.req.query('limit') || '50');
  const before = c.req.query('before'); // Cursor-based pagination

  // Verify access
  const conversation = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, conversationId),
      eq(conversations.doctorId, doctorId)
    ),
  });

  if (!conversation) {
    return c.json({ error: 'Conversation not found' }, 404);
  }

  // Build query conditions
  const conditions = [eq(messages.conversationId, conversationId)];
  if (before) {
    conditions.push(lt(messages.timestamp, new Date(before)));
  }

  const results = await db
    .select()
    .from(messages)
    .where(and(...conditions))
    .orderBy(desc(messages.timestamp))
    .limit(limit);

  return c.json({
    data: results.reverse(), // Return in chronological order
    pagination: {
      limit,
      hasMore: results.length === limit,
      oldestTimestamp: results.length > 0 ? results[0].timestamp : null,
    },
  });
});

// POST /api/conversations/:id/messages - Send a message
app.post('/:id/messages', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');
  const conversationId = c.req.param('id');
  const body = await c.req.json();

  const { content, contentType = 'Text', mediaUrl, mediaKey, mediaDuration, mediaThumbnail } = body;

  if (!content && !mediaUrl) {
    return c.json({ error: 'content or mediaUrl is required' }, 400);
  }

  // Verify access
  const conversation = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, conversationId),
      eq(conversations.doctorId, doctorId)
    ),
  });

  if (!conversation) {
    return c.json({ error: 'Conversation not found' }, 404);
  }

  const now = new Date();

  // Insert message
  const [newMessage] = await db.insert(messages).values({
    conversationId,
    content: content || '',
    contentType,
    sender: 'Doctor',
    read: true,
    timestamp: now,
    mediaUrl,
    mediaKey,
    mediaDuration,
    mediaThumbnail,
    createdAt: now,
  }).returning();

  // Update conversation
  const preview = contentType === 'Text'
    ? content.substring(0, 100)
    : `[${contentType}]`;

  await db
    .update(conversations)
    .set({
      lastMessageAt: now,
      lastMessagePreview: preview,
      lastMessageSender: 'Doctor',
      status: 'open', // Reopen if closed
      updatedAt: now,
    })
    .where(eq(conversations.id, conversationId));

  return c.json({ id: newMessage.id }, 201);
});

// PUT /api/conversations/:id/read - Mark all messages as read
app.put('/:id/read', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');
  const conversationId = c.req.param('id');

  // Verify access
  const conversation = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, conversationId),
      eq(conversations.doctorId, doctorId)
    ),
  });

  if (!conversation) {
    return c.json({ error: 'Conversation not found' }, 404);
  }

  // Mark all messages as read
  await db
    .update(messages)
    .set({ read: true })
    .where(and(
      eq(messages.conversationId, conversationId),
      eq(messages.sender, 'Patient'),
      eq(messages.read, false)
    ));

  // Reset unread count
  await db
    .update(conversations)
    .set({ unreadCount: 0, updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  return c.json({ success: true });
});

// PUT /api/conversations/:id/close - Close conversation
app.put('/:id/close', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');
  const conversationId = c.req.param('id');

  // Verify access
  const conversation = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, conversationId),
      eq(conversations.doctorId, doctorId)
    ),
  });

  if (!conversation) {
    return c.json({ error: 'Conversation not found' }, 404);
  }

  await db
    .update(conversations)
    .set({ status: 'closed', updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  return c.json({ success: true });
});

// GET /api/conversations/upload-url - Get presigned URL for media upload
app.get('/upload-url', async (c) => {
  const db = c.get('db');
  const doctorId = c.get('doctorId');
  const filename = c.req.query('filename');
  const contentType = c.req.query('contentType');

  if (!filename || !contentType) {
    return c.json({ error: 'filename and contentType are required' }, 400);
  }

  // Generate a unique key
  const key = `uploads/${doctorId}/${Date.now()}-${filename}`;

  // TODO: Integrate with R2 to generate real presigned URL
  // For now, return a mock URL that points to a placeholder or direct upload simulation
  // In a real app, use: await r2.put(key, ...).getSignedUrl()

  return c.json({
    uploadUrl: `https://api.placeholder.com/upload/${key}`, // Mock URL
    publicUrl: `https://r2.example.com/${key}`, // Mock public URL
    key: key,
  });
});

export default app;

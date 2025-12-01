import { sign } from 'hono/jwt';
import { v4 as uuidv4 } from 'uuid';

interface GenerateTokenOptions {
    doctorId: string;
    doctorData: {
        id: string;
        name: string;
        email: string | null;
    };
    secret: string;
    kv: KVNamespace;
    expiresInHours?: number;
}

export async function generateAuthToken({
    doctorId,
    doctorData,
    secret,
    kv,
    expiresInHours = 24,
}: GenerateTokenOptions): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const sessionId = uuidv4();
    const expiresInSeconds = expiresInHours * 60 * 60;

    // Store session in KV
    await kv.put(sessionId, JSON.stringify(doctorData), {
        expirationTtl: expiresInSeconds,
    });

    const payload = {
        doctorId,
        sessionId, // Include sessionId in JWT
        iat: now,
        exp: now + expiresInSeconds,
        jti: sessionId, // Use sessionId as JTI
    };

    return await sign(payload, secret);
}

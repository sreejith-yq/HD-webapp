import { sign } from 'hono/jwt';
import { v4 as uuidv4 } from 'uuid';

interface GenerateTokenOptions {
    doctorId: string;
    secret: string;
    expiresInHours?: number;
}

export async function generateAuthToken({
    doctorId,
    secret,
    expiresInHours = 24,
}: GenerateTokenOptions): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    const payload = {
        doctorId,
        iat: now,
        exp: now + (expiresInHours * 60 * 60),
        jti: uuidv4(), // Unique token ID
    };

    return await sign(payload, secret);
}

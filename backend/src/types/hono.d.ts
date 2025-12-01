import 'hono';

declare module 'hono' {
    interface ContextVariableMap {
        doctorId: string;
        doctor: {
            id: string;
            name: string;
            email: string | null;
        };
        sessionId: string;
    }
}

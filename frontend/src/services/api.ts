import { useAuthStore } from '../store/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

type RequestOptions = Omit<RequestInit, 'headers'> & {
    headers?: Record<string, string>;
};

async function fetchWithAuth(endpoint: string, options: RequestOptions = {}) {
    const { token, logout } = useAuthStore.getState();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        logout();
        window.location.href = '/'; // Redirect to home/login on 401
    }

    return response;
}

export const api = {
    auth: {
        validate: async (token: string) => {
            const response = await fetchWithAuth(`/api/auth/validate?token=${token}`);
            return response.json();
        },
        me: async () => {
            const response = await fetchWithAuth('/api/auth/me');
            return response.json();
        },
        logout: async () => {
            const response = await fetchWithAuth('/api/auth/logout', { method: 'POST' });
            return response.json();
        },
    },
    // Add other resources here
};

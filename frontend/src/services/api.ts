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
    dashboard: {
        getStats: async () => {
            const response = await fetchWithAuth('/api/dashboard/stats');
            return response.json();
        },
        getSchedule: async (date?: string) => {
            const query = date ? `?date=${date}` : '';
            const response = await fetchWithAuth(`/api/dashboard/schedule${query}`);
            return response.json();
        },
        getWeeklySummary: async () => {
            const response = await fetchWithAuth('/api/dashboard/weekly-summary');
            return response.json();
        },
    },
    conversations: {
        list: async (params?: { type?: string; status?: string; search?: string; limit?: number; offset?: number }) => {
            const query = new URLSearchParams(params as any).toString();
            const response = await fetchWithAuth(`/api/conversations?${query}`);
            return response.json();
        },
        get: async (id: string) => {
            const response = await fetchWithAuth(`/api/conversations/${id}`);
            return response.json();
        },
        getMessages: async (id: string, params?: { limit?: number; before?: string }) => {
            const query = new URLSearchParams(params as any).toString();
            const response = await fetchWithAuth(`/api/conversations/${id}/messages?${query}`);
            return response.json();
        },
        sendMessage: async (id: string, data: { content?: string; contentType?: string; mediaUrl?: string }) => {
            const response = await fetchWithAuth(`/api/conversations/${id}/messages`, {
                method: 'POST',
                body: JSON.stringify(data),
            });
            return response.json();
        },
        create: async (data: { patientId: string; initialMessage?: string }) => {
            const response = await fetchWithAuth('/api/conversations', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            return response.json();
        },
        markRead: async (id: string) => {
            const response = await fetchWithAuth(`/api/conversations/${id}/read`, { method: 'PUT' });
            return response.json();
        },
        close: async (id: string) => {
            const response = await fetchWithAuth(`/api/conversations/${id}/close`, { method: 'PUT' });
            return response.json();
        },
        getUploadUrl: async (filename: string, contentType: string) => {
            const response = await fetchWithAuth(`/api/conversations/upload-url?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(contentType)}`);
            return response.json();
        },
    },
    patients: {
        list: async (params?: { limit?: number; offset?: number }) => {
            const query = new URLSearchParams(params as any).toString();
            const response = await fetchWithAuth(`/api/patients?${query}`);
            return response.json();
        },
        search: async (query: string) => {
            const response = await fetchWithAuth(`/api/patients/search?q=${query}`);
            return response.json();
        },
        get: async (id: string) => {
            const response = await fetchWithAuth(`/api/patients/${id}`);
            return response.json();
        },
        getVitals: async (id: string) => {
            const response = await fetchWithAuth(`/api/patients/${id}/vitals`);
            return response.json();
        },
        getPrograms: async (id: string) => {
            const response = await fetchWithAuth(`/api/patients/${id}/programs`);
            return response.json();
        },
        getPrescriptions: async (id: string) => {
            const response = await fetchWithAuth(`/api/patients/${id}/prescriptions`);
            return response.json();
        },
        getLabReports: async (id: string) => {
            const response = await fetchWithAuth(`/api/patients/${id}/lab-reports`);
            return response.json();
        },
        requestHistory: async (id: string, data: { message: string; requestPrescriptions?: boolean; requestLabReports?: boolean; requestOtherPrograms?: boolean }) => {
            const response = await fetchWithAuth(`/api/patients/${id}/history-request`, {
                method: 'POST',
                body: JSON.stringify(data),
            });
            return response.json();
        },
        getHistoryRequestStatus: async (id: string) => {
            const response = await fetchWithAuth(`/api/patients/${id}/history-request`);
            return response.json();
        },
    },
    // Add other resources here
};

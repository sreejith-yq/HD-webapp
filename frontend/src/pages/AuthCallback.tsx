import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { api } from '../services/api';

export function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setError('No token provided');
            return;
        }

        const validateToken = async () => {
            try {
                // Validate token first
                const validateResponse = await api.auth.validate(token);
                if (!validateResponse.valid) {
                    throw new Error(validateResponse.error || 'Token validation failed');
                }

                // Temporarily set token in store so api client can use it for subsequent requests
                useAuthStore.setState({ token });

                // Fetch current user details (optional if validate returns user, but good for consistency)
                // The validate endpoint now returns the doctor object too, so we can use that.
                const user = validateResponse.doctor;

                // Update store with user details
                setAuth(token, user);

                // Redirect to home/dashboard
                navigate('/');
            } catch (err) {
                console.error('Login failed', err);
                setError(`Invalid or expired token. Error: ${err instanceof Error ? err.message : String(err)}`);
                useAuthStore.getState().logout();
            }
        };

        validateToken();
    }, [searchParams, navigate, setAuth]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-800 p-4">
                <h1 className="text-2xl font-bold mb-2">Login Failed</h1>
                <p>{error}</p>
                <p className="text-sm mt-2 text-gray-600">API URL: {import.meta.env.VITE_API_URL || 'http://localhost:8787'}</p>
                <a href="/" className="mt-4 underline">Go Home</a>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Authenticating...</p>
        </div>
    );
}

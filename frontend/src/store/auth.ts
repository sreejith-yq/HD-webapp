import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Doctor {
    id: string;
    name: string;
    email: string | null;
}

interface AuthState {
    token: string | null;
    doctor: Doctor | null;
    isAuthenticated: boolean;
    setAuth: (token: string, doctor: Doctor) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            doctor: null,
            isAuthenticated: false,
            setAuth: (token, doctor) =>
                set({ token, doctor, isAuthenticated: true }),
            logout: () =>
                set({ token: null, doctor: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage', // unique name for sessionStorage key
            storage: createJSONStorage(() => sessionStorage), // use sessionStorage by default
        }
    )
);

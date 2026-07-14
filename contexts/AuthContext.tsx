'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, getUser, login as apiLogin, logout as apiLogout } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (u: string, p: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('admin_token');
            if (token) {
                try {
                    const user = await getUser(token);
                    if (user) {
                        setUser(user);
                    } else {
                        localStorage.removeItem('admin_token');
                        localStorage.removeItem('admin_refresh_token');
                    }
                } catch (error) {
                    console.error("Auth check failed", error);
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_refresh_token');
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (username: string, password: string) => {
        const data = await apiLogin(username, password) as any;
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_refresh_token', data.refreshToken);
        // Set cookie for middleware
        document.cookie = `admin_token=${data.token}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `admin_refresh_token=${data.refreshToken}; path=/; max-age=86400; SameSite=Strict`;
        setUser(data.user);
        router.push('/');
    };

    const logout = async () => {
        await apiLogout();
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_refresh_token');
        document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'admin_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        setUser(null);
        router.push('/login');
    };

    // Protect routes mechanism
    useEffect(() => {
        if (!isLoading && !user && pathname !== '/login') {
            //router.push('/login'); // Let Middleware handle this for better UX, but this is a falback
        }
    }, [user, isLoading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

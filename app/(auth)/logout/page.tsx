'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
    const { logout } = useAuth();

    useEffect(() => {
        const performLogout = async () => {
            // Small delay to show the "Signing out" state or ensure context is ready
            setTimeout(() => {
                logout();
            }, 1000);
        };
        performLogout();
    }, [logout]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
            <Loader2 className="h-8 w-8 animate-spin text-dosti-500 mb-4" />
            <h1 className="text-xl font-medium">Signing you out...</h1>
            <p className="text-slate-400 text-sm mt-2">Please wait while we securely end your session.</p>
        </div>
    );
}

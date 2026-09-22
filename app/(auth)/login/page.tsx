'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loader2, SlidersHorizontal } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('yaroapp@gmail.com');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const [isSigningIn, setIsSigningIn] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSigningIn(true);
        try {
            await login(username, password);
        } catch (err: any) {
            setError(err?.message || 'Invalid credentials');
            setIsSigningIn(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-dosti-900/40 via-slate-950 to-slate-950 p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-dosti-400 to-dosti-600 bg-clip-text text-transparent mb-2">
                        Meethi Management
                    </h1>
                    <p className="text-slate-400">Sign in to manage app configuration</p>
                </div>

                <Card glass className="border-slate-800/50">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Username</label>
                                <Input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="admin"
                                    disabled={isSigningIn}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Password</label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="•••••••"
                                    disabled={isSigningIn}
                                />
                            </div>

                            {error && (
                                <div className="text-sm text-red-400 text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                                    {error}
                                </div>
                            )}

                            <Button className="w-full bg-dosti-600 hover:bg-dosti-500" disabled={isSigningIn}>
                                {isSigningIn ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing In...
                                    </>
                                ) : (
                                    <>
                                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                                        Sign In
                                    </>
                                )}
                            </Button>

                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

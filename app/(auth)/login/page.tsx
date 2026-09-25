'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Image from 'next/image';
import { Loader2, Smartphone, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

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
            toast.success('Logged in to Management Console');
        } catch (err: any) {
            setError(err?.message || 'Invalid credentials');
            setIsSigningIn(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#070a13] p-4 text-white overflow-hidden">
            {/* Ambient Aurora Glow Background */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -top-[20%] left-[20%] h-[550px] w-[550px] rounded-full bg-cyan-500/15 blur-[160px]" />
                <div className="absolute top-[40%] -right-[10%] h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[150px]" />
                <div className="absolute -bottom-[20%] left-[30%] h-[450px] w-[450px] rounded-full bg-violet-600/15 blur-[160px]" />
            </div>

            <div className="relative z-10 w-full max-w-md space-y-6">
                {/* Brand Header */}
                <div className="text-center space-y-2.5">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md shadow-lg shadow-cyan-500/10">
                        <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                            Management Control Hub
                        </span>
                    </div>

                    <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                        YARO App Studio
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm">
                        App releases, APK versions, in-app economy, and content moderation.
                    </p>
                </div>

                <Card className="bg-[#0d1222]/85 border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-3xl overflow-hidden">
                    <CardHeader className="text-center pb-2 pt-6">
                        <div className="relative mx-auto mb-3 h-16 w-16 overflow-hidden rounded-2xl border-2 border-pink-500/40 bg-slate-950 shadow-[0_0_24px_rgba(236,72,153,0.35)] p-0.5">
                            <Image src="/logo.png" alt="Yaro Logo" width={64} height={64} className="rounded-[14px] object-cover" priority />
                        </div>
                        <CardTitle className="text-xl font-bold text-white tracking-tight">
                            Console Access
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-400">
                            Enter management credentials to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-2">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Username / Email</span>
                                </label>
                                <Input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="admin@example.com"
                                    disabled={isSigningIn}
                                    required
                                    className="bg-slate-950/70 border-white/10 text-white placeholder-slate-500 text-xs rounded-xl h-11"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Password</span>
                                </label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    disabled={isSigningIn}
                                    required
                                    className="bg-slate-950/70 border-white/10 text-white placeholder-slate-500 text-xs rounded-xl h-11"
                                />
                            </div>

                            {error && (
                                <div className="text-xs text-rose-300 text-center bg-rose-500/15 p-3 rounded-xl border border-rose-500/30">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:brightness-110 text-white font-bold text-xs rounded-xl h-11 shadow-lg shadow-cyan-500/25 transition-all mt-2"
                                disabled={isSigningIn}
                            >
                                {isSigningIn ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Authenticating Console...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="mr-2 h-4 w-4" />
                                        Sign In to Console
                                        <ArrowRight className="ml-2 h-4 w-4" />
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

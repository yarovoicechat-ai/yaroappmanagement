'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { Coins, Plus, Search, DollarSign, UserCheck, Calendar, CheckCircle2, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export interface VerifiedUser {
    userId: number;
    name: string;
    userName: string;
    meethiId: string;
    image: string;
    coins: number;
    diamonds: number;
    role?: string;
    isBlocked?: boolean;
}

export default function UserRechargePage() {
    const [userId, setUserId] = useState('');
    const [inrAmount, setInrAmount] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    // Rate: ~16.7 Diamonds per 1 Rupee
    const DIAMONDS_PER_RUPEE = 16.7;

    // Verification states
    const [verifying, setVerifying] = useState(false);
    const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(null);
    const [isVerified, setIsVerified] = useState(false);

    // Mock logs
    const [logs, setLogs] = useState<any[]>([
        { id: '1', userId: 10002, name: 'Sanjay Dutt', amount: 5000, price: 50, date: '2026-07-08 14:02' },
        { id: '2', userId: 10008, name: 'Katrina Kaif', amount: 12000, price: 100, date: '2026-07-08 15:45' }
    ]);

    const handleUserIdChange = (val: string) => {
        setUserId(val);
        setIsVerified(false);
        setVerifiedUser(null);
    };

    const handleInrChange = (val: string) => {
        setInrAmount(val);
        if (!val || isNaN(Number(val))) {
            setAmount('');
            return;
        }
        const numRs = Number(val);
        const calcDiamonds = Math.round(numRs * DIAMONDS_PER_RUPEE);
        setAmount(calcDiamonds.toString());
    };

    const handleDiamondsChange = (val: string) => {
        setAmount(val);
        if (!val || isNaN(Number(val))) {
            setInrAmount('');
            return;
        }
        const numDiamonds = Number(val);
        const calcRs = Math.round(numDiamonds / DIAMONDS_PER_RUPEE);
        setInrAmount(calcRs.toString());
    };

    const handleVerifyUser = async () => {
        if (!userId.trim()) {
            return toast.error("Please enter a User ID first");
        }

        setVerifying(true);
        try {
            const res = await apiClient.get(`/api/admin/users/verify/${userId.trim()}`);
            if (res.success && res.data?.user) {
                setVerifiedUser(res.data.user);
                setIsVerified(true);
                toast.success(`User Verified: ${res.data.user.name}`);
            } else {
                setVerifiedUser(null);
                setIsVerified(false);
                toast.error(res.message || "User not found with this ID");
            }
        } catch (err: any) {
            setVerifiedUser(null);
            setIsVerified(false);
            const errMsg = err?.message || err?.error || "Failed to verify user ID";
            toast.error(errMsg);
        } finally {
            setVerifying(false);
        }
    };

    const handleRecharge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !amount) return;

        if (!isVerified || !verifiedUser) {
            return toast.error("Please click Verify to verify the User ID before recharging!");
        }

        setLoading(true);
        try {
            const res = await apiClient.post('/api/admin/users/add-diamonds', {
                userId: Number(verifiedUser.userId),
                diamonds: Number(amount)
            });
            if (res.success || res.data?.success) {
                const newLog = {
                    id: Date.now().toString(),
                    userId: verifiedUser.userId,
                    name: verifiedUser.name,
                    amount: parseInt(amount),
                    price: parseInt(amount) * 0.01,
                    date: new Date().toISOString().replace('T', ' ').substring(0, 16)
                };
                setLogs(prev => [newLog, ...prev]);
                toast.success(`Successfully recharged User ID ${verifiedUser.userId} (${verifiedUser.name}) with ${amount} Diamonds`);
                setUserId('');
                setInrAmount('');
                setAmount('');
                setIsVerified(false);
                setVerifiedUser(null);
            } else {
                toast.error(res.message || res.data?.message || 'Recharge failed');
            }
        } catch (error: any) {
            console.error('Recharge Error:', error);
            toast.error(error.message || error.response?.data?.message || 'Error communicating with backend');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">User Diamond Recharge</h2>
                    <p className="text-muted-foreground mt-1 font-medium font-sans">Credit Diamonds packages directly to verified user profiles</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Recharge form */}
                <Card className="glass-card md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Plus size={20} />
                            Allocate Diamonds
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRecharge} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Target User ID</label>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Enter User ID or Username"
                                        value={userId}
                                        onChange={(e) => handleUserIdChange(e.target.value)}
                                        required
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleVerifyUser}
                                        disabled={verifying || !userId.trim()}
                                        className={`font-semibold shrink-0 ${
                                            isVerified
                                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                                : 'bg-primary hover:bg-primary/90 text-white'
                                        }`}
                                    >
                                        {verifying ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : isVerified ? (
                                            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Verified</span>
                                        ) : (
                                            <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Verify</span>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Verified User Profile Card */}
                            {verifiedUser && isVerified && (
                                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/50 flex items-center gap-3.5 animate-in fade-in duration-200 shadow-lg">
                                    <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-emerald-400 bg-slate-800 shrink-0">
                                        {verifiedUser.image ? (
                                            <img src={verifiedUser.image} alt={verifiedUser.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-emerald-950 text-emerald-300 font-bold text-lg">
                                                {verifiedUser.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="font-bold text-sm text-slate-100 truncate">{verifiedUser.name}</h4>
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
                                            <span className="text-emerald-400 font-semibold">{verifiedUser.userName}</span>
                                            <span>•</span>
                                            <span className="font-mono text-slate-300">ID: #{verifiedUser.userId}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-[11px]">
                                            <span className="text-amber-400 font-medium">🪙 {verifiedUser.coins?.toLocaleString()}</span>
                                            <span className="text-cyan-400 font-medium">💎 {verifiedUser.diamonds?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!isVerified && userId.trim() !== '' && (
                                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                                    <span>Click <strong>Verify</strong> to confirm user profile details before recharging.</span>
                                </div>
                            )}

                            {/* Rupee (₹) Amount Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 flex items-center justify-between">
                                    <span>Amount in Rupees (₹ INR)</span>
                                    <span className="text-xs text-primary font-normal">Auto-Calculator</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="Enter Rupees (e.g. 100)"
                                        value={inrAmount}
                                        onChange={(e) => handleInrChange(e.target.value)}
                                    />
                                    <span className="absolute right-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                                </div>
                            </div>

                            {/* Calculated Diamonds Count Display & Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Calculated Diamonds (💎)</label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="e.g. 1670"
                                        value={amount}
                                        onChange={(e) => handleDiamondsChange(e.target.value)}
                                        required
                                    />
                                    <Coins className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>

                            {/* Conversion Info Badge */}
                            {amount && Number(amount) > 0 && (
                                <div className="p-3 rounded-lg bg-slate-900/80 border border-primary/30 flex items-center justify-between text-xs">
                                    <span className="text-slate-300 font-medium">Recharge Total:</span>
                                    <span className="text-primary font-bold text-sm flex items-center gap-1">
                                        {inrAmount ? `₹${Number(inrAmount).toLocaleString()}` : ''} ➔ 💎 {Number(amount).toLocaleString()} Diamonds
                                    </span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading || !isVerified || !verifiedUser}
                            >
                                {loading ? 'Crediting Diamonds...' : 'Credit Diamonds'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* History Logs */}
                <Card className="glass-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Calendar size={20} className="text-primary animate-pulse" />
                            Recent Users Topup Logs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold text-slate-300">User ID</TableHead>
                                    <TableHead className="font-bold text-slate-300">User Profile Name</TableHead>
                                    <TableHead className="font-bold text-slate-300">Diamonds Credited</TableHead>
                                    <TableHead className="font-bold text-slate-300">Valued Price (USD)</TableHead>
                                    <TableHead className="font-bold text-slate-300">Date Timestamp</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-muted/30">
                                        <TableCell className="font-mono text-xs text-primary font-bold">{log.userId}</TableCell>
                                        <TableCell className="font-semibold text-slate-200">{log.name}</TableCell>
                                        <TableCell className="font-bold text-emerald-400">+{log.amount.toLocaleString()} diamonds</TableCell>
                                        <TableCell className="font-semibold text-slate-300">${log.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground font-semibold">{log.date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

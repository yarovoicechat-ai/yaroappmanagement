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
import { Coins, Plus, Search, DollarSign, UserCheck, Calendar } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function UserRechargePage() {
    const [userId, setUserId] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    // Mock logs
    const [logs, setLogs] = useState<any[]>([
        { id: '1', userId: 10002, name: 'Sanjay Dutt', amount: 5000, price: 50, date: '2026-07-08 14:02' },
        { id: '2', userId: 10008, name: 'Katrina Kaif', amount: 12000, price: 100, date: '2026-07-08 15:45' }
    ]);

    const handleRecharge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !amount) return;

        setLoading(true);
        try {
            const res = await apiClient.post('/api/admin/users/add-diamonds', {
                userId: Number(userId),
                diamonds: Number(amount)
            });
            if (res.data?.success) {
                const newLog = {
                    id: Date.now().toString(),
                    userId: parseInt(userId),
                    name: `User_${userId}`,
                    amount: parseInt(amount),
                    price: parseInt(amount) * 0.01,
                    date: new Date().toISOString().replace('T', ' ').substring(0, 16)
                };
                setLogs(prev => [newLog, ...prev]);
                toast.success(`Successfully recharged User ID ${userId} with ${amount} Diamonds`);
                setUserId('');
                setAmount('');
            } else {
                toast.error(res.data?.message || 'Recharge failed');
            }
        } catch (error: any) {
            console.error('Recharge Error:', error);
            toast.error(error.response?.data?.message || 'Error communicating with backend');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">User Diamond Recharge</h2>
                    <p className="text-muted-foreground mt-1 font-medium font-sans">Credit Diamonds packages directly to user profiles</p>
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
                                <Input
                                    type="number"
                                    placeholder="e.g. 10002"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Diamonds Amount</label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="e.g. 5000"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                    />
                                    <Coins className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <Button type="submit" className="w-full font-bold" disabled={loading}>
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

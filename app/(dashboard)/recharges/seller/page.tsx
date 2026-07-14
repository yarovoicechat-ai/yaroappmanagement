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

export default function SellerRechargePage() {
    const [sellerCode, setSellerCode] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    // Mock logs
    const [logs, setLogs] = useState<any[]>([
        { id: '1', sellerCode: 'SEL881', name: 'Alibaba Coin Distributor', amount: 500000, date: '2026-07-08 11:20' },
        { id: '2', sellerCode: 'SEL292', name: 'Global Recharge Hub', amount: 1000000, date: '2026-07-08 14:15' }
    ]);

    const handleRecharge = (e: React.FormEvent) => {
        e.preventDefault();
        if (!sellerCode || !amount) return;

        setLoading(true);
        setTimeout(() => {
            const newLog = {
                id: Date.now().toString(),
                sellerCode: sellerCode.toUpperCase(),
                name: `Agency_${sellerCode}`,
                amount: parseInt(amount),
                date: new Date().toISOString().replace('T', ' ').substring(0, 16)
            };
            setLogs([newLog, ...logs]);
            toast.success(`Successfully credited Seller ${sellerCode} with ${amount} Coins limit`);
            setSellerCode('');
            setAmount('');
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-between justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Seller Recharge</h2>
                    <p className="text-muted-foreground mt-1 font-medium font-sans">Credit wallet distribution limit allocations to authorized coin sellers</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Recharge form */}
                <Card className="glass-card md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Plus size={20} />
                            Allocate Seller Limit
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRecharge} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Seller Agency Code</label>
                                <Input
                                    placeholder="e.g. SEL881"
                                    value={sellerCode}
                                    onChange={(e) => setSellerCode(e.target.value)}
                                    required
                                    className="uppercase"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Coins limit to credit</label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="e.g. 500000"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                    />
                                    <Coins className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <Button type="submit" className="w-full font-bold" disabled={loading}>
                                {loading ? 'Crediting Limit...' : 'Credit Coins Limit'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* History Logs */}
                <Card className="glass-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Calendar size={20} className="text-primary animate-pulse" />
                            Recent Sellers Limit Allocation Audit Logs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold text-slate-300">Seller Code</TableHead>
                                    <TableHead className="font-bold text-slate-300">Agency Name</TableHead>
                                    <TableHead className="font-bold text-slate-300">Credit Limit Added</TableHead>
                                    <TableHead className="font-bold text-slate-300">Date Timestamp</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-muted/30">
                                        <TableCell className="font-mono text-xs text-primary font-bold">{log.sellerCode}</TableCell>
                                        <TableCell className="font-semibold text-slate-200">{log.name}</TableCell>
                                        <TableCell className="font-bold text-emerald-400">+{log.amount.toLocaleString()} coins limit</TableCell>
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

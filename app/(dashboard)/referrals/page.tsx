'use client';

import { useState, useEffect } from 'react';
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
import { Plus, Trash2, Gift, TrendingUp, Users, Calendar, Coins } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReferralsPage() {
    const [stats, setStats] = useState<any>(null);
    const [promoCodes, setPromoCodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [code, setCode] = useState('');
    const [rewardCoins, setRewardCoins] = useState('');
    const [usageLimit, setUsageLimit] = useState('100');
    const [expiresAt, setExpiresAt] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        try {
            setLoading(true);
            const [statsRes, codesRes] = await Promise.all([
                apiClient.get('/api/admin/referrals/stats'),
                apiClient.get('/api/admin/referrals/promo-codes')
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (codesRes.success) setPromoCodes(codesRes.data || []);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch referral program data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || !rewardCoins) {
            toast.error('Code and reward value are required');
            return;
        }

        try {
            setSubmitting(true);
            const response = await apiClient.post('/api/admin/referrals/promo-code', {
                code,
                rewardCoins,
                usageLimit,
                expiresAt: expiresAt || undefined
            });

            if (response.success) {
                toast.success('Promo Code generated successfully');
                setCode('');
                setRewardCoins('');
                setUsageLimit('100');
                setExpiresAt('');
                fetchReferralData();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create promo code');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCode = async (codeId: string) => {
        if (!confirm('Are you sure you want to delete this promo code?')) return;
        try {
            const response = await apiClient.delete(`/api/admin/referrals/promo-code/${codeId}`);
            if (response.success) {
                toast.success('Promo code deleted successfully');
                fetchReferralData();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete promo code');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Referrals & Coupons</h2>
                <p className="text-muted-foreground mt-1 font-medium font-sans">Manage referral payouts, conversion analytics, and promo codes</p>
            </div>

            {/* Quick stats cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-300">Total Referrals Link Users</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-100">{stats?.totalReferrals || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1 font-semibold">Joined via referral code</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-300">Converted VIP/Paying Users</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-100">{stats?.convertedVIPs || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1 font-semibold">Active high-paying accounts</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-300">Total Referral Payouts</CardTitle>
                        <Coins className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-100">${stats?.totalReferralPayouts || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1 font-semibold">Coins cash commission payouts</p>
                    </CardContent>
                </Card>
            </div>

            {/* Graphs / Coupon lists */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="glass-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-slate-200">Referrals Analytics (Daily)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.analytics || []}>
                                <defs>
                                    <linearGradient id="invitesGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                                <Area type="monotone" dataKey="invites" stroke="#8b5cf6" fillOpacity={1} fill="url(#invitesGrad)" name="Total Invites" />
                                <Area type="monotone" dataKey="conversions" stroke="#10b981" fillOpacity={0} name="VIP Conversions" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Create Promo Code form */}
                <Card className="glass-card md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Plus size={20} />
                            Generate Promo Code
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateCode} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Promo Code</label>
                                <Input
                                    placeholder="e.g. WELCOME50"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                    className="uppercase font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Coins Reward Value</label>
                                <Input
                                    type="number"
                                    placeholder="50"
                                    value={rewardCoins}
                                    onChange={(e) => setRewardCoins(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Max Usage Limit</label>
                                <Input
                                    type="number"
                                    placeholder="100"
                                    value={usageLimit}
                                    onChange={(e) => setUsageLimit(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Expiration Date</label>
                                <Input
                                    type="date"
                                    value={expiresAt}
                                    onChange={(e) => setExpiresAt(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full font-bold" disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create Promo Code'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Promo Codes list */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <Gift size={20} />
                        Promo Coupons List
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold text-slate-300">Code</TableHead>
                                <TableHead className="font-bold text-slate-300">Coins Gift Value</TableHead>
                                <TableHead className="font-bold text-slate-300">Usage Stats</TableHead>
                                <TableHead className="font-bold text-slate-300">Expiry Date</TableHead>
                                <TableHead className="font-bold text-slate-300">Status</TableHead>
                                <TableHead className="text-right font-bold text-slate-300">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">Loading coupons...</TableCell>
                                </TableRow>
                            ) : promoCodes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-400 font-medium">No promo codes configured</TableCell>
                                </TableRow>
                            ) : (
                                promoCodes.map((promo) => (
                                    <TableRow key={promo._id} className="hover:bg-muted/30">
                                        <TableCell className="font-mono font-bold text-primary">{promo.code}</TableCell>
                                        <TableCell className="font-semibold text-slate-300">
                                            <div className="flex items-center gap-1">
                                                <Coins size={14} className="text-yellow-500" />
                                                <span>{promo.rewardCoins} coins</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold text-slate-300">
                                            {promo.usageCount} / {promo.usageLimit} uses
                                        </TableCell>
                                        <TableCell className="font-semibold text-slate-400 text-xs">
                                            {promo.expiresAt ? (
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    <span>{new Date(promo.expiresAt).toLocaleDateString()}</span>
                                                </div>
                                            ) : 'No Expiry'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={promo.isActive && (!promo.expiresAt || new Date(promo.expiresAt) > new Date()) ? "success" : "destructive"}>
                                                {promo.isActive && (!promo.expiresAt || new Date(promo.expiresAt) > new Date()) ? 'Active' : 'Expired/Disabled'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDeleteCode(promo._id)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

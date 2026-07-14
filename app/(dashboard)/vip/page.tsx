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
import { Plus, Trash2, ShieldCheck, Crown, ShieldAlert, Award, CreditCard } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function VipPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [name, setName] = useState('');
    const [durationDays, setDurationDays] = useState('30');
    const [coinsCost, setCoinsCost] = useState('0');
    const [price, setPrice] = useState('');
    const [benefit, setBenefit] = useState('');
    const [benefits, setBenefits] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchVipData();
    }, []);

    const fetchVipData = async () => {
        try {
            setLoading(true);
            const [plansRes, subsRes] = await Promise.all([
                apiClient.get('/api/admin/vip/plans'),
                apiClient.get('/api/admin/vip/subscribers')
            ]);

            if (plansRes.success) setPlans(plansRes.data || []);
            if (subsRes.success) setSubscribers(subsRes.data || []);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch VIP data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBenefit = () => {
        if (!benefit.trim()) return;
        setBenefits([...benefits, benefit.trim()]);
        setBenefit('');
    };

    const handleRemoveBenefit = (index: number) => {
        setBenefits(benefits.filter((_, i) => i !== index));
    };

    const handleCreatePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price) {
            toast.error('Name and Price are required');
            return;
        }

        try {
            setSubmitting(true);
            const response = await apiClient.post('/api/admin/vip/plans', {
                name,
                durationDays,
                coinsCost,
                price,
                benefits
            });

            if (response.success) {
                toast.success('VIP Membership plan created successfully');
                setName('');
                setDurationDays('30');
                setCoinsCost('0');
                setPrice('');
                setBenefits([]);
                fetchVipData();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create VIP plan');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePlan = async (planId: string) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;
        try {
            const response = await apiClient.delete(`/api/admin/vip/plans/${planId}`);
            if (response.success) {
                toast.success('VIP Plan deleted successfully');
                fetchVipData();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete VIP plan');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">VIP Program</h2>
                <p className="text-muted-foreground mt-1 font-medium">Create subscription tiers and monitor active premium memberships</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Create Form */}
                <Card className="glass-card md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Plus size={20} />
                            Create VIP Tier
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreatePlan} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Plan Name</label>
                                <Input
                                    placeholder="e.g. VIP Diamond Elite"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Duration (Days)</label>
                                    <Input
                                        type="number"
                                        placeholder="30"
                                        value={durationDays}
                                        onChange={(e) => setDurationDays(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Price (USD)</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="9.99"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Alternative Coin Price</label>
                                <Input
                                    type="number"
                                    placeholder="0 (Disabled)"
                                    value={coinsCost}
                                    onChange={(e) => setCoinsCost(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Benefits & Privileges</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Double EXP, Special badges..."
                                        value={benefit}
                                        onChange={(e) => setBenefit(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBenefit())}
                                    />
                                    <Button type="button" onClick={handleAddBenefit} variant="outline" className="font-semibold">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {benefits.map((b, i) => (
                                        <Badge key={i} variant="secondary" className="flex items-center gap-1 py-1 font-semibold text-slate-300">
                                            <span>{b}</span>
                                            <button type="button" onClick={() => handleRemoveBenefit(i)} className="text-destructive font-black text-xs hover:text-red-300">×</button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <Button type="submit" className="w-full font-bold" disabled={submitting}>
                                {submitting ? 'Creating Plan...' : 'Configure VIP Tier'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Plans List */}
                <Card className="glass-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Crown size={20} className="text-yellow-500" />
                            VIP Tiers Packages
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold text-slate-300">Tier Name</TableHead>
                                    <TableHead className="font-bold text-slate-300">Duration</TableHead>
                                    <TableHead className="font-bold text-slate-300">Price (USD)</TableHead>
                                    <TableHead className="font-bold text-slate-300">Alternative Coin Price</TableHead>
                                    <TableHead className="font-bold text-slate-300">Privileges</TableHead>
                                    <TableHead className="text-right font-bold text-slate-300">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-slate-400">Loading VIP plans...</TableCell>
                                    </TableRow>
                                ) : plans.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-slate-400 font-medium">No VIP plans configured</TableCell>
                                    </TableRow>
                                ) : (
                                    plans.map((plan) => (
                                        <TableRow key={plan._id} className="hover:bg-muted/30">
                                            <TableCell className="font-bold text-slate-200">
                                                <div className="flex items-center gap-2">
                                                    <Award size={16} className="text-primary animate-pulse" />
                                                    <span>{plan.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-slate-300">{plan.durationDays} Days</TableCell>
                                            <TableCell className="font-bold text-emerald-400">${plan.price.toFixed(2)}</TableCell>
                                            <TableCell className="font-semibold text-slate-300">
                                                {plan.coinsCost > 0 ? `${plan.coinsCost.toLocaleString()} coins` : 'Disabled'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1 max-w-[180px]">
                                                    {plan.benefits?.map((b: string, i: number) => (
                                                        <Badge key={i} variant="outline" className="text-[10px] py-0.5 text-slate-400 font-bold">{b}</Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDeletePlan(plan._id)}
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

            {/* VIP Subscribers List */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <ShieldCheck size={20} className="text-primary" />
                        VIP Premium Subscribers Listing (Level 10+)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold text-slate-300">Subscriber Name</TableHead>
                                <TableHead className="font-bold text-slate-300">System ID</TableHead>
                                <TableHead className="font-bold text-slate-300">Email</TableHead>
                                <TableHead className="font-bold text-slate-300">Level Rank</TableHead>
                                <TableHead className="font-bold text-slate-300">Wallet Coins Balance</TableHead>
                                <TableHead className="font-bold text-slate-300">Subscribed At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">Loading subscribers...</TableCell>
                                </TableRow>
                            ) : subscribers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">No VIP subscribers found</TableCell>
                                </TableRow>
                            ) : (
                                subscribers.map((sub) => (
                                    <TableRow key={sub.userId} className="hover:bg-muted/30">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center font-bold text-xs">
                                                    {sub.image ? (
                                                        <img src={sub.image} alt={sub.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        sub.name?.[0]?.toUpperCase() || 'U'
                                                    )}
                                                </div>
                                                <span className="font-semibold text-slate-200">{sub.name || 'User'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-slate-400 text-xs">{sub.userId}</TableCell>
                                        <TableCell className="text-slate-300">{sub.email || 'No email attached'}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-bold flex items-center gap-1 w-fit bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                                <Crown size={12} />
                                                <span>Level {sub.level}</span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-bold text-slate-200">{sub.coins.toLocaleString()}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground font-semibold">{new Date(sub.createdAt).toLocaleDateString()}</TableCell>
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

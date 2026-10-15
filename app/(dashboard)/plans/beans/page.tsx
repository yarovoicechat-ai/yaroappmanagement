'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table';
import {
    Gem,
    Plus,
    Search,
    RefreshCw,
    Edit2,
    Trash2,
    CheckCircle2,
    ArrowRightLeft,
    Calculator,
    Layers,
    Sparkles,
    Tag,
    X,
    Coins,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface BeansPlan {
    _id: string;
    name: string;
    beans: number;
    diamonds: number;
    bonusDiamonds?: number;
    price?: number;
    currency?: string;
    badge?: string;
    type: 'exchange' | 'purchase' | 'agency';
    description?: string;
    isActive: boolean;
    sortOrder: number;
    createdAt?: string;
}

export default function BeansPlansPage() {
    const [plans, setPlans] = useState<BeansPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    // Calculator state
    const [calcBeans, setCalcBeans] = useState<number>(10000);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<BeansPlan | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        beans: 10000,
        diamonds: 9000,
        bonusDiamonds: 400,
        price: 1000,
        currency: 'INR',
        badge: 'BEST VALUE',
        type: 'exchange' as 'exchange' | 'purchase' | 'agency',
        description: '',
        isActive: true,
        sortOrder: 1,
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get<any>('/api/beans-plans?all=true');
            if (res?.success && res.data) {
                const list = Array.isArray(res.data) ? res.data : (res.data.plans || []);
                setPlans(list);
            } else {
                toast.error('Failed to load beans plans');
            }
        } catch (err: any) {
            console.error('Error loading beans plans:', err);
            toast.error(err.message || 'Error connecting to beans service');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setEditingPlan(null);
        setFormData({
            name: '',
            beans: 10000,
            diamonds: 9000,
            bonusDiamonds: 400,
            price: 1000,
            currency: 'INR',
            badge: 'POPULAR',
            type: 'exchange',
            description: 'Convert 10,000 Beans into 9,000 Diamonds + 400 Bonus Diamonds',
            isActive: true,
            sortOrder: plans.length + 1,
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (plan: BeansPlan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name || '',
            beans: plan.beans || 0,
            diamonds: plan.diamonds || 0,
            bonusDiamonds: plan.bonusDiamonds || 0,
            price: plan.price || 0,
            currency: plan.currency || 'INR',
            badge: plan.badge || '',
            type: plan.type || 'exchange',
            description: plan.description || '',
            isActive: plan.isActive ?? true,
            sortOrder: plan.sortOrder || 0,
        });
        setIsModalOpen(true);
    };

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.beans || !formData.diamonds) {
            toast.error('Please enter name, beans amount, and diamonds yield');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                ...formData,
                beans: Number(formData.beans),
                diamonds: Number(formData.diamonds),
                bonusDiamonds: Number(formData.bonusDiamonds || 0),
                price: Number(formData.price || 0),
                sortOrder: Number(formData.sortOrder || 0),
            };

            let res: any;
            if (editingPlan) {
                res = await apiClient.put(`/api/beans-plans/${editingPlan._id}`, payload);
                if (res?.success) {
                    toast.success('Beans plan updated successfully');
                    setIsModalOpen(false);
                    fetchPlans();
                } else {
                    toast.error(res?.message || 'Failed to update plan');
                }
            } else {
                res = await apiClient.post('/api/beans-plans', payload);
                if (res?.success) {
                    toast.success('Beans plan created successfully');
                    setIsModalOpen(false);
                    fetchPlans();
                } else {
                    toast.error(res?.message || 'Failed to create plan');
                }
            }
        } catch (err: any) {
            toast.error(err.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (plan: BeansPlan) => {
        try {
            const res: any = await apiClient.patch(`/api/beans-plans/${plan._id}/toggle`, {});
            if (res?.success) {
                setPlans(prev =>
                    prev.map(p => (p._id === plan._id ? { ...p, isActive: !p.isActive } : p))
                );
                toast.success(`Beans plan ${!plan.isActive ? 'activated' : 'deactivated'}`);
            }
        } catch (err: any) {
            toast.error('Failed to toggle status');
        }
    };

    const handleDeletePlan = async (id: string) => {
        if (!confirm('Are you sure you want to permanently delete this beans plan?')) return;
        try {
            const res: any = await apiClient.delete(`/api/beans-plans/${id}`);
            if (res?.success) {
                toast.success('Beans plan deleted');
                setPlans(prev => prev.filter(p => p._id !== id));
            } else {
                toast.error(res?.message || 'Failed to delete plan');
            }
        } catch (err: any) {
            toast.error('Failed to delete plan');
        }
    };

    // Filtered plans
    const filteredPlans = useMemo(() => {
        return plans.filter(p => {
            const matchesSearch =
                p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(p.beans).includes(searchQuery) ||
                String(p.diamonds).includes(searchQuery);

            const matchesType = filterType === 'all' || p.type === filterType;
            const matchesStatus =
                filterStatus === 'all' ||
                (filterStatus === 'active' && p.isActive) ||
                (filterStatus === 'inactive' && !p.isActive);

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [plans, searchQuery, filterType, filterStatus]);

    // KPI stats
    const stats = useMemo(() => {
        const total = plans.length;
        const active = plans.filter(p => p.isActive).length;
        const maxBeans = plans.reduce((max, p) => Math.max(max, p.beans || 0), 0);
        const exchangeTiers = plans.filter(p => p.type === 'exchange').length;
        return { total, active, maxBeans, exchangeTiers };
    }, [plans]);

    // Live calculator calculation
    const calcResult = useMemo(() => {
        const match = plans.find(p => p.beans === calcBeans && p.isActive);
        if (match) {
            return {
                diamonds: match.diamonds,
                bonus: match.bonusDiamonds || 0,
                total: match.diamonds + (match.bonusDiamonds || 0),
                ratio: ((match.diamonds / match.beans) * 100).toFixed(1) + '%',
                badge: match.badge,
            };
        }
        // General 90% fallback estimate
        const estimated = Math.floor(calcBeans * 0.9);
        return {
            diamonds: estimated,
            bonus: 0,
            total: estimated,
            ratio: '90.0%',
            badge: 'Standard 90%',
        };
    }, [plans, calcBeans]);

    return (
        <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10">
                            <Gem size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                                Beans Plans & Conversion System
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold uppercase tracking-wider">
                                    Creator Economy
                                </span>
                            </h1>
                            <p className="text-sm text-slate-400">
                                Configure Beans to Diamonds exchange packages, conversion rates, and creator cashout tiers
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchPlans}
                        disabled={loading}
                        className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
                    >
                        <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={handleOpenCreateModal}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-semibold shadow-lg shadow-emerald-500/25"
                    >
                        <Plus size={18} className="mr-1.5" />
                        Create Beans Plan
                    </Button>
                </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase font-medium text-slate-400 flex items-center justify-between">
                            Total Beans Plans
                            <Gem size={16} className="text-emerald-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.total}</div>
                        <p className="text-xs text-slate-500 mt-1">Configured packages</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase font-medium text-slate-400 flex items-center justify-between">
                            Active Tiers
                            <CheckCircle2 size={16} className="text-teal-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-teal-400">{stats.active}</div>
                        <p className="text-xs text-slate-500 mt-1">Ready for exchange in app</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase font-medium text-slate-400 flex items-center justify-between">
                            Exchange Ratio
                            <ArrowRightLeft size={16} className="text-cyan-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-cyan-400">100 🫘 = 90 💎</div>
                        <p className="text-xs text-slate-500 mt-1">Standard 90% return</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase font-medium text-slate-400 flex items-center justify-between">
                            Highest Tier
                            <Coins size={16} className="text-amber-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-400">
                            {stats.maxBeans.toLocaleString()} 🫘
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Maximum bulk tier</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Toolbar & Simulator */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input
                            placeholder="Search beans, diamonds, or name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus:border-emerald-500"
                        />
                    </div>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                    >
                        <option value="all">All Types</option>
                        <option value="exchange">Exchange (Beans → Diamonds)</option>
                        <option value="purchase">Direct Purchase</option>
                        <option value="agency">Agency Special</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                    <span className="text-xs text-slate-400 mr-1">
                        Showing {filteredPlans.length} of {plans.length}
                    </span>
                    <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950/60 p-0.5">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-emerald-500 text-slate-950 shadow'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            Grid Cards
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                viewMode === 'table'
                                    ? 'bg-emerald-500 text-slate-950 shadow'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            Dense Table
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Area: Grid / Table and Calculator Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Plans List Column (2 cols) */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="py-20 text-center space-y-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto" />
                            <p className="text-sm text-slate-400">Loading beans catalog...</p>
                        </div>
                    ) : filteredPlans.length === 0 ? (
                        <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-3">
                            <Gem size={36} className="mx-auto text-slate-600" />
                            <h3 className="text-base font-semibold text-white">No Beans Plans Found</h3>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                No plans match your query. Add a new beans exchange tier or adjust search.
                            </p>
                            <Button
                                onClick={handleOpenCreateModal}
                                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold"
                            >
                                <Plus size={16} className="mr-1.5" />
                                Create Beans Plan
                            </Button>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredPlans.map((plan) => {
                                const bonus = plan.bonusDiamonds || 0;

                                return (
                                    <div
                                        key={plan._id}
                                        className="group relative rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70 hover:border-emerald-500/50 transition-all p-5 flex flex-col justify-between overflow-hidden shadow-lg"
                                    >
                                        {/* Badge top right */}
                                        {plan.badge && (
                                            <div className="absolute top-3 right-3">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow uppercase tracking-wider">
                                                    {plan.badge}
                                                </span>
                                            </div>
                                        )}

                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px]">
                                                    Tier #{plan.sortOrder || 0}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px] uppercase font-semibold"
                                                >
                                                    {plan.type}
                                                </Badge>
                                            </div>

                                            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                                                {plan.name || `${plan.beans.toLocaleString()} Beans`}
                                            </h3>
                                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                                {plan.description || `Exchange ${plan.beans} Beans for ${plan.diamonds} Diamonds`}
                                            </p>

                                            {/* Exchange conversion flow display */}
                                            <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                                                <div className="text-left">
                                                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                                                        Deduct Beans
                                                    </span>
                                                    <span className="text-lg font-black text-amber-400 font-mono">
                                                        {plan.beans.toLocaleString()} 🫘
                                                    </span>
                                                </div>

                                                <div className="p-1.5 rounded-full bg-slate-800 text-slate-400">
                                                    <ArrowRightLeft size={14} />
                                                </div>

                                                <div className="text-right">
                                                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                                                        Yield Diamonds
                                                    </span>
                                                    <span className="text-lg font-black text-cyan-400 font-mono">
                                                        {plan.diamonds.toLocaleString()} 💎
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Bonus tag */}
                                            {bonus > 0 && (
                                                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-semibold">
                                                    <Sparkles size={14} />
                                                    <span>Includes +{bonus.toLocaleString()} Extra Bonus Diamonds!</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Bottom Action Footer */}
                                        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={plan.isActive}
                                                    onCheckedChange={() => handleToggleStatus(plan)}
                                                />
                                                <span className={`text-xs ${plan.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                    {plan.isActive ? 'Active' : 'Disabled'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenEditModal(plan)}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                                                >
                                                    <Edit2 size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeletePlan(plan._id)}
                                                    className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-950/60">
                                    <TableRow className="border-slate-800">
                                        <TableHead className="text-slate-400 text-xs">Plan Name</TableHead>
                                        <TableHead className="text-slate-400 text-xs">Beans (Cost)</TableHead>
                                        <TableHead className="text-slate-400 text-xs">Diamonds (Yield)</TableHead>
                                        <TableHead className="text-slate-400 text-xs">Bonus</TableHead>
                                        <TableHead className="text-slate-400 text-xs">Status</TableHead>
                                        <TableHead className="text-slate-400 text-xs text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPlans.map((plan) => (
                                        <TableRow key={plan._id} className="border-slate-800/60 hover:bg-slate-800/30">
                                            <TableCell>
                                                <div className="font-semibold text-white">{plan.name}</div>
                                                <div className="text-xs text-slate-400">{plan.description}</div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-bold text-amber-400 font-mono">
                                                    {plan.beans.toLocaleString()} 🫘
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-bold text-cyan-400 font-mono">
                                                    {plan.diamonds.toLocaleString()} 💎
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {(plan.bonusDiamonds || 0) > 0 ? (
                                                    <span className="text-xs text-emerald-400 font-semibold font-mono">
                                                        +{plan.bonusDiamonds?.toLocaleString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-500">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={plan.isActive}
                                                    onCheckedChange={() => handleToggleStatus(plan)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenEditModal(plan)}
                                                        className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                                                    >
                                                        <Edit2 size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeletePlan(plan._id)}
                                                        className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                {/* Right Column: Live Calculator & Mobile App Simulation */}
                <div className="space-y-4">
                    <Card className="bg-slate-900/60 border-slate-800 sticky top-24 overflow-hidden shadow-2xl">
                        <CardHeader className="border-b border-slate-800/80 bg-slate-950/40 pb-3">
                            <CardTitle className="text-sm font-semibold text-white flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Calculator size={16} className="text-emerald-400" />
                                    Beans Conversion Simulator
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono">
                                    REALTIME
                                </span>
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                                    Test Input Beans:
                                </label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        min={100}
                                        step={100}
                                        value={calcBeans}
                                        onChange={(e) => setCalcBeans(Number(e.target.value) || 0)}
                                        className="bg-slate-950 border-slate-800 text-white font-mono text-base pr-8 focus:border-emerald-500"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">🫘</span>
                                </div>
                            </div>

                            {/* Preset Buttons */}
                            <div className="flex flex-wrap gap-1.5">
                                {[1000, 5000, 10000, 20000, 50000, 100000].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setCalcBeans(num)}
                                        className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-all ${
                                            calcBeans === num
                                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                                                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                                        }`}
                                    >
                                        {num.toLocaleString()}
                                    </button>
                                ))}
                            </div>

                            {/* Simulator Result Box */}
                            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-3">
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                    <span>Exchange Rate:</span>
                                    <span className="font-bold text-white">{calcResult.ratio}</span>
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-400">
                                    <span>Base Diamonds:</span>
                                    <span className="font-bold text-cyan-300 font-mono">
                                        {calcResult.diamonds.toLocaleString()} 💎
                                    </span>
                                </div>

                                {calcResult.bonus > 0 && (
                                    <div className="flex items-center justify-between text-xs text-emerald-400">
                                        <span>Bonus Yield:</span>
                                        <span className="font-bold font-mono">
                                            +{calcResult.bonus.toLocaleString()} 💎
                                        </span>
                                    </div>
                                )}

                                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                                    <span className="text-xs font-bold text-white uppercase">Total Credited:</span>
                                    <span className="text-xl font-black text-amber-400 font-mono">
                                        {calcResult.total.toLocaleString()} 💎
                                    </span>
                                </div>
                            </div>

                            {/* Info note */}
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                In YaroApp, hosts and users can convert accumulated call & gift beans into diamonds to send gifts or participate in live voice events.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create & Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Gem size={20} className="text-emerald-400" />
                                    {editingPlan ? 'Edit Beans Plan' : 'Create New Beans Plan'}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Configure beans conversion amount, diamonds received, and bonus perks
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSavePlan} className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div>
                                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                    Plan Name *
                                </label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. 10,000 Beans Popular Exchange"
                                    className="bg-slate-950 border-slate-800 text-white focus:border-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                    Description
                                </label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="e.g. Convert 10,000 Beans into 9,000 Diamonds"
                                    className="bg-slate-950 border-slate-800 text-white focus:border-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                        Beans Required (🫘) *
                                    </label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={formData.beans}
                                        onChange={(e) => setFormData({ ...formData, beans: Number(e.target.value) })}
                                        className="bg-slate-950 border-slate-800 text-white focus:border-emerald-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                        Diamonds Received (💎) *
                                    </label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={formData.diamonds}
                                        onChange={(e) => setFormData({ ...formData, diamonds: Number(e.target.value) })}
                                        className="bg-slate-950 border-slate-800 text-white focus:border-emerald-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                        Bonus Diamonds (+💎)
                                    </label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={formData.bonusDiamonds}
                                        onChange={(e) => setFormData({ ...formData, bonusDiamonds: Number(e.target.value) })}
                                        className="bg-slate-950 border-slate-800 text-white focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                        Promotional Badge
                                    </label>
                                    <select
                                        value={formData.badge}
                                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500"
                                    >
                                        <option value="">None</option>
                                        <option value="POPULAR">POPULAR</option>
                                        <option value="BEST VALUE">BEST VALUE</option>
                                        <option value="HOT">HOT</option>
                                        <option value="STARTER">STARTER</option>
                                        <option value="VIP PRO">VIP PRO</option>
                                        <option value="SUPREME">SUPREME</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                        Plan Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500"
                                    >
                                        <option value="exchange">Exchange (Beans → Diamonds)</option>
                                        <option value="purchase">Direct Purchase</option>
                                        <option value="agency">Agency Special</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                        Display Sort Order
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.sortOrder}
                                        onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                                        className="bg-slate-950 border-slate-800 text-white focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                                <div>
                                    <p className="text-xs font-semibold text-white">Active Status</p>
                                    <p className="text-[11px] text-slate-400">Available immediately in user exchange screen</p>
                                </div>
                                <Switch
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold hover:from-emerald-600 hover:to-teal-700"
                                >
                                    {submitting ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

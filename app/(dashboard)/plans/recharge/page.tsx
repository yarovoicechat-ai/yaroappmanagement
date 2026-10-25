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
    Coins,
    Plus,
    Search,
    RefreshCw,
    Edit2,
    Trash2,
    Sparkles,
    CheckCircle2,
    XCircle,
    TrendingUp,
    Shield,
    Smartphone,
    Layers,
    Tag,
    X,
    Flame,
    Zap,
    Gem,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface RechargePlan {
    _id: string;
    title: string;
    description: string;
    actualPrice: number;
    discountedPrice?: number;
    coins: number;
    diamonds?: number;
    bonusCoins?: number;
    badge?: string;
    productId?: string;
    type: 'online' | 'offline' | 'google_play' | 'special';
    icon?: string;
    isActive: boolean;
    sortOrder: number;
    currency: string;
    createdAt?: string;
}

export default function RechargePlansPage() {
    const [plans, setPlans] = useState<RechargePlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<RechargePlan | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        diamonds: 71,
        bonusCoins: 0,
        actualPrice: 99,
        discountedPrice: 99,
        currency: 'INR',
        badge: 'POPULAR',
        productId: 'diamonds_71',
        type: 'online' as 'online' | 'offline' | 'google_play' | 'special',
        isActive: true,
        sortOrder: 1,
    });

    // Preview selection
    const [selectedPreviewPlan, setSelectedPreviewPlan] = useState<RechargePlan | null>(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get<any>('/api/recharge-plans?all=true');
            if (res?.success && res.data) {
                const list = Array.isArray(res.data) ? res.data : (res.data.plans || []);
                setPlans(list);
                if (list.length > 0 && !selectedPreviewPlan) {
                    setSelectedPreviewPlan(list[0]);
                }
            } else {
                toast.error('Failed to load recharge plans');
            }
        } catch (err: any) {
            console.error('Error loading recharge plans:', err);
            toast.error(err.message || 'Error connecting to recharge service');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setEditingPlan(null);
        setFormData({
            title: '',
            description: '',
            diamonds: 500,
            bonusCoins: 50,
            actualPrice: 499,
            discountedPrice: 399,
            currency: 'INR',
            badge: 'POPULAR',
            productId: `yaro_diamonds_${Date.now().toString().slice(-4)}`,
            type: 'online',
            isActive: true,
            sortOrder: plans.length + 1,
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (plan: RechargePlan) => {
        setEditingPlan(plan);
        setFormData({
            title: plan.title || '',
            description: plan.description || '',
            diamonds: plan.diamonds || plan.coins || 0,
            bonusCoins: plan.bonusCoins || 0,
            actualPrice: plan.actualPrice || 0,
            discountedPrice: plan.discountedPrice || 0,
            currency: plan.currency || 'INR',
            badge: plan.badge || '',
            productId: plan.productId || '',
            type: plan.type || 'online',
            isActive: plan.isActive ?? true,
            sortOrder: plan.sortOrder || 0,
        });
        setIsModalOpen(true);
    };

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description || !formData.actualPrice || !formData.diamonds) {
            toast.error('Please enter description, price, and diamond amount');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                ...formData,
                coins: Number(formData.diamonds),
                diamonds: Number(formData.diamonds),
                actualPrice: Number(formData.actualPrice),
                discountedPrice: Number(formData.discountedPrice || 0),
                bonusCoins: Number(formData.bonusCoins || 0),
                sortOrder: Number(formData.sortOrder || 0),
            };

            let res: any;
            if (editingPlan) {
                res = await apiClient.put(`/api/recharge-plans/${editingPlan._id}`, payload);
                if (res?.success) {
                    toast.success('Recharge plan updated successfully');
                    setIsModalOpen(false);
                    fetchPlans();
                } else {
                    toast.error(res?.message || 'Failed to update plan');
                }
            } else {
                res = await apiClient.post('/api/recharge-plans', payload);
                if (res?.success) {
                    toast.success('Recharge plan created successfully');
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

    const handleToggleStatus = async (plan: RechargePlan) => {
        try {
            const res: any = await apiClient.patch(`/api/recharge-plans/${plan._id}/toggle`, {});
            if (res?.success) {
                setPlans(prev =>
                    prev.map(p => (p._id === plan._id ? { ...p, isActive: !p.isActive } : p))
                );
                toast.success(`Plan ${!plan.isActive ? 'activated' : 'deactivated'}`);
            }
        } catch (err: any) {
            toast.error('Failed to toggle status');
        }
    };

    const handleDeletePlan = async (id: string) => {
        if (!confirm('Are you sure you want to permanently delete this recharge plan?')) return;
        try {
            const res: any = await apiClient.delete(`/api/recharge-plans/${id}`);
            if (res?.success) {
                toast.success('Recharge plan deleted');
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
                p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.productId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase());

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
        const onlineCount = plans.filter(p => p.type === 'online' || p.type === 'google_play').length;
        const offlineCount = plans.filter(p => p.type === 'offline').length;
        const maxDiamonds = plans.reduce((max, p) => Math.max(max, p.diamonds || p.coins || 0), 0);
        return { total, active, onlineCount, offlineCount, maxDiamonds };
    }, [plans]);

    return (
        <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
                            <Coins size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                                Diamond Recharge Plans
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold uppercase tracking-wider">
                                    Economy Core
                                </span>
                            </h1>
                            <p className="text-sm text-slate-400">
                                Configure app recharge packs, Google Play billing SKUs, bonuses, and special pricing
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
                        className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-semibold shadow-lg shadow-amber-500/25"
                    >
                        <Plus size={18} className="mr-1.5" />
                        Create Recharge Plan
                    </Button>
                </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase font-medium text-slate-400 flex items-center justify-between">
                            Total Plans
                            <Coins size={16} className="text-amber-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.total}</div>
                        <p className="text-xs text-slate-500 mt-1">Configured packages</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase font-medium text-slate-400 flex items-center justify-between">
                            Active in App
                            <CheckCircle2 size={16} className="text-emerald-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-400">{stats.active}</div>
                        <p className="text-xs text-slate-500 mt-1">Live for purchases</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase font-medium text-slate-400 flex items-center justify-between">
                            Online / Play Store
                            <Smartphone size={16} className="text-cyan-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-cyan-400">{stats.onlineCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Direct IAP billing</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase font-medium text-slate-400 flex items-center justify-between">
                            Highest Tier
                            <Gem size={16} className="text-purple-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-400 flex items-center">
                            {stats.maxDiamonds.toLocaleString()} <img src="/icons/diamond.png" className="w-6 h-6 inline-block object-contain ml-1.5" alt="Diamonds" />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Max package capacity</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter & View Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input
                            placeholder="Search by title, SKU, or diamonds..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus:border-amber-500"
                        />
                    </div>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-amber-500"
                    >
                        <option value="all">All Types</option>
                        <option value="online">Online (In-App)</option>
                        <option value="google_play">Google Play IAP</option>
                        <option value="offline">Offline / Seller</option>
                        <option value="special">Special Event</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-amber-500"
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
                                    ? 'bg-amber-500 text-slate-950 shadow'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            Grid Cards
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                viewMode === 'table'
                                    ? 'bg-amber-500 text-slate-950 shadow'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            Dense Table
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area: Grid or Table with Live Mobile Simulation preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Plans List Column (2 cols) */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="py-20 text-center space-y-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto" />
                            <p className="text-sm text-slate-400">Loading recharge catalog...</p>
                        </div>
                    ) : filteredPlans.length === 0 ? (
                        <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-3">
                            <Coins size={36} className="mx-auto text-slate-600" />
                            <h3 className="text-base font-semibold text-white">No Recharge Plans Found</h3>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                No plans match your query. Clear filters or create a new recharge plan.
                            </p>
                            <Button
                                onClick={handleOpenCreateModal}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold"
                            >
                                <Plus size={16} className="mr-1.5" />
                                Create Plan Now
                            </Button>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredPlans.map((plan) => {
                                const diamonds = plan.diamonds || plan.coins || 0;
                                const bonus = plan.bonusCoins || 0;
                                const isSelected = selectedPreviewPlan?._id === plan._id;

                                return (
                                    <div
                                        key={plan._id}
                                        onClick={() => setSelectedPreviewPlan(plan)}
                                        className={`group relative rounded-2xl border transition-all cursor-pointer p-5 overflow-hidden flex flex-col justify-between ${
                                            isSelected
                                                ? 'bg-slate-900/90 border-amber-500/60 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/40'
                                                : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                                        }`}
                                    >
                                        {/* Badge tag top right */}
                                        {plan.badge && (
                                            <div className="absolute top-3 right-3">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md uppercase tracking-wider">
                                                    {plan.badge}
                                                </span>
                                            </div>
                                        )}

                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px]">
                                                    Order #{plan.sortOrder || 0}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] uppercase font-semibold ${
                                                        plan.type === 'offline'
                                                            ? 'border-purple-500/30 text-purple-400 bg-purple-500/10'
                                                            : 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10'
                                                    }`}
                                                >
                                                    {plan.type}
                                                </Badge>
                                            </div>

                                            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                                                {plan.title || `${diamonds.toLocaleString()} Diamonds`}
                                            </h3>
                                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                                {plan.description}
                                            </p>

                                            {/* Diamonds display */}
                                            <div className="mt-4 flex items-baseline gap-2">
                                                <div className="text-3xl font-black text-amber-400 flex items-center gap-1 font-mono">
                                                    <span>{diamonds.toLocaleString()}</span>
                                                    <span className="text-lg">💎</span>
                                                </div>
                                                {bonus > 0 && (
                                                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                                                        +{bonus.toLocaleString()} Bonus
                                                    </span>
                                                )}
                                            </div>

                                            {/* Price display */}
                                            <div className="mt-3 flex items-center gap-2">
                                                <div className="text-lg font-bold text-white">
                                                    ₹{plan.discountedPrice || plan.actualPrice}
                                                </div>
                                                {plan.discountedPrice && plan.discountedPrice < plan.actualPrice && (
                                                    <div className="text-xs text-slate-500 line-through">
                                                        ₹{plan.actualPrice}
                                                    </div>
                                                )}
                                                {plan.productId && (
                                                    <span className="text-[11px] text-slate-500 font-mono truncate max-w-[130px]">
                                                        {plan.productId}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Bottom Actions */}
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
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenEditModal(plan);
                                                    }}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                                                >
                                                    <Edit2 size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeletePlan(plan._id);
                                                    }}
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
                                        <TableHead className="text-slate-400 text-xs">Plan / Title</TableHead>
                                        <TableHead className="text-slate-400 text-xs">Diamonds</TableHead>
                                        <TableHead className="text-slate-400 text-xs">Price</TableHead>
                                        <TableHead className="text-slate-400 text-xs">SKU / Type</TableHead>
                                        <TableHead className="text-slate-400 text-xs">Status</TableHead>
                                        <TableHead className="text-slate-400 text-xs text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPlans.map((plan) => (
                                        <TableRow
                                            key={plan._id}
                                            onClick={() => setSelectedPreviewPlan(plan)}
                                            className={`border-slate-800/60 cursor-pointer ${
                                                selectedPreviewPlan?._id === plan._id ? 'bg-amber-500/5' : 'hover:bg-slate-800/30'
                                            }`}
                                        >
                                            <TableCell>
                                                <div className="font-semibold text-white">{plan.title || `${plan.coins} Diamonds`}</div>
                                                <div className="text-xs text-slate-400 line-clamp-1">{plan.description}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-amber-400 flex items-center gap-1 font-mono">
                                                    {(plan.diamonds || plan.coins).toLocaleString()} 💎
                                                </div>
                                                {(plan.bonusCoins || 0) > 0 && (
                                                    <span className="text-[10px] text-emerald-400">+{plan.bonusCoins} Bonus</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-white">₹{plan.discountedPrice || plan.actualPrice}</div>
                                                {plan.discountedPrice && (
                                                    <span className="text-[11px] text-slate-500 line-through">₹{plan.actualPrice}</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs font-mono text-slate-300">{plan.productId || 'N/A'}</div>
                                                <span className="text-[10px] uppercase text-cyan-400">{plan.type}</span>
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenEditModal(plan);
                                                        }}
                                                        className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                                                    >
                                                        <Edit2 size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeletePlan(plan._id);
                                                        }}
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

                {/* Right Column: Live Mobile Wallet Simulator */}
                <div className="space-y-4">
                    <Card className="bg-slate-900/60 border-slate-800 sticky top-24 overflow-hidden shadow-2xl">
                        <CardHeader className="border-b border-slate-800/80 bg-slate-950/40 pb-3">
                            <CardTitle className="text-sm font-semibold text-white flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Smartphone size={16} className="text-amber-400" />
                                    Mobile App Wallet Preview
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                                    LIVE SYNC
                                </span>
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-6">
                            {/* Smartphone frame container */}
                            <div className="w-full max-w-[300px] mx-auto rounded-[32px] bg-slate-950 border-[6px] border-slate-800 p-4 shadow-2xl relative space-y-4">
                                {/* Speaker notch */}
                                <div className="w-20 h-3 bg-slate-800 rounded-full mx-auto" />

                                {/* Mock App Wallet Header */}
                                <div className="text-center space-y-1">
                                    <p className="text-[10px] text-slate-400 font-medium">YaroApp Wallet</p>
                                    <h4 className="text-sm font-bold text-white">Recharge Diamonds</h4>
                                </div>

                                {/* Mock Balance Banner */}
                                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-600/20 border border-amber-500/30 text-center">
                                    <p className="text-[10px] text-amber-200">Current Balance</p>
                                    <p className="text-lg font-black text-white font-mono flex items-center justify-center gap-1">
                                        12,450 <span className="text-amber-400">💎</span>
                                    </p>
                                </div>

                                {/* Mock Selected Recharge Package Card */}
                                {selectedPreviewPlan ? (
                                    <div className="p-3.5 rounded-xl bg-slate-900 border-2 border-amber-500 relative shadow-lg">
                                        {selectedPreviewPlan.badge && (
                                            <span className="absolute -top-2.5 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 uppercase shadow">
                                                {selectedPreviewPlan.badge}
                                            </span>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-base font-black text-white flex items-center gap-1 font-mono">
                                                    {(selectedPreviewPlan.diamonds || selectedPreviewPlan.coins).toLocaleString()}
                                                    <span className="text-amber-400">💎</span>
                                                </div>
                                                {(selectedPreviewPlan.bonusCoins || 0) > 0 && (
                                                    <span className="text-[10px] font-semibold text-emerald-400">
                                                        +{selectedPreviewPlan.bonusCoins} Bonus
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-right">
                                                <div className="text-sm font-black text-amber-300">
                                                    ₹{selectedPreviewPlan.discountedPrice || selectedPreviewPlan.actualPrice}
                                                </div>
                                                {selectedPreviewPlan.discountedPrice && (
                                                    <div className="text-[10px] text-slate-500 line-through">
                                                        ₹{selectedPreviewPlan.actualPrice}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button className="w-full mt-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow">
                                            Instant Recharge
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 text-center py-4">
                                        Select any card to preview mobile appearance
                                    </p>
                                )}

                                {/* SKU Detail & Info in Simulator */}
                                <div className="text-[10px] text-slate-400 space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                                    <div className="flex justify-between">
                                        <span>Product SKU:</span>
                                        <span className="text-white truncate max-w-[120px]">
                                            {selectedPreviewPlan?.productId || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Provider:</span>
                                        <span className="text-cyan-400 uppercase">
                                            {selectedPreviewPlan?.type || 'Online'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Security:</span>
                                        <span className="text-emerald-400">Verified RTDN</span>
                                    </div>
                                </div>
                            </div>
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
                                    <Coins size={20} className="text-amber-400" />
                                    {editingPlan ? 'Edit Recharge Plan' : 'Create New Recharge Plan'}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Define diamond amounts, Google Play SKU, and offer rates
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
                                    Plan Title / Name *
                                </label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Popular Diamond Chest"
                                    className="bg-slate-950 border-slate-800 text-white focus:border-amber-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                    Description *
                                </label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="e.g. 500 Diamonds + 50 Bonus Diamonds"
                                    className="bg-slate-950 border-slate-800 text-white focus:border-amber-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                        Diamonds Credited (💎) *
                                    </label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={formData.diamonds}
                                        onChange={(e) => setFormData({ ...formData, diamonds: Number(e.target.value) })}
                                        className="bg-slate-950 border-slate-800 text-white focus:border-amber-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                        Bonus Diamonds
                                    </label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={formData.bonusCoins}
                                        onChange={(e) => setFormData({ ...formData, bonusCoins: Number(e.target.value) })}
                                        className="bg-slate-950 border-slate-800 text-white focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                        Actual Price (₹) *
                                    </label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={formData.actualPrice}
                                        onChange={(e) => setFormData({ ...formData, actualPrice: Number(e.target.value) })}
                                        className="bg-slate-950 border-slate-800 text-white focus:border-amber-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                        Discounted / Offer Price (₹)
                                    </label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={formData.discountedPrice}
                                        onChange={(e) => setFormData({ ...formData, discountedPrice: Number(e.target.value) })}
                                        className="bg-slate-950 border-slate-800 text-white focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                        Google Play Product SKU
                                    </label>
                                    <Input
                                        value={formData.productId}
                                        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                        placeholder="e.g. yaro_diamonds_500"
                                        className="bg-slate-950 border-slate-800 text-white font-mono text-xs focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                        Promotional Badge
                                    </label>
                                    <select
                                        value={formData.badge}
                                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500"
                                    >
                                        <option value="">None</option>
                                        <option value="POPULAR">POPULAR</option>
                                        <option value="BEST VALUE">BEST VALUE</option>
                                        <option value="HOT">HOT</option>
                                        <option value="STARTER">STARTER</option>
                                        <option value="SUPREME">SUPREME</option>
                                        <option value="LIMITED TIME">LIMITED TIME</option>
                                        <option value="SELLER ONLY">SELLER ONLY</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                        Plan Category / Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500"
                                    >
                                        <option value="online">Online (In-App Direct)</option>
                                        <option value="google_play">Google Play Store IAP</option>
                                        <option value="offline">Offline / Seller Only</option>
                                        <option value="special">Special Event</option>
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
                                        className="bg-slate-950 border-slate-800 text-white focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                                <div>
                                    <p className="text-xs font-semibold text-white">Active Status</p>
                                    <p className="text-[11px] text-slate-400">Enable this plan immediately for user purchases</p>
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
                                    className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold hover:from-amber-600 hover:to-yellow-700"
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

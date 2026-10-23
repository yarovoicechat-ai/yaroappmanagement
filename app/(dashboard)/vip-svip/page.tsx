'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table';
import {
    Crown,
    Plus,
    Search,
    RefreshCw,
    Edit2,
    Trash2,
    Sparkles,
    CheckCircle2,
    XCircle,
    UserCheck,
    Mic,
    MessageSquare,
    Eye,
    Shield,
    Volume2,
    Zap,
    Flame,
    Gem,
    Check,
    X,
    User,
    Calendar,
    ArrowRight,
    Award,
    Layers,
    Sliders,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface VipPackage {
    _id: string;
    name: string;
    slug: string;
    displayName: string;
    vipLevel: number;
    rarity: string;
    price: number;
    currency: string;
    badge: string;
    crown: string;
    entryTag: string;
    entryFrame?: string;
    avatarFrame?: string;
    isActive: boolean;
    sortOrder: number;
    isVip?: boolean;
    isKing?: boolean;
    isKingOfKings?: boolean;
    createdAt?: string;
}

interface SvipTier {
    _id: string;
    name: string;
    slug: string;
    level: number;
    description: string;
    badge: string;
    icon: string;
    crown: string;
    price: number;
    currency: string;
    durationDays: number;
    features: {
        enableEntryEffect: boolean;
        enableEntryTag: boolean;
        enableEntryFrame: boolean;
        enableAvatarFrame: boolean;
        enableMicWave: boolean;
        enableChatBubble: boolean;
        enableRoomTheme: boolean;
        enableNameEffect: boolean;
        enableSpecialBadge: boolean;
        enableSpecialSound: boolean;
        enableParticles: boolean;
        enableAntiKick?: boolean;
        enableInvisibleVisit?: boolean;
    };
    entryAnimationUrl?: string;
    entryTagText?: string;
    avatarFrameUrl?: string;
    micWaveConfig?: {
        waveColors: string[];
        intensity: number;
    };
    chatBubbleConfig?: {
        bubbleName: string;
        bgGradient: string[];
        textColor: string;
        borderColor: string;
    };
    roomThemeConfig?: {
        themeName: string;
        bgUrl: string;
        overlayGradient: string[];
    };
    isActive: boolean;
    sortOrder: number;
    createdAt?: string;
}

export default function VipSvipManagementPage() {
    const [activeTab, setActiveTab] = useState<'vip' | 'svip' | 'grant' | 'preview'>('vip');
    const [loading, setLoading] = useState(true);

    const [vipList, setVipList] = useState<VipPackage[]>([]);
    const [svipList, setSvipList] = useState<SvipTier[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // VIP Modal state
    const [isVipModalOpen, setIsVipModalOpen] = useState(false);
    const [editingVip, setEditingVip] = useState<VipPackage | null>(null);
    const [submittingVip, setSubmittingVip] = useState(false);

    const [vipForm, setVipForm] = useState({
        name: '',
        slug: '',
        displayName: '',
        vipLevel: 1,
        rarity: 'epic',
        price: 50000,
        badge: '👑 VIP 1',
        crown: 'https://api.yaroapp.in/uploads/vip/crown_gold.webp',
        entryTag: '👑 VIP ARRIVED',
        entryFrame: '',
        avatarFrame: '',
        isActive: true,
        sortOrder: 1,
    });

    // SVIP Modal state
    const [isSvipModalOpen, setIsSvipModalOpen] = useState(false);
    const [editingSvip, setEditingSvip] = useState<SvipTier | null>(null);
    const [submittingSvip, setSubmittingSvip] = useState(false);

    const [svipForm, setSvipForm] = useState({
        name: '',
        slug: '',
        level: 1,
        description: '',
        badge: '⚡ SVIP KNIGHT',
        icon: 'diamond',
        crown: '👑',
        price: 500000,
        durationDays: 30,
        enableEntryEffect: true,
        enableEntryTag: true,
        enableEntryFrame: true,
        enableAvatarFrame: true,
        enableMicWave: true,
        enableChatBubble: true,
        enableRoomTheme: true,
        enableNameEffect: true,
        enableSpecialBadge: true,
        enableSpecialSound: false,
        enableParticles: true,
        enableAntiKick: true,
        enableInvisibleVisit: false,
        entryTagText: '👑 KING IS HERE',
        avatarFrameUrl: '',
        isActive: true,
        sortOrder: 1,
    });

    // Grant Tool state
    const [grantIdentifier, setGrantIdentifier] = useState('');
    const [grantPlanType, setGrantPlanType] = useState<'vip' | 'svip'>('vip');
    const [grantPlanId, setGrantPlanId] = useState('');
    const [grantDuration, setGrantDuration] = useState(30);
    const [granting, setGranting] = useState(false);

    // Live Simulator Preview state
    const [previewSelectedTier, setPreviewSelectedTier] = useState<any>(null);
    const [previewMicActive, setPreviewMicActive] = useState(true);
    const [previewShowEntrance, setPreviewShowEntrance] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (tabParam === 'svip' || tabParam === 'vip' || tabParam === 'grant' || tabParam === 'preview') {
                setActiveTab(tabParam as any);
            }
        }
        fetchCatalog();
    }, []);

    const fetchCatalog = async () => {
        try {
            setLoading(true);
            const [vipRes, svipRes] = await Promise.all([
                apiClient.get<any>('/api/vip/admin/all').catch(() => null),
                apiClient.get<any>('/api/vip/admin/svip/all').catch(() => null),
            ]);

            if (vipRes?.success) {
                const pkgs = vipRes.data?.packages || (Array.isArray(vipRes.data) ? vipRes.data : []);
                setVipList(pkgs);
            }
            if (svipRes?.success) {
                const tiers = svipRes.data?.tiers || (Array.isArray(svipRes.data) ? svipRes.data : []);
                setSvipList(tiers);
                if (tiers.length > 0 && !previewSelectedTier) {
                    setPreviewSelectedTier(tiers[0]);
                }
            }
        } catch (err: any) {
            console.error('Error loading VIP catalog:', err);
            toast.error('Failed to load VIP/SVIP catalog');
        } finally {
            setLoading(false);
        }
    };

    // VIP Create / Edit
    const handleOpenCreateVip = () => {
        setEditingVip(null);
        setVipForm({
            name: '',
            slug: '',
            displayName: '',
            vipLevel: vipList.length + 1,
            rarity: 'epic',
            price: 50000,
            badge: `👑 VIP ${vipList.length + 1}`,
            crown: 'https://api.yaroapp.in/uploads/vip/crown_gold.webp',
            entryTag: '👑 VIP KNIGHT HAS ENTERED',
            entryFrame: '',
            avatarFrame: '',
            isActive: true,
            sortOrder: vipList.length + 1,
        });
        setIsVipModalOpen(true);
    };

    const handleOpenEditVip = (vip: VipPackage) => {
        setEditingVip(vip);
        setVipForm({
            name: vip.name || '',
            slug: vip.slug || '',
            displayName: vip.displayName || vip.name || '',
            vipLevel: vip.vipLevel || 1,
            rarity: vip.rarity || 'epic',
            price: vip.price || 0,
            badge: vip.badge || '👑 VIP',
            crown: vip.crown || '',
            entryTag: vip.entryTag || '',
            entryFrame: vip.entryFrame || '',
            avatarFrame: vip.avatarFrame || '',
            isActive: vip.isActive ?? true,
            sortOrder: vip.sortOrder || 1,
        });
        setIsVipModalOpen(true);
    };

    const handleSaveVip = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vipForm.name || !vipForm.slug || !vipForm.price) {
            toast.error('Name, Slug, and Diamond Price are required');
            return;
        }

        try {
            setSubmittingVip(true);
            const payload = {
                ...vipForm,
                displayName: vipForm.displayName || vipForm.name,
                price: Number(vipForm.price),
                vipLevel: Number(vipForm.vipLevel),
                sortOrder: Number(vipForm.sortOrder),
                currency: 'DIAMONDS',
            };

            let res: any;
            if (editingVip) {
                res = await apiClient.put(`/api/vip/admin/${editingVip._id}`, payload);
            } else {
                res = await apiClient.post('/api/vip/admin/create', payload);
            }

            if (res?.success) {
                toast.success(editingVip ? 'VIP Package updated!' : 'VIP Package created!');
                setIsVipModalOpen(false);
                fetchCatalog();
            } else {
                toast.error(res?.message || 'Operation failed');
            }
        } catch (err: any) {
            toast.error(err.message || 'Error saving VIP package');
        } finally {
            setSubmittingVip(false);
        }
    };

    const handleToggleVip = async (vip: VipPackage) => {
        try {
            const res: any = await apiClient.patch(`/api/vip/admin/${vip._id}/toggle`, {});
            if (res?.success) {
                setVipList(prev =>
                    prev.map(v => (v._id === vip._id ? { ...v, isActive: !v.isActive } : v))
                );
                toast.success(`VIP package ${!vip.isActive ? 'activated' : 'deactivated'}`);
            }
        } catch (err: any) {
            toast.error('Failed to toggle status');
        }
    };

    const handleDeleteVip = async (id: string) => {
        if (!confirm('Are you sure you want to delete this VIP package?')) return;
        try {
            const res: any = await apiClient.delete(`/api/vip/admin/${id}`);
            if (res?.success) {
                toast.success('VIP Package deleted');
                setVipList(prev => prev.filter(v => v._id !== id));
            }
        } catch (err: any) {
            toast.error('Failed to delete VIP package');
        }
    };

    // SVIP Create / Edit
    const handleOpenCreateSvip = () => {
        setEditingSvip(null);
        setSvipForm({
            name: '',
            slug: '',
            level: svipList.length + 1,
            description: '',
            badge: '⚡ SVIP KING',
            icon: 'crown',
            crown: '👑',
            price: 500000,
            durationDays: 30,
            enableEntryEffect: true,
            enableEntryTag: true,
            enableEntryFrame: true,
            enableAvatarFrame: true,
            enableMicWave: true,
            enableChatBubble: true,
            enableRoomTheme: true,
            enableNameEffect: true,
            enableSpecialBadge: true,
            enableSpecialSound: false,
            enableParticles: true,
            enableAntiKick: true,
            enableInvisibleVisit: false,
            entryTagText: '👑 KING OF KINGS HAS ARRIVED',
            avatarFrameUrl: '',
            isActive: true,
            sortOrder: svipList.length + 1,
        });
        setIsSvipModalOpen(true);
    };

    const handleOpenEditSvip = (svip: SvipTier) => {
        setEditingSvip(svip);
        setSvipForm({
            name: svip.name || '',
            slug: svip.slug || '',
            level: svip.level || 1,
            description: svip.description || '',
            badge: svip.badge || '⚡ SVIP',
            icon: svip.icon || 'crown',
            crown: svip.crown || '👑',
            price: svip.price || 0,
            durationDays: svip.durationDays || 30,
            enableEntryEffect: svip.features?.enableEntryEffect ?? true,
            enableEntryTag: svip.features?.enableEntryTag ?? true,
            enableEntryFrame: svip.features?.enableEntryFrame ?? true,
            enableAvatarFrame: svip.features?.enableAvatarFrame ?? true,
            enableMicWave: svip.features?.enableMicWave ?? true,
            enableChatBubble: svip.features?.enableChatBubble ?? true,
            enableRoomTheme: svip.features?.enableRoomTheme ?? true,
            enableNameEffect: svip.features?.enableNameEffect ?? true,
            enableSpecialBadge: svip.features?.enableSpecialBadge ?? true,
            enableSpecialSound: svip.features?.enableSpecialSound ?? false,
            enableParticles: svip.features?.enableParticles ?? true,
            enableAntiKick: svip.features?.enableAntiKick ?? false,
            enableInvisibleVisit: svip.features?.enableInvisibleVisit ?? false,
            entryTagText: svip.entryTagText || '',
            avatarFrameUrl: svip.avatarFrameUrl || '',
            isActive: svip.isActive ?? true,
            sortOrder: svip.sortOrder || 1,
        });
        setIsSvipModalOpen(true);
    };

    const handleSaveSvip = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!svipForm.name || !svipForm.slug || !svipForm.price) {
            toast.error('Name, Slug, and Diamond Price are required');
            return;
        }

        try {
            setSubmittingSvip(true);
            const payload = {
                name: svipForm.name,
                slug: svipForm.slug,
                level: Number(svipForm.level),
                description: svipForm.description,
                badge: svipForm.badge,
                icon: svipForm.icon,
                crown: svipForm.crown,
                price: Number(svipForm.price),
                durationDays: Number(svipForm.durationDays || 30),
                currency: 'DIAMONDS',
                entryTagText: svipForm.entryTagText,
                avatarFrameUrl: svipForm.avatarFrameUrl,
                features: {
                    enableEntryEffect: svipForm.enableEntryEffect,
                    enableEntryTag: svipForm.enableEntryTag,
                    enableEntryFrame: svipForm.enableEntryFrame,
                    enableAvatarFrame: svipForm.enableAvatarFrame,
                    enableMicWave: svipForm.enableMicWave,
                    enableChatBubble: svipForm.enableChatBubble,
                    enableRoomTheme: svipForm.enableRoomTheme,
                    enableNameEffect: svipForm.enableNameEffect,
                    enableSpecialBadge: svipForm.enableSpecialBadge,
                    enableSpecialSound: svipForm.enableSpecialSound,
                    enableParticles: svipForm.enableParticles,
                    enableAntiKick: svipForm.enableAntiKick,
                    enableInvisibleVisit: svipForm.enableInvisibleVisit,
                },
                isActive: svipForm.isActive,
                sortOrder: Number(svipForm.sortOrder),
            };

            let res: any;
            if (editingSvip) {
                res = await apiClient.put(`/api/vip/admin/svip/${editingSvip._id}`, payload);
            } else {
                res = await apiClient.post('/api/vip/admin/svip/create', payload);
            }

            if (res?.success) {
                toast.success(editingSvip ? 'SVIP Tier updated!' : 'SVIP Tier created!');
                setIsSvipModalOpen(false);
                fetchCatalog();
            } else {
                toast.error(res?.message || 'Operation failed');
            }
        } catch (err: any) {
            toast.error(err.message || 'Error saving SVIP tier');
        } finally {
            setSubmittingSvip(false);
        }
    };

    const handleToggleSvip = async (svip: SvipTier) => {
        try {
            const res: any = await apiClient.patch(`/api/vip/admin/svip/${svip._id}/toggle`, {});
            if (res?.success) {
                setSvipList(prev =>
                    prev.map(s => (s._id === svip._id ? { ...s, isActive: !s.isActive } : s))
                );
                toast.success(`SVIP tier ${!svip.isActive ? 'activated' : 'deactivated'}`);
            }
        } catch (err: any) {
            toast.error('Failed to toggle status');
        }
    };

    const handleDeleteSvip = async (id: string) => {
        if (!confirm('Are you sure you want to delete this SVIP tier?')) return;
        try {
            const res: any = await apiClient.delete(`/api/vip/admin/svip/${id}`);
            if (res?.success) {
                toast.success('SVIP Tier deleted');
                setSvipList(prev => prev.filter(s => s._id !== id));
            }
        } catch (err: any) {
            toast.error('Failed to delete SVIP tier');
        }
    };

    // User Direct Grant Tool
    const handleGrantMembership = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!grantIdentifier || !grantPlanId) {
            toast.error('Please enter User Identifier and select a membership package');
            return;
        }

        try {
            setGranting(true);
            const res: any = await apiClient.post('/api/vip/admin/grant', {
                userIdentifier: grantIdentifier.trim(),
                planType: grantPlanType,
                planId: grantPlanId,
                durationDays: Number(grantDuration),
            });

            if (res?.success) {
                toast.success(res.message || 'Membership granted successfully! 🎉');
                setGrantIdentifier('');
            } else {
                toast.error(res?.message || 'Failed to grant membership');
            }
        } catch (err: any) {
            toast.error(err.message || 'Error granting membership');
        } finally {
            setGranting(false);
        }
    };

    return (
        <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/30 text-violet-400 shadow-lg shadow-violet-500/10">
                            <Crown size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                                VIP & SVIP Studio & Management Suite
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 font-semibold uppercase tracking-wider">
                                    Royal Authority
                                </span>
                            </h1>
                            <p className="text-sm text-slate-400">
                                Create and configure VIP packages, SVIP elite tiers, entry effects, audio waves, and assign user memberships
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Link href="/king-of-kings">
                        <Button
                            variant="outline"
                            className="border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold"
                        >
                            <Crown size={16} className="mr-1.5 text-amber-400" />
                            King of Kings
                        </Button>
                    </Link>
                    <Link href="/plans/svip">
                        <Button
                            variant="outline"
                            className="border-violet-500/40 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 font-semibold"
                        >
                            <Sparkles size={16} className="mr-1.5 text-violet-400" />
                            SVIP Plan Builder
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        onClick={fetchCatalog}
                        disabled={loading}
                        className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
                    >
                        <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={handleOpenCreateVip}
                        className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                    >
                        <Plus size={16} className="mr-1.5" />
                        New VIP Plan
                    </Button>
                    <Button
                        onClick={handleOpenCreateSvip}
                        className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-bold shadow-md shadow-purple-500/25"
                    >
                        <Crown size={16} className="mr-1.5 text-amber-300" />
                        New SVIP Tier
                    </Button>
                </div>
            </div>

            {/* Quick KPI Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900/50 border-slate-800 relative overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase font-medium text-slate-400 flex items-center justify-between">
                            VIP Packages
                            <Award size={16} className="text-amber-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-400">{vipList.length}</div>
                        <p className="text-xs text-slate-500 mt-1">Configured VIP plans</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800 relative overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase font-medium text-slate-400 flex items-center justify-between">
                            SVIP Elite Tiers
                            <Crown size={16} className="text-purple-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-400">{svipList.length}</div>
                        <p className="text-xs text-slate-500 mt-1">Royal Knight to King</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800 relative overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase font-medium text-slate-400 flex items-center justify-between">
                            Active Memberships
                            <CheckCircle2 size={16} className="text-emerald-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-400">
                            {vipList.filter(v => v.isActive).length + svipList.filter(s => s.isActive).length}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Live in store</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800 relative overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase font-medium text-slate-400 flex items-center justify-between">
                            Top Supreme Price
                            <Gem size={16} className="text-cyan-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-cyan-400">
                            {Math.max(...svipList.map(s => s.price || 0), 0).toLocaleString()} 💎
                        </div>
                        <p className="text-xs text-slate-500 mt-1">King of Kings tier</p>
                    </CardContent>
                </Card>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
                <TabsList className="bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
                    <TabsTrigger
                        value="vip"
                        className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-semibold px-4 py-2"
                    >
                        <Award size={15} className="mr-2" />
                        VIP Packages ({vipList.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="svip"
                        className="data-[state=active]:bg-violet-600 data-[state=active]:text-white font-semibold px-4 py-2"
                    >
                        <Crown size={15} className="mr-2 text-amber-300" />
                        SVIP Elite Tiers ({svipList.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="grant"
                        className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold px-4 py-2"
                    >
                        <UserCheck size={15} className="mr-2" />
                        Grant VIP to User
                    </TabsTrigger>
                    <TabsTrigger
                        value="preview"
                        className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white font-semibold px-4 py-2"
                    >
                        <Eye size={15} className="mr-2" />
                        Live Room Studio Simulator
                    </TabsTrigger>
                </TabsList>

                {/* TAB 1: VIP PACKAGES */}
                <TabsContent value="vip" className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            VIP Tier Packages
                        </h3>
                        <Button
                            onClick={handleOpenCreateVip}
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                        >
                            <Plus size={16} className="mr-1.5" />
                            Add VIP Package
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {vipList.map((vip) => (
                            <div
                                key={vip._id}
                                className="rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70 hover:border-amber-500/40 transition-all p-5 flex flex-col justify-between shadow-xl relative overflow-hidden"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Badge
                                            variant="outline"
                                            className="border-amber-500/40 text-amber-300 bg-amber-500/10 font-bold"
                                        >
                                            {vip.badge || `VIP ${vip.vipLevel}`}
                                        </Badge>
                                        <span className="text-[11px] font-mono text-slate-400">
                                            Order #{vip.sortOrder || 0}
                                        </span>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-black text-white">{vip.name}</h4>
                                        <p className="text-xs text-slate-400 font-mono">{vip.slug}</p>
                                    </div>

                                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-400">Price:</span>
                                            <span className="font-bold text-amber-400 font-mono">
                                                {vip.price.toLocaleString()} 💎
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-400">Entry Tag:</span>
                                            <span className="text-slate-200 font-medium truncate max-w-[150px]">
                                                {vip.entryTag || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={vip.isActive}
                                            onCheckedChange={() => handleToggleVip(vip)}
                                        />
                                        <span className={`text-xs ${vip.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {vip.isActive ? 'Active' : 'Disabled'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleOpenEditVip(vip)}
                                            className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                                        >
                                            <Edit2 size={14} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteVip(vip._id)}
                                            className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* TAB 2: SVIP ELITE TIERS */}
                <TabsContent value="svip" className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            SVIP Elite Royal Tiers
                        </h3>
                        <Button
                            onClick={handleOpenCreateSvip}
                            size="sm"
                            className="bg-violet-600 hover:bg-violet-700 text-white font-bold"
                        >
                            <Plus size={16} className="mr-1.5 text-amber-300" />
                            Add SVIP Tier
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {svipList.map((svip) => (
                            <div
                                key={svip._id}
                                className="rounded-2xl border border-violet-500/20 bg-gradient-to-b from-slate-900/80 to-slate-950/90 hover:border-violet-500/50 transition-all p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Badge
                                            variant="outline"
                                            className="border-violet-500/40 text-violet-300 bg-violet-500/10 font-bold flex items-center gap-1.5"
                                        >
                                            <span>{svip.crown || '👑'}</span>
                                            <span>{svip.badge || svip.name}</span>
                                        </Badge>
                                        <span className="text-[11px] font-mono text-slate-400">
                                            Level #{svip.level}
                                        </span>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-black text-white flex items-center gap-2">
                                            {svip.name}
                                        </h4>
                                        <p className="text-xs text-slate-400">{svip.description || 'Exclusive SVIP Elite Privilege'}</p>
                                    </div>

                                    <div className="text-2xl font-black text-amber-400 font-mono flex items-center gap-1">
                                        {svip.price.toLocaleString()} <span className="text-sm">💎</span>
                                        <span className="text-xs text-slate-500 font-normal ml-1">/ {svip.durationDays || 30} Days</span>
                                    </div>

                                    {/* Granular Privilege Chips */}
                                    <div className="space-y-2 pt-2 border-t border-slate-800">
                                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                            Active Privileges:
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {svip.features?.enableEntryEffect && (
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                                    ✨ Entrance FX
                                                </span>
                                            )}
                                            {svip.features?.enableMicWave && (
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                                    🎙️ Mic Wave
                                                </span>
                                            )}
                                            {svip.features?.enableChatBubble && (
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                                    💬 Royal Bubble
                                                </span>
                                            )}
                                            {svip.features?.enableRoomTheme && (
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                                    🏰 Velvet Theme
                                                </span>
                                            )}
                                            {svip.features?.enableAntiKick && (
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                                                    🛡️ Anti-Kick
                                                </span>
                                            )}
                                            {svip.features?.enableInvisibleVisit && (
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                                    🥷 Stealth Mode
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={svip.isActive}
                                            onCheckedChange={() => handleToggleSvip(svip)}
                                        />
                                        <span className={`text-xs ${svip.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {svip.isActive ? 'Active' : 'Disabled'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setPreviewSelectedTier(svip);
                                                setActiveTab('preview');
                                            }}
                                            className="h-8 w-8 p-0 text-cyan-400 hover:text-cyan-300"
                                            title="Preview in simulator"
                                        >
                                            <Eye size={14} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleOpenEditSvip(svip)}
                                            className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                                        >
                                            <Edit2 size={14} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteSvip(svip._id)}
                                            className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* TAB 3: GRANT MEMBERSHIP TO USER */}
                <TabsContent value="grant" className="pt-4 max-w-2xl mx-auto">
                    <Card className="bg-slate-900/60 border-slate-800 shadow-2xl">
                        <CardHeader className="border-b border-slate-800 bg-slate-950/40">
                            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                                <UserCheck className="text-emerald-400" size={18} />
                                Direct VIP & SVIP Grant Tool
                            </CardTitle>
                            <p className="text-xs text-slate-400">
                                Manually grant VIP or SVIP status to any user by numeric User ID, MongoDB ID, or Username
                            </p>
                        </CardHeader>

                        <CardContent className="p-6">
                            <form onSubmit={handleGrantMembership} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                        Target User Identifier *
                                    </label>
                                    <div className="relative">
                                        <Input
                                            value={grantIdentifier}
                                            onChange={(e) => setGrantIdentifier(e.target.value)}
                                            placeholder="Enter User ID (e.g. 100085 or username)"
                                            className="bg-slate-950 border-slate-800 text-white pl-9 font-mono focus:border-emerald-500"
                                            required
                                        />
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                            Membership Type
                                        </label>
                                        <select
                                            value={grantPlanType}
                                            onChange={(e) => {
                                                setGrantPlanType(e.target.value as any);
                                                setGrantPlanId('');
                                            }}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500"
                                        >
                                            <option value="vip">VIP Package</option>
                                            <option value="svip">SVIP Elite Tier</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                            Select Package / Tier *
                                        </label>
                                        <select
                                            value={grantPlanId}
                                            onChange={(e) => setGrantPlanId(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500"
                                            required
                                        >
                                            <option value="">-- Choose Tier --</option>
                                            {grantPlanType === 'vip'
                                                ? vipList.map(v => (
                                                      <option key={v._id} value={v._id}>
                                                          {v.name} (VIP {v.vipLevel})
                                                      </option>
                                                  ))
                                                : svipList.map(s => (
                                                      <option key={s._id} value={s._id}>
                                                          {s.name} (SVIP Level {s.level})
                                                      </option>
                                                  ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                        Grant Duration (Days)
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        {[7, 30, 90, 365].map(days => (
                                            <button
                                                type="button"
                                                key={days}
                                                onClick={() => setGrantDuration(days)}
                                                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                                                    grantDuration === days
                                                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                                        : 'bg-slate-950 text-slate-400 border-slate-800'
                                                }`}
                                            >
                                                {days} Days
                                            </button>
                                        ))}
                                    </div>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={grantDuration}
                                        onChange={(e) => setGrantDuration(Number(e.target.value))}
                                        className="bg-slate-950 border-slate-800 text-white font-mono focus:border-emerald-500"
                                    />
                                </div>

                                <div className="pt-3">
                                    <Button
                                        type="submit"
                                        disabled={granting}
                                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold py-2.5 shadow-lg shadow-emerald-500/20"
                                    >
                                        {granting ? 'Granting Membership...' : 'Confirm & Grant Membership'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 4: LIVE ROOM STUDIO SIMULATOR */}
                <TabsContent value="preview" className="pt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Selector Column */}
                        <div className="space-y-4">
                            <Card className="bg-slate-900/60 border-slate-800">
                                <CardHeader className="pb-3 border-b border-slate-800">
                                    <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
                                        <span>Select Tier for Simulation</span>
                                        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[10px]">
                                            INTERACTIVE
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-2">
                                    <p className="text-xs text-slate-400 mb-2">Choose tier to inspect runtime room effects:</p>
                                    {svipList.map((tier) => (
                                        <button
                                            key={tier._id}
                                            onClick={() => setPreviewSelectedTier(tier)}
                                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                                                previewSelectedTier?._id === tier._id
                                                    ? 'bg-violet-600/20 border-violet-500 text-white shadow-lg'
                                                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            <span className="font-semibold text-sm flex items-center gap-2">
                                                <span>{tier.crown || '👑'}</span>
                                                {tier.name}
                                            </span>
                                            <span className="text-xs font-mono text-amber-400">
                                                {tier.price.toLocaleString()} 💎
                                            </span>
                                        </button>
                                    ))}
                                </CardContent>
                            </Card>

                            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
                                <p className="text-xs font-semibold text-white uppercase tracking-wider">
                                    Simulator Controls
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-300">Speaking Mic Pulse</span>
                                    <Switch
                                        checked={previewMicActive}
                                        onCheckedChange={setPreviewMicActive}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-300">Entrance Banner</span>
                                    <Switch
                                        checked={previewShowEntrance}
                                        onCheckedChange={setPreviewShowEntrance}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Simulator Stage (2 cols) */}
                        <div className="lg:col-span-2">
                            <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-purple-950/40 via-slate-950 to-slate-950 p-6 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-between">
                                {/* Ambient Background Glow */}
                                <div className="absolute top-0 right-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

                                {/* Mock Voice Room Top Bar */}
                                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center font-bold text-slate-950 text-xs">
                                            Y
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-white">Yaro Official Royal Lounge</h4>
                                            <p className="text-[10px] text-emerald-400">● 1,420 Online Members</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                        SVIP PRIVILEGED ROOM
                                    </span>
                                </div>

                                {/* Floating Entry Tag Banner Simulation */}
                                {previewShowEntrance && (
                                    <div className="my-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/30 via-purple-600/40 to-amber-500/30 border border-amber-400/50 shadow-2xl flex items-center justify-between animate-pulse">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-xl">👑</span>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                                                    Royal Announcement
                                                </p>
                                                <p className="text-sm font-black text-white tracking-wide">
                                                    {previewSelectedTier?.entryTagText || '👑 KING OF KINGS HAS ARRIVED'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-amber-400 uppercase bg-amber-500/20 px-2 py-1 rounded">
                                            SVIP
                                        </span>
                                    </div>
                                )}

                                {/* Center Voice Seat & Mic Wave Simulation */}
                                <div className="my-8 text-center flex flex-col items-center">
                                    <div className="relative">
                                        {/* Mic Wave Pulse Effect */}
                                        {previewMicActive && (
                                            <>
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 opacity-40 animate-ping -m-3 pointer-events-none" />
                                                <div className="absolute inset-0 rounded-full border-2 border-amber-400 opacity-60 animate-pulse -m-1.5 pointer-events-none" />
                                            </>
                                        )}

                                        {/* Avatar with Royal Frame */}
                                        <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-amber-400 flex items-center justify-center text-3xl shadow-2xl relative">
                                            🦁
                                            <span className="absolute -top-3 text-2xl">👑</span>
                                        </div>
                                    </div>

                                    <h5 className="mt-3 text-base font-extrabold text-white flex items-center gap-1.5">
                                        Royal Master Shivansh
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black">
                                            {previewSelectedTier?.badge || '👑 SVIP'}
                                        </span>
                                    </h5>
                                    <p className="text-xs text-slate-400">Speaking on VIP Seat #1</p>
                                </div>

                                {/* Custom VIP Chat Bubble Simulation */}
                                <div className="mt-auto space-y-2 pt-4 border-t border-white/10">
                                    <p className="text-[10px] uppercase text-slate-400 font-semibold">
                                        Simulated Room Chat Bubble:
                                    </p>
                                    <div className="max-w-md p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/80 to-indigo-950/90 border border-violet-400/40 shadow-xl space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                                                {previewSelectedTier?.name || 'SVIP King'}
                                            </span>
                                            <span className="text-xs font-bold text-amber-300">
                                                Shivansh 👑
                                            </span>
                                        </div>
                                        <p className="text-xs text-white">
                                            Hello everyone! Welcome to Yaro live audio club. Enjoy the royal music and gifts!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* VIP Package Modal */}
            {isVipModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Award className="text-amber-400" size={20} />
                                {editingVip ? 'Edit VIP Package' : 'Create New VIP Package'}
                            </h3>
                            <button onClick={() => setIsVipModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveVip} className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div>
                                <label className="text-xs font-semibold text-slate-300 block mb-1">VIP Package Name *</label>
                                <Input
                                    value={vipForm.name}
                                    onChange={(e) => setVipForm({ ...vipForm, name: e.target.value })}
                                    placeholder="e.g. VIP Bronze Knight"
                                    className="bg-slate-950 border-slate-800 text-white"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1">Slug (Unique Key) *</label>
                                    <Input
                                        value={vipForm.slug}
                                        onChange={(e) => setVipForm({ ...vipForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        placeholder="e.g. vip-bronze-knight"
                                        className="bg-slate-950 border-slate-800 text-white font-mono text-xs"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1">VIP Level (1-10)</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={vipForm.vipLevel}
                                        onChange={(e) => setVipForm({ ...vipForm, vipLevel: Number(e.target.value) })}
                                        className="bg-slate-950 border-slate-800 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1">Price in Diamonds (💎) *</label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={vipForm.price}
                                        onChange={(e) => setVipForm({ ...vipForm, price: Number(e.target.value) })}
                                        className="bg-slate-950 border-slate-800 text-white font-mono"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1">Badge Text / Emoji</label>
                                    <Input
                                        value={vipForm.badge}
                                        onChange={(e) => setVipForm({ ...vipForm, badge: e.target.value })}
                                        placeholder="👑 VIP 1"
                                        className="bg-slate-950 border-slate-800 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-300 block mb-1">Room Entry Tag Announcement</label>
                                <Input
                                    value={vipForm.entryTag}
                                    onChange={(e) => setVipForm({ ...vipForm, entryTag: e.target.value })}
                                    placeholder="👑 VIP KNIGHT HAS ENTERED"
                                    className="bg-slate-950 border-slate-800 text-white"
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                                <div>
                                    <p className="text-xs font-semibold text-white">Active Status</p>
                                    <p className="text-[11px] text-slate-400">Available immediately in mobile VIP shop</p>
                                </div>
                                <Switch
                                    checked={vipForm.isActive}
                                    onCheckedChange={(checked) => setVipForm({ ...vipForm, isActive: checked })}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                                <Button type="button" variant="outline" onClick={() => setIsVipModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submittingVip} className="bg-amber-500 text-slate-950 font-bold hover:bg-amber-600">
                                    {submittingVip ? 'Saving...' : editingVip ? 'Update VIP' : 'Create VIP'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SVIP Tier Modal */}
            {isSvipModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Crown className="text-violet-400" size={20} />
                                {editingSvip ? 'Edit SVIP Tier' : 'Create New SVIP Tier'}
                            </h3>
                            <button onClick={() => setIsSvipModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveSvip} className="p-6 space-y-4 overflow-y-auto flex-1">
                            <div>
                                <label className="text-xs font-semibold text-slate-300 block mb-1">SVIP Tier Name *</label>
                                <Input
                                    value={svipForm.name}
                                    onChange={(e) => setSvipForm({ ...svipForm, name: e.target.value })}
                                    placeholder="e.g. SVIP King of Kings"
                                    className="bg-slate-950 border-slate-800 text-white"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1">Slug (Unique Key) *</label>
                                    <Input
                                        value={svipForm.slug}
                                        onChange={(e) => setSvipForm({ ...svipForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        placeholder="e.g. svip-king-of-kings"
                                        className="bg-slate-950 border-slate-800 text-white font-mono text-xs"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1">SVIP Level (1-10)</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={svipForm.level}
                                        onChange={(e) => setSvipForm({ ...svipForm, level: Number(e.target.value) })}
                                        className="bg-slate-950 border-slate-800 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1">Price in Diamonds (💎) *</label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={svipForm.price}
                                        onChange={(e) => setSvipForm({ ...svipForm, price: Number(e.target.value) })}
                                        className="bg-slate-950 border-slate-800 text-white font-mono"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1">Duration (Days)</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={svipForm.durationDays}
                                        onChange={(e) => setSvipForm({ ...svipForm, durationDays: Number(e.target.value) })}
                                        className="bg-slate-950 border-slate-800 text-white font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-300 block mb-1">Entrance Tag Announcement Banner</label>
                                <Input
                                    value={svipForm.entryTagText}
                                    onChange={(e) => setSvipForm({ ...svipForm, entryTagText: e.target.value })}
                                    placeholder="👑 KING OF KINGS HAS ENTERED THE LIVE ROOM"
                                    className="bg-slate-950 border-slate-800 text-white"
                                />
                            </div>

                            {/* Granular Feature Toggles */}
                            <div className="space-y-2 pt-2 border-t border-slate-800">
                                <p className="text-xs font-bold text-white uppercase tracking-wider">
                                    Granular SVIP Privileges:
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={svipForm.enableEntryEffect}
                                            onChange={(e) => setSvipForm({ ...svipForm, enableEntryEffect: e.target.checked })}
                                        />
                                        <span>Entrance Animation</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={svipForm.enableMicWave}
                                            onChange={(e) => setSvipForm({ ...svipForm, enableMicWave: e.target.checked })}
                                        />
                                        <span>Royal Mic Wave</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={svipForm.enableChatBubble}
                                            onChange={(e) => setSvipForm({ ...svipForm, enableChatBubble: e.target.checked })}
                                        />
                                        <span>Custom Chat Bubble</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={svipForm.enableRoomTheme}
                                            onChange={(e) => setSvipForm({ ...svipForm, enableRoomTheme: e.target.checked })}
                                        />
                                        <span>Velvet Room Theme</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={svipForm.enableAntiKick}
                                            onChange={(e) => setSvipForm({ ...svipForm, enableAntiKick: e.target.checked })}
                                        />
                                        <span className="text-rose-400 font-semibold">Anti-Kick Protection</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={svipForm.enableInvisibleVisit}
                                            onChange={(e) => setSvipForm({ ...svipForm, enableInvisibleVisit: e.target.checked })}
                                        />
                                        <span className="text-indigo-400 font-semibold">Invisible Stealth Mode</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                                <div>
                                    <p className="text-xs font-semibold text-white">Active Status</p>
                                    <p className="text-[11px] text-slate-400">Enable in mobile SVIP catalog</p>
                                </div>
                                <Switch
                                    checked={svipForm.isActive}
                                    onCheckedChange={(checked) => setSvipForm({ ...svipForm, isActive: checked })}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                                <Button type="button" variant="outline" onClick={() => setIsSvipModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submittingSvip} className="bg-violet-600 text-white font-bold hover:bg-violet-700">
                                    {submittingSvip ? 'Saving...' : editingSvip ? 'Update SVIP' : 'Create SVIP Tier'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

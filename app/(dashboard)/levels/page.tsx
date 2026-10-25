'use client';

import { useState, useEffect, useCallback } from 'react';
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
import {
    Layers, Plus, Trash2, Edit2, Coins, Clock, UploadCloud,
    Sparkles, Heart, Crown, CheckCircle2, XCircle, AlertCircle,
    Search, Copy, Check, ExternalLink, RefreshCw, Eye, ShieldCheck,
    Image as ImageIcon, Film, Hash
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient as api } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

interface UniqueIdRewardConfig {
    mode: 'request' | 'select';
    uniqueDisplayId?: string;
    uniqueIdLevelId?: string;
    badgeName?: string;
    badgeIconUrl?: string;
}

interface LevelReward {
    type: 'frame' | 'entry' | 'badge' | 'tag' | 'vehicle' | 'micWave' | 'theme' | 'uniqueId';
    name: string;
    imageUrl: string;
    animationUrl: string;
    durationDays: number;
    uniqueIdConfig?: UniqueIdRewardConfig;
}

interface LevelData {
    _id: string;
    type?: 'wealth' | 'charm';
    level: number;
    name: string;
    requiredExp: number;
    badgeIcon?: string;
    badgeAnimation?: string;
    badgeColor?: string;
    levelTag?: string;
    rewards?: LevelReward[];
    isActive?: boolean;
}

interface PredefinedUniqueIdLevel {
    _id: string;
    name: string;
    config?: {
        levelNumber?: number;
        badgeName?: string;
        badgeIconUrl?: string;
    };
}

interface UniqueIdRequestItem {
    _id: string;
    userId: string;
    originalUserId: number;
    userName: string;
    userAvatar?: string;
    levelType: 'wealth' | 'charm' | 'vip';
    levelNumber: number;
    requestedId: string;
    badgeName?: string;
    badgeIcon?: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    reviewedAt?: string;
    createdAt: string;
}

export default function LevelsPage() {
    // Top-level Navigation: 'wealth' | 'charm' | 'requests'
    const [activeTab, setActiveTab] = useState<'wealth' | 'charm' | 'requests'>('wealth');

    // Levels state
    const [levels, setLevels] = useState<LevelData[]>([]);
    const [loadingLevels, setLoadingLevels] = useState(true);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [levelType, setLevelType] = useState<'wealth' | 'charm'>('wealth');
    const [level, setLevel] = useState('');
    const [name, setName] = useState('');
    const [requiredExp, setRequiredExp] = useState('0');
    const [levelTag, setLevelTag] = useState('');
    const [badgeColor, setBadgeColor] = useState('#F59E0B');
    const [badgeIcon, setBadgeIcon] = useState('');
    const [badgeAnimation, setBadgeAnimation] = useState('');
    const [uploadingBadgeIcon, setUploadingBadgeIcon] = useState(false);
    const [uploadingBadgeAnimation, setUploadingBadgeAnimation] = useState(false);
    const [rewards, setRewards] = useState<LevelReward[]>([]);
    const [uploadingRewardIndex, setUploadingRewardIndex] = useState<{ index: number; field: 'imageUrl' | 'animationUrl' } | null>(null);

    // Predefined Unique IDs for dropdown selection
    const [predefinedUniqueIds, setPredefinedUniqueIds] = useState<PredefinedUniqueIdLevel[]>([]);

    // Unique ID Requests State
    const [requests, setRequests] = useState<UniqueIdRequestItem[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
    const [requestStatusFilter, setRequestStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [requestSearch, setRequestSearch] = useState('');
    const [checkingIdMap, setCheckingIdMap] = useState<Record<string, { available?: boolean; message?: string; loading?: boolean }>>({});
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Load levels whenever activeTab changes between 'wealth' & 'charm'
    useEffect(() => {
        if (activeTab === 'wealth' || activeTab === 'charm') {
            setLevelType(activeTab);
            fetchLevels(activeTab);
        } else if (activeTab === 'requests') {
            fetchUniqueIdRequests();
        }
    }, [activeTab]);

    // Initial load for pending requests badge & predefined unique IDs
    useEffect(() => {
        fetchPendingRequestsCount();
        fetchPredefinedUniqueIds();
    }, []);

    const fetchLevels = async (type: 'wealth' | 'charm') => {
        try {
            setLoadingLevels(true);
            const res = await api.get<{ data?: LevelData[] } | LevelData[]>(API_ENDPOINTS.LEVELS_MGMT.BY_TYPE(type));
            const data = Array.isArray(res) ? res : res.data || (res as any)?.data || [];
            setLevels(data);
        } catch (error) {
            console.error('Failed to fetch levels:', error);
            toast.error('Failed to load levels');
        } finally {
            setLoadingLevels(false);
        }
    };

    const fetchPendingRequestsCount = async () => {
        try {
            const res = await api.get<any>(API_ENDPOINTS.UNIQUE_ID_REQUESTS.LIST('pending'));
            if (res.data?.pendingCount !== undefined) {
                setPendingRequestsCount(res.data.pendingCount);
            } else if (Array.isArray(res.data?.requests)) {
                setPendingRequestsCount(res.data.requests.filter((r: any) => r.status === 'pending').length);
            }
        } catch {
            // Silently handle count failure
        }
    };

    const fetchPredefinedUniqueIds = async () => {
        try {
            const res = await api.get<any>('/api/identity/admin/unique-id-levels');
            if (res.data?.levels) {
                setPredefinedUniqueIds(res.data.levels);
            }
        } catch (err) {
            console.warn('Could not load predefined unique ID levels:', err);
        }
    };

    const fetchUniqueIdRequests = async () => {
        try {
            setLoadingRequests(true);
            const res = await api.get<any>(API_ENDPOINTS.UNIQUE_ID_REQUESTS.LIST(requestStatusFilter, requestSearch));
            if (res.data?.requests) {
                setRequests(res.data.requests);
                if (res.data?.pendingCount !== undefined) {
                    setPendingRequestsCount(res.data.pendingCount);
                }
            } else if (Array.isArray(res.data)) {
                setRequests(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch Unique ID requests:', error);
            toast.error('Failed to load Unique ID requests');
        } finally {
            setLoadingRequests(false);
        }
    };

    // Direct File Upload for Badge Icon (PNG, WebP, JPG)
    const handleBadgeIconUpload = async (file?: File) => {
        if (!file) return;
        if (!/\.(png|jpe?g|webp|gif)$/i.test(file.name)) {
            toast.error('Please select an image file (PNG, JPG, WebP)');
            return;
        }
        try {
            setUploadingBadgeIcon(true);
            const body = new FormData();
            body.append('file', file);
            const response = await api.uploadFile<{ url: string }>('/api/upload/file', body);
            const url = response.data?.url;
            if (!url) throw new Error('Upload response missing URL');
            setBadgeIcon(url);
            toast.success('Badge icon uploaded successfully! 🎉');
        } catch (error: any) {
            toast.error(error.message || 'Badge icon upload failed');
        } finally {
            setUploadingBadgeIcon(false);
        }
    };

    // Direct File Upload for Badge SVGA (.svga, .gif)
    const handleBadgeAnimationUpload = async (file?: File) => {
        if (!file) return;
        if (!/\.(svga|gif|webp)$/i.test(file.name)) {
            toast.error('Please select an animation file (.svga, .gif, .webp)');
            return;
        }
        try {
            setUploadingBadgeAnimation(true);
            const body = new FormData();
            body.append('file', file);
            const response = await api.uploadFile<{ url: string }>('/api/upload/file', body);
            const url = response.data?.url;
            if (!url) throw new Error('Upload response missing URL');
            setBadgeAnimation(url);
            toast.success('Badge animation uploaded successfully! ✨');
        } catch (error: any) {
            toast.error(error.message || 'Badge animation upload failed');
        } finally {
            setUploadingBadgeAnimation(false);
        }
    };

    // Reward Asset Direct Upload
    const handleRewardAssetUpload = async (index: number, field: 'imageUrl' | 'animationUrl', file?: File) => {
        if (!file) return;
        try {
            setUploadingRewardIndex({ index, field });
            const body = new FormData();
            body.append('file', file);
            const response = await api.uploadFile<{ url: string }>('/api/upload/file', body);
            const url = response.data?.url;
            if (!url) throw new Error('Upload response missing URL');
            updateReward(index, { [field]: url });
            toast.success('Reward asset uploaded successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Upload failed');
        } finally {
            setUploadingRewardIndex(null);
        }
    };

    const updateReward = (index: number, patch: Partial<LevelReward>) =>
        setRewards(current => current.map((reward, pos) => pos === index ? { ...reward, ...patch } : reward));

    const addReward = (type: LevelReward['type']) => {
        const defaultName = type === 'uniqueId' ? 'Lucky Number ID Privilege' : `${type.toUpperCase()} Reward`;
        setRewards(current => [
            ...current,
            {
                type,
                name: defaultName,
                imageUrl: '',
                animationUrl: '',
                durationDays: type === 'uniqueId' ? 0 : 30,
                uniqueIdConfig: type === 'uniqueId' ? {
                    mode: 'request',
                    badgeName: 'VIP ID',
                    badgeIconUrl: '',
                } : undefined,
            }
        ]);
    };

    const handleSaveLevel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!level || !name) {
            toast.error('Please enter level number and name');
            return;
        }

        const payload = {
            type: levelType,
            level: Number(level),
            name: name.trim(),
            requiredExp: Math.max(0, Number(requiredExp) || 0),
            levelTag: levelTag.trim(),
            badgeColor,
            badgeIcon: badgeIcon.trim(),
            badgeAnimation: badgeAnimation.trim(),
            rewards: rewards.filter(r => r.name.trim()).map(r => ({
                ...r,
                name: r.name.trim(),
            })),
        };

        try {
            if (editingId) {
                const res = await api.patch<any>(API_ENDPOINTS.LEVELS_MGMT.UPDATE(editingId), payload);
                if (res.success || res.data) {
                    toast.success('Level updated successfully! 🎉');
                    setLevels(prev => prev.map(l => l._id === editingId ? (res.data || { ...l, ...payload }) : l));
                    resetForm();
                } else {
                    toast.error(res.message || 'Failed to update level');
                }
            } else {
                const res = await api.post<any>(API_ENDPOINTS.LEVELS_MGMT.CREATE, payload);
                if (res.success || res.data) {
                    toast.success('Level created successfully! 🎉');
                    const created = res.data || payload;
                    setLevels(prev => [...prev, created].sort((a, b) => a.level - b.level));
                    resetForm();
                } else {
                    toast.error(res.message || 'Failed to create level');
                }
            }
        } catch (error: any) {
            console.error('Save failed:', error);
            toast.error(error.message || 'Failed to save level');
        }
    };

    const handleEditLevel = (item: LevelData) => {
        setEditingId(item._id);
        setLevelType(item.type || activeTab === 'charm' ? 'charm' : 'wealth');
        setLevel(String(item.level));
        setName(item.name);
        setRequiredExp(String(item.requiredExp || 0));
        setLevelTag(item.levelTag || '');
        setBadgeColor(item.badgeColor || (item.type === 'charm' ? '#EC4899' : '#F59E0B'));
        setBadgeIcon(item.badgeIcon || '');
        setBadgeAnimation(item.badgeAnimation || '');
        setRewards((item.rewards || []).map(r => ({ ...r })));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteLevel = async (id: string) => {
        if (!confirm('Are you sure you want to delete this level?')) return;
        try {
            const res = await api.delete(API_ENDPOINTS.LEVELS_MGMT.DELETE(id));
            if (res.success) {
                toast.success('Level deleted');
                setLevels(prev => prev.filter(l => l._id !== id));
            } else {
                toast.error(res.message || 'Failed to delete level');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete level');
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setLevel('');
        setName('');
        setRequiredExp('0');
        setLevelTag('');
        setBadgeColor(levelType === 'charm' ? '#EC4899' : '#F59E0B');
        setBadgeIcon('');
        setBadgeAnimation('');
        setRewards([]);
    };

    // Check Availability for a requested Unique ID
    const checkAvailability = async (requestedId: string) => {
        const clean = String(requestedId).trim();
        if (!clean) return;

        setCheckingIdMap(prev => ({ ...prev, [clean]: { loading: true } }));
        try {
            const res = await api.get<any>(API_ENDPOINTS.UNIQUE_ID_REQUESTS.CHECK(clean));
            const isAvailable = res.data?.available ?? false;
            setCheckingIdMap(prev => ({
                ...prev,
                [clean]: {
                    loading: false,
                    available: isAvailable,
                    message: res.data?.message || (isAvailable ? 'Available to assign' : 'Already taken by another user'),
                }
            }));
            if (isAvailable) {
                toast.success(`ID "${clean}" is FREE and available!`);
            } else {
                toast.error(`ID "${clean}" is ALREADY TAKEN!`);
            }
        } catch (error: any) {
            setCheckingIdMap(prev => ({
                ...prev,
                [clean]: { loading: false, message: 'Check failed' }
            }));
            toast.error('Failed to verify ID availability');
        }
    };

    // Approve Unique ID Request with Strict Duplicate Prevention
    const handleApproveRequest = async (item: UniqueIdRequestItem) => {
        if (!confirm(`Are you sure you want to approve ID "${item.requestedId}" for user ${item.userName} (${item.originalUserId})?`)) {
            return;
        }

        try {
            setActionLoadingId(item._id);
            const res = await api.post<any>(API_ENDPOINTS.UNIQUE_ID_REQUESTS.APPROVE(item._id), {});
            if (res.success || res.data) {
                toast.success(`Success! ID "${item.requestedId}" assigned to ${item.userName}! 🎉`);
                setRequests(prev => prev.map(r => r._id === item._id ? { ...r, status: 'approved' } : r));
                setPendingRequestsCount(prev => Math.max(0, prev - 1));
            } else {
                toast.error(res.message || 'Approval failed');
            }
        } catch (error: any) {
            console.error('Approval failed:', error);
            // Highlights duplicate conflict clearly
            toast.error(error.message || 'Approval failed: ID is already taken by another user!');
        } finally {
            setActionLoadingId(null);
        }
    };

    // Reject Unique ID Request
    const handleRejectRequest = async (item: UniqueIdRequestItem) => {
        const reason = prompt('Enter rejection reason (optional):', 'Requested ID is unavailable or invalid');
        if (reason === null) return; // User cancelled

        try {
            setActionLoadingId(item._id);
            const res = await api.post<any>(API_ENDPOINTS.UNIQUE_ID_REQUESTS.REJECT(item._id), { reason });
            if (res.success || res.data) {
                toast.info(`Request for ID "${item.requestedId}" rejected`);
                setRequests(prev => prev.map(r => r._id === item._id ? { ...r, status: 'rejected', rejectionReason: reason } : r));
                setPendingRequestsCount(prev => Math.max(0, prev - 1));
            } else {
                toast.error(res.message || 'Rejection failed');
            }
        } catch (error: any) {
            toast.error(error.message || 'Rejection failed');
        } finally {
            setActionLoadingId(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        toast.success(`Copied: ${text}`);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header with Title and Mode Switchers */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-pink-400 to-primary bg-clip-text text-transparent flex items-center gap-2">
                        <Sparkles className="text-amber-400" size={28} /> Level Progression Studio
                    </h2>
                    <p className="text-slate-400 text-sm mt-1 font-sans">
                        Configure EXP-based Wealth & Charm levels, direct asset uploads, and Unique ID reward perk approvals.
                    </p>
                </div>

                {/* Top Tabs: Wealth vs Charm vs Unique ID Requests */}
                <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 shadow-inner">
                    <button
                        type="button"
                        onClick={() => setActiveTab('wealth')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'wealth'
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                    >
                        <Coins size={14} /> 💎 Wealth Levels
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('charm')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'charm'
                                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/20'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                    >
                        <Heart size={14} /> 💖 Charm Levels
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('requests')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all relative ${
                            activeTab === 'requests'
                                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/20'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                    >
                        <Crown size={14} /> 👑 Unique ID Requests
                        {pendingRequestsCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 animate-pulse">
                                {pendingRequestsCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* TAB CONTENT 1 & 2: WEALTH & CHARM LEVELS */}
            {(activeTab === 'wealth' || activeTab === 'charm') && (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Level Form (1 Column) */}
                    <Card className="glass-card lg:col-span-1 h-fit border-slate-800 bg-slate-950/60">
                        <CardHeader className="pb-3 border-b border-slate-800/60">
                            <CardTitle className="flex items-center justify-between text-slate-200 text-base">
                                <span className="flex items-center gap-2">
                                    {editingId ? <Edit2 size={18} className="text-amber-400" /> : <Plus size={18} className="text-primary" />}
                                    {editingId ? `Edit ${levelType.toUpperCase()} Level` : `Add New ${levelType.toUpperCase()} Level`}
                                </span>
                                <Badge variant="outline" className={`capitalize font-bold text-xs ${
                                    levelType === 'wealth' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10' : 'border-pink-500/40 text-pink-400 bg-pink-500/10'
                                }`}>
                                    {levelType === 'wealth' ? '💎 Spending EXP' : '💖 Receiving EXP'}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <form onSubmit={handleSaveLevel} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-300">Level Number *</label>
                                        <Input
                                            type="number"
                                            placeholder="e.g. 1"
                                            value={level}
                                            onChange={(e) => setLevel(e.target.value)}
                                            required
                                            disabled={!!editingId}
                                            className="text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-300">Required EXP *</label>
                                        <Input
                                            type="number"
                                            placeholder="e.g. 15000"
                                            value={requiredExp}
                                            onChange={(e) => setRequiredExp(e.target.value)}
                                            required
                                            className="text-xs"
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-400 -mt-2">
                                    {levelType === 'wealth'
                                        ? '💎 Cumulative diamonds spent or recharged by user to unlock this level.'
                                        : '💖 Cumulative diamonds/coins received from gifts and calls to unlock this level.'}
                                </p>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300">Level Name *</label>
                                    <Input
                                        placeholder={levelType === 'wealth' ? 'e.g. Gold Sovereign, Diamond Monarch' : 'e.g. Sweet Blossom, Superstar Idol'}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="text-xs"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-300">Level Tag / Title</label>
                                        <Input
                                            placeholder="e.g. 👑 VIP Lv.20"
                                            value={levelTag}
                                            onChange={(e) => setLevelTag(e.target.value)}
                                            className="text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-300">Theme Accent Color</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={badgeColor}
                                                onChange={(e) => setBadgeColor(e.target.value)}
                                                className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer p-0.5"
                                            />
                                            <Input
                                                value={badgeColor}
                                                onChange={(e) => setBadgeColor(e.target.value)}
                                                className="text-xs font-mono h-8"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* DIRECT FILE UPLOAD: BADGE ICON */}
                                <div className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                                            <ImageIcon size={14} /> Level Badge Icon (PNG / WebP)
                                        </p>
                                        {badgeIcon && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 text-[10px] text-red-400 hover:text-red-300 px-1.5"
                                                onClick={() => setBadgeIcon('')}
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>

                                    {badgeIcon ? (
                                        <div className="flex items-center gap-3 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                                            <div className="w-12 h-12 rounded-lg border border-amber-500/40 bg-slate-950 flex items-center justify-center overflow-hidden shrink-0">
                                                <img src={badgeIcon} alt="Badge Preview" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-slate-200 font-semibold truncate">Uploaded Badge Icon</p>
                                                <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                                                    <CheckCircle2 size={11} /> File Ready
                                                </p>
                                            </div>
                                            <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 font-semibold transition shrink-0">
                                                Change
                                                <input
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/webp,image/gif"
                                                    className="hidden"
                                                    disabled={uploadingBadgeIcon}
                                                    onChange={(e) => handleBadgeIconUpload(e.target.files?.[0])}
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-amber-500/40 p-4 text-center hover:bg-amber-500/10 transition">
                                            <UploadCloud size={22} className="text-amber-400" />
                                            <span className="text-xs font-bold text-amber-200">
                                                {uploadingBadgeIcon ? 'Uploading...' : 'Click to Upload Badge Icon'}
                                            </span>
                                            <span className="text-[10px] text-slate-400">PNG, WebP, or JPG (Direct file upload)</span>
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp,image/gif"
                                                className="hidden"
                                                disabled={uploadingBadgeIcon}
                                                onChange={(e) => handleBadgeIconUpload(e.target.files?.[0])}
                                            />
                                        </label>
                                    )}
                                </div>

                                {/* DIRECT FILE UPLOAD: BADGE ANIMATION SVGA */}
                                <div className="space-y-2 rounded-xl border border-purple-500/30 bg-purple-500/5 p-3.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                                            <Film size={14} /> Badge Animation SVGA (Optional)
                                        </p>
                                        {badgeAnimation && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 text-[10px] text-red-400 hover:text-red-300 px-1.5"
                                                onClick={() => setBadgeAnimation('')}
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>

                                    {badgeAnimation ? (
                                        <div className="flex items-center gap-3 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                                            <div className="w-10 h-10 rounded-lg border border-purple-500/40 bg-purple-950/40 flex items-center justify-center shrink-0 text-purple-300 text-xs font-bold">
                                                SVGA
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-slate-200 font-semibold truncate">Animated Asset Attached</p>
                                                <p className="text-[10px] text-purple-400 flex items-center gap-1 mt-0.5">
                                                    ✨ Live In-App Animation
                                                </p>
                                            </div>
                                            <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 font-semibold transition shrink-0">
                                                Change
                                                <input
                                                    type="file"
                                                    accept=".svga,image/gif,image/webp"
                                                    className="hidden"
                                                    disabled={uploadingBadgeAnimation}
                                                    onChange={(e) => handleBadgeAnimationUpload(e.target.files?.[0])}
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-purple-500/40 p-3.5 text-center hover:bg-purple-500/10 transition">
                                            <UploadCloud size={20} className="text-purple-400" />
                                            <span className="text-xs font-bold text-purple-200">
                                                {uploadingBadgeAnimation ? 'Uploading...' : 'Upload SVGA / GIF Animation'}
                                            </span>
                                            <span className="text-[10px] text-slate-400">Animated badge file (.svga or .gif)</span>
                                            <input
                                                type="file"
                                                accept=".svga,image/gif,image/webp"
                                                className="hidden"
                                                disabled={uploadingBadgeAnimation}
                                                onChange={(e) => handleBadgeAnimationUpload(e.target.files?.[0])}
                                            />
                                        </label>
                                    )}
                                </div>

                                {/* LEVEL REWARDS BUILDER */}
                                <div className="space-y-3 rounded-xl border border-violet-500/30 bg-violet-500/5 p-3.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-violet-200 flex items-center gap-1.5">
                                            <Crown size={14} /> Level Rewards & Perks
                                        </p>
                                        <span className="text-[10px] text-slate-400">0 days = Permanent</span>
                                    </div>

                                    {/* Action buttons to add perks */}
                                    <div className="flex flex-wrap gap-1.5">
                                        <Button type="button" size="sm" variant="outline" className="text-[11px] h-7 border-amber-500/40 text-amber-300 hover:bg-amber-500/10" onClick={() => addReward('uniqueId')}>
                                            👑 + Unique ID
                                        </Button>
                                        <Button type="button" size="sm" variant="outline" className="text-[11px] h-7 border-violet-500/30 text-violet-300" onClick={() => addReward('frame')}>+ Frame</Button>
                                        <Button type="button" size="sm" variant="outline" className="text-[11px] h-7 border-violet-500/30 text-violet-300" onClick={() => addReward('entry')}>+ Entry</Button>
                                        <Button type="button" size="sm" variant="outline" className="text-[11px] h-7 border-violet-500/30 text-violet-300" onClick={() => addReward('badge')}>+ Badge</Button>
                                        <Button type="button" size="sm" variant="outline" className="text-[11px] h-7 border-violet-500/30 text-violet-300" onClick={() => addReward('vehicle')}>+ Vehicle</Button>
                                        <Button type="button" size="sm" variant="outline" className="text-[11px] h-7 border-violet-500/30 text-violet-300" onClick={() => addReward('theme')}>+ Theme</Button>
                                    </div>

                                    {/* Render Rewards List */}
                                    {rewards.map((reward, index) => (
                                        <div key={`${index}-${reward.type}`} className={`space-y-2 rounded-xl border p-3 ${
                                            reward.type === 'uniqueId' ? 'border-amber-500/50 bg-amber-500/10' : 'border-slate-800 bg-slate-900/80'
                                        }`}>
                                            <div className="flex items-center justify-between">
                                                <Badge className={`capitalize font-bold text-[11px] ${
                                                    reward.type === 'uniqueId' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-violet-600/30 text-violet-300 border-violet-500/30'
                                                }`}>
                                                    {reward.type === 'uniqueId' ? '👑 Unique ID Perk' : reward.type}
                                                </Badge>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-400 hover:text-red-300 h-6 px-1.5"
                                                    onClick={() => setRewards(current => current.filter((_, pos) => pos !== index))}
                                                >
                                                    <Trash2 size={13} />
                                                </Button>
                                            </div>

                                            <Input
                                                value={reward.name}
                                                onChange={(e) => updateReward(index, { name: e.target.value })}
                                                placeholder="Perk title (e.g. 5-Digit Lucky ID Privilege)"
                                                required
                                                className="text-xs h-8"
                                            />

                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-400 shrink-0">Duration:</span>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={reward.durationDays}
                                                    onChange={(e) => updateReward(index, { durationDays: Number(e.target.value) })}
                                                    className="text-xs h-7 w-20"
                                                />
                                                <span className="text-xs text-slate-400 shrink-0">days (0 = Permanent)</span>
                                            </div>

                                            {/* SPECIAL CONFIG FOR UNIQUE ID */}
                                            {reward.type === 'uniqueId' ? (
                                                <div className="space-y-2 bg-slate-950/60 p-2.5 rounded-lg border border-amber-500/30">
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-[11px] text-amber-200 font-semibold shrink-0">Mode:</label>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateReward(index, {
                                                                    uniqueIdConfig: { ...reward.uniqueIdConfig, mode: 'request' }
                                                                })}
                                                                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                                                                    reward.uniqueIdConfig?.mode !== 'select'
                                                                        ? 'bg-amber-400 text-slate-950 font-bold'
                                                                        : 'bg-slate-800 text-slate-300'
                                                                }`}
                                                            >
                                                                User Custom Number Request (App)
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateReward(index, {
                                                                    uniqueIdConfig: { ...reward.uniqueIdConfig, mode: 'select' }
                                                                })}
                                                                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                                                                    reward.uniqueIdConfig?.mode === 'select'
                                                                        ? 'bg-amber-400 text-slate-950 font-bold'
                                                                        : 'bg-slate-800 text-slate-300'
                                                                }`}
                                                            >
                                                                Predefined Unique ID & Badge
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {reward.uniqueIdConfig?.mode === 'select' ? (
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] text-slate-400">Select Configured Unique ID Level / Badge:</label>
                                                            <select
                                                                value={reward.uniqueIdConfig?.uniqueIdLevelId || ''}
                                                                onChange={(e) => {
                                                                    const selectedId = e.target.value;
                                                                    const item = predefinedUniqueIds.find(u => u._id === selectedId);
                                                                    updateReward(index, {
                                                                        uniqueIdConfig: {
                                                                            mode: 'select',
                                                                            uniqueIdLevelId: selectedId,
                                                                            badgeName: item?.config?.badgeName || item?.name || 'VIP ID',
                                                                            badgeIconUrl: item?.config?.badgeIconUrl || '',
                                                                        }
                                                                    });
                                                                }}
                                                                className="w-full bg-slate-900 border border-slate-700 rounded-md p-1.5 text-xs text-slate-200"
                                                            >
                                                                <option value="">-- Choose Unique ID / Badge Level --</option>
                                                                {predefinedUniqueIds.map(u => (
                                                                    <option key={u._id} value={u._id}>
                                                                        {u.name} (Badge: {u.config?.badgeName || 'VIP'})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] text-amber-300/90 leading-tight">
                                                                👑 When reaching this level in app, user can enter their desired number ID (e.g. 77777). It sends a request to the panel for admin approval before assignment.
                                                            </p>
                                                            <Input
                                                                value={reward.uniqueIdConfig?.badgeName || ''}
                                                                onChange={(e) => updateReward(index, {
                                                                    uniqueIdConfig: { ...reward.uniqueIdConfig, mode: 'request', badgeName: e.target.value }
                                                                })}
                                                                placeholder="Badge Title (e.g. 5-Digit Sovereign ID)"
                                                                className="text-xs h-7"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                /* DIRECT UPLOAD CONTROLS FOR REGULAR REWARDS */
                                                <div className="space-y-2">
                                                    {/* Image Asset Upload */}
                                                    <div className="flex items-center gap-2">
                                                        {reward.imageUrl ? (
                                                            <div className="w-8 h-8 rounded border border-slate-700 bg-slate-950 overflow-hidden shrink-0">
                                                                <img src={reward.imageUrl} alt="" className="w-full h-full object-contain" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-8 h-8 rounded border border-dashed border-slate-700 bg-slate-950 flex items-center justify-center shrink-0 text-slate-500">
                                                                <ImageIcon size={14} />
                                                            </div>
                                                        )}
                                                        <label className="flex-1 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-violet-500/40 p-1.5 text-xs text-violet-200 hover:bg-violet-500/10">
                                                            <UploadCloud size={13} />
                                                            {uploadingRewardIndex?.index === index && uploadingRewardIndex?.field === 'imageUrl'
                                                                ? 'Uploading...'
                                                                : reward.imageUrl ? 'Change Image Asset' : 'Upload Image (PNG/WebP)'}
                                                            <input
                                                                type="file"
                                                                accept="image/png,image/jpeg,image/webp,image/gif"
                                                                className="hidden"
                                                                disabled={uploadingRewardIndex !== null}
                                                                onChange={(e) => handleRewardAssetUpload(index, 'imageUrl', e.target.files?.[0])}
                                                            />
                                                        </label>
                                                    </div>

                                                    {/* Optional Animation SVGA Upload */}
                                                    <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-purple-500/40 p-1.5 text-xs text-purple-200 hover:bg-purple-500/10">
                                                        <Film size={13} />
                                                        {uploadingRewardIndex?.index === index && uploadingRewardIndex?.field === 'animationUrl'
                                                            ? 'Uploading SVGA...'
                                                            : reward.animationUrl ? 'Change SVGA Asset' : 'Upload SVGA Animation (Optional)'}
                                                        <input
                                                            type="file"
                                                            accept=".svga,image/gif,image/webp"
                                                            className="hidden"
                                                            disabled={uploadingRewardIndex !== null}
                                                            onChange={(e) => handleRewardAssetUpload(index, 'animationUrl', e.target.files?.[0])}
                                                        />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        type="submit"
                                        className={`flex-1 font-bold text-slate-950 ${
                                            levelType === 'wealth'
                                                ? 'bg-amber-400 hover:bg-amber-300'
                                                : 'bg-pink-400 hover:bg-pink-300'
                                        }`}
                                    >
                                        {editingId ? `Update ${levelType.toUpperCase()} Level` : `Save ${levelType.toUpperCase()} Level`}
                                    </Button>
                                    {editingId && (
                                        <Button type="button" variant="outline" onClick={resetForm}>
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Levels Table (2 Columns) */}
                    <Card className="glass-card lg:col-span-2 border-slate-800 bg-slate-950/60">
                        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-800/60">
                            <CardTitle className="flex items-center gap-2 text-slate-200 text-base">
                                <Layers size={18} className={levelType === 'wealth' ? 'text-amber-400' : 'text-pink-400'} />
                                Configured {levelType.toUpperCase()} Levels ({levels.length})
                            </CardTitle>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => fetchLevels(levelType)}
                                className="h-8 text-xs gap-1 text-slate-300"
                            >
                                <RefreshCw size={12} className={loadingLevels ? 'animate-spin' : ''} /> Refresh
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-800">
                                        <TableHead className="font-bold text-slate-300">Level & Badge</TableHead>
                                        <TableHead className="font-bold text-slate-300">Name / Tag</TableHead>
                                        <TableHead className="font-bold text-slate-300">Required EXP</TableHead>
                                        <TableHead className="font-bold text-slate-300">Perks & Rewards</TableHead>
                                        <TableHead className="text-right font-bold text-slate-300">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingLevels ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                                                <RefreshCw className="animate-spin inline-block mr-2" size={16} /> Loading {levelType} levels...
                                            </TableCell>
                                        </TableRow>
                                    ) : levels.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                                                No {levelType} levels configured yet. Use the form on the left to add one!
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        levels.map((item) => (
                                            <TableRow key={item._id} className="hover:bg-slate-900/50 border-slate-800/60">
                                                {/* Badge Icon & Level */}
                                                <TableCell className="font-bold">
                                                    <div className="flex items-center gap-2.5">
                                                        {item.badgeIcon ? (
                                                            <div className="w-9 h-9 rounded-xl border border-amber-500/30 bg-slate-950 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                                                <img src={item.badgeIcon} alt={`Lv.${item.level}`} className="w-full h-full object-contain" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-xl border border-slate-700 bg-slate-800 flex items-center justify-center shrink-0 text-xs font-black text-slate-400">
                                                                Lv.{item.level}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <Badge
                                                                style={{ borderColor: item.badgeColor || '#F59E0B' }}
                                                                variant="outline"
                                                                className="text-xs font-black bg-slate-900/80"
                                                            >
                                                                Lv. {item.level}
                                                            </Badge>
                                                            {item.badgeAnimation && (
                                                                <span className="block text-[10px] text-purple-400 font-semibold mt-0.5">
                                                                    ✨ SVGA
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Level Name / Tag */}
                                                <TableCell>
                                                    <div className="font-bold text-slate-200 text-sm">{item.name}</div>
                                                    {item.levelTag && (
                                                        <span className="text-xs text-amber-300/80 font-normal">{item.levelTag}</span>
                                                    )}
                                                </TableCell>

                                                {/* Required EXP */}
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 font-bold text-amber-400 text-sm">
                                                        <Coins size={14} className="text-amber-400" />
                                                        <span>{Number(item.requiredExp || 0).toLocaleString()} EXP</span>
                                                    </div>
                                                </TableCell>

                                                {/* Rewards */}
                                                <TableCell>
                                                    <div className="flex min-w-[150px] flex-wrap gap-1">
                                                        {(item.rewards || []).length > 0 ? (
                                                            item.rewards?.map((reward, index) => (
                                                                <Badge
                                                                    key={index}
                                                                    variant="outline"
                                                                    className={`text-[10px] capitalize ${
                                                                        reward.type === 'uniqueId'
                                                                            ? 'border-amber-500/50 text-amber-300 bg-amber-500/10 font-bold'
                                                                            : 'border-slate-800 text-slate-300 bg-slate-900/60'
                                                                    }`}
                                                                >
                                                                    {reward.type === 'uniqueId' ? '👑 Unique ID' : `${reward.type}: ${reward.name}`}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-slate-500">None</span>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Actions */}
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => handleEditLevel(item)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Edit2 size={13} />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleDeleteLevel(item._id)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Trash2 size={13} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* TAB CONTENT 3: UNIQUE ID REQUESTS & APPROVALS */}
            {activeTab === 'requests' && (
                <div className="space-y-6">
                    {/* Controls & Search */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                            {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => setRequestStatusFilter(filter)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition ${
                                        requestStatusFilter === filter
                                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                                            : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    {filter} {filter === 'pending' && pendingRequestsCount > 0 && `(${pendingRequestsCount})`}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input
                                    placeholder="Search User ID, Name, Requested ID..."
                                    value={requestSearch}
                                    onChange={(e) => setRequestSearch(e.target.value)}
                                    className="pl-8 text-xs h-9 bg-slate-950 border-slate-800"
                                />
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={fetchUniqueIdRequests}
                                className="h-9 text-xs gap-1 border-slate-800 text-slate-200"
                            >
                                <RefreshCw size={13} className={loadingRequests ? 'animate-spin' : ''} /> Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Unique ID Requests Table */}
                    <Card className="glass-card border-slate-800 bg-slate-950/60">
                        <CardHeader className="pb-3 border-b border-slate-800/60">
                            <CardTitle className="text-base text-slate-200 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Crown size={18} className="text-amber-400" /> Unique ID Perk Requests
                                </span>
                                <span className="text-xs font-normal text-slate-400">
                                    🔒 System automatically verifies ID availability before approval to prevent duplicates.
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-800">
                                        <TableHead className="font-bold text-slate-300">User</TableHead>
                                        <TableHead className="font-bold text-slate-300">Level Source</TableHead>
                                        <TableHead className="font-bold text-slate-300">Requested Unique ID</TableHead>
                                        <TableHead className="font-bold text-slate-300">Availability Check</TableHead>
                                        <TableHead className="font-bold text-slate-300">Submitted At</TableHead>
                                        <TableHead className="font-bold text-slate-300">Status</TableHead>
                                        <TableHead className="text-right font-bold text-slate-300">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingRequests ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                                                <RefreshCw className="animate-spin inline-block mr-2" size={16} /> Loading requests...
                                            </TableCell>
                                        </TableRow>
                                    ) : requests.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                                                No {requestStatusFilter === 'all' ? '' : requestStatusFilter} Unique ID requests found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        requests.map((item) => {
                                            const availability = checkingIdMap[item.requestedId];
                                            const isActionLoading = actionLoadingId === item._id;

                                            return (
                                                <TableRow key={item._id} className="hover:bg-slate-900/50 border-slate-800/60">
                                                    {/* User Details */}
                                                    <TableCell>
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-9 h-9 rounded-full border border-slate-700 bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-slate-300">
                                                                {item.userAvatar ? (
                                                                    <img src={item.userAvatar} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    item.userName?.charAt(0) || 'U'
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-200 text-xs">{item.userName}</div>
                                                                <div className="text-[11px] text-slate-400 font-mono">ID: {item.originalUserId}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Level Source */}
                                                    <TableCell>
                                                        <Badge variant="outline" className={`text-xs font-bold capitalize ${
                                                            item.levelType === 'wealth'
                                                                ? 'border-amber-500/40 text-amber-300 bg-amber-500/10'
                                                                : 'border-pink-500/40 text-pink-300 bg-pink-500/10'
                                                        }`}>
                                                            {item.levelType} Lv.{item.levelNumber}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Requested ID */}
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-black text-sm tracking-wider">
                                                                👑 {item.requestedId}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => copyToClipboard(item.requestedId)}
                                                                className="text-slate-400 hover:text-slate-200 p-1"
                                                                title="Copy ID"
                                                            >
                                                                {copiedId === item.requestedId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                                            </button>
                                                        </div>
                                                    </TableCell>

                                                    {/* Real-time Availability Check */}
                                                    <TableCell>
                                                        {availability ? (
                                                            availability.loading ? (
                                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                    <RefreshCw size={12} className="animate-spin" /> Verifying...
                                                                </span>
                                                            ) : availability.available ? (
                                                                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-bold gap-1">
                                                                    <CheckCircle2 size={12} /> Available
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-xs font-bold gap-1">
                                                                    <XCircle size={12} /> Already Taken
                                                                </Badge>
                                                            )
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => checkAvailability(item.requestedId)}
                                                                className="h-7 text-[11px] text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                                                            >
                                                                <ShieldCheck size={13} className="mr-1" /> Check Status
                                                            </Button>
                                                        )}
                                                    </TableCell>

                                                    {/* Submitted At */}
                                                    <TableCell className="text-xs text-slate-400">
                                                        {new Date(item.createdAt).toLocaleString()}
                                                    </TableCell>

                                                    {/* Status Badge */}
                                                    <TableCell>
                                                        {item.status === 'pending' && (
                                                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-bold">
                                                                ⏳ Pending Review
                                                            </Badge>
                                                        )}
                                                        {item.status === 'approved' && (
                                                            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-bold">
                                                                ✅ Approved
                                                            </Badge>
                                                        )}
                                                        {item.status === 'rejected' && (
                                                            <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-xs font-bold">
                                                                ❌ Rejected
                                                            </Badge>
                                                        )}
                                                    </TableCell>

                                                    {/* Actions */}
                                                    <TableCell className="text-right">
                                                        {item.status === 'pending' ? (
                                                            <div className="flex justify-end gap-1.5">
                                                                <Button
                                                                    size="sm"
                                                                    disabled={isActionLoading}
                                                                    onClick={() => handleApproveRequest(item)}
                                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-7 px-2.5"
                                                                >
                                                                    {isActionLoading ? 'Saving...' : 'Approve'}
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    disabled={isActionLoading}
                                                                    onClick={() => handleRejectRequest(item)}
                                                                    className="font-bold text-xs h-7 px-2.5"
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-500 italic">
                                                                {item.status === 'approved' ? 'Assigned' : item.rejectionReason || 'Rejected'}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

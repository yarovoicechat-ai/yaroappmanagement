'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog";
import {
    Sparkles,
    Search,
    User,
    Gift,
    Clock,
    Send,
    CheckCircle2,
    AlertCircle,
    Trash2,
    Crown,
    Flame,
    Shield,
    Tag,
    Image as ImageIcon,
    MessageSquare,
    Eye,
    Briefcase,
    Check,
    RefreshCw,
    X,
    ExternalLink
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { getAdminAvatar } from '@/lib/avatar';

interface AssetOption {
    _id: string;
    id?: string;
    uniqueId: string;
    name: string;
    category: string;
    audience?: string;
    isStaffOnly?: boolean;
    imageUrl?: string;
    animationUrl?: string;
    price?: number;
    badgeText?: string;
    previewColor?: string;
}

interface TargetUser {
    _id: string;
    userId: number;
    name: string;
    phoneNumber?: string;
    email?: string;
    image?: string;
    role: string;
    diamonds?: number;
    coins?: number;
    isBlocked?: boolean;
    status?: string;
}

interface GrantHistoryItem {
    _id: string;
    adminId?: {
        name?: string;
        email?: string;
        userId?: number;
    };
    action: string;
    target: string;
    details: string;
    newValue?: {
        assetId?: string;
        uniqueId?: string;
        assetName?: string;
        category?: string;
        userId?: string;
        userNumericId?: number;
        userName?: string;
        durationDays?: number;
        expiresAt?: string;
        message?: string;
    };
    createdAt: string;
}

const CATEGORY_TABS = [
    { label: 'All Assets', value: 'All' },
    { label: 'Frames 🖼️', value: 'Frames' },
    { label: 'Entry Effects 🚗', value: 'Entry' },
    { label: 'Tags & Badges 🏷️', value: 'Badge' },
    { label: 'VIP / SVIP 👑', value: 'VIP' },
    { label: 'King of Kings ⚔️', value: 'King of Kings' },
    { label: 'Chat Bubbles 💬', value: 'Chat Bubble' },
    { label: 'Themes 🎨', value: 'Theme' },
    { label: 'Staff / Employee 👔', value: 'Employee' },
];

const DURATION_PRESETS = [
    { label: '1 Day', days: 1 },
    { label: '3 Days', days: 3 },
    { label: '7 Days', days: 7 },
    { label: '15 Days', days: 15 },
    { label: '30 Days', days: 30 },
    { label: '90 Days', days: 90 },
    { label: '365 Days (1 Yr)', days: 365 },
    { label: 'Permanent ∞', days: 0 },
];

export default function AssetDistributionPage() {
    // Search & Data State
    const [assets, setAssets] = useState<AssetOption[]>([]);
    const [loadingAssets, setLoadingAssets] = useState(true);
    const [selectedCategoryTab, setSelectedCategoryTab] = useState('All');
    const [assetSearchQuery, setAssetSearchQuery] = useState('');

    // Selected Asset
    const [selectedAsset, setSelectedAsset] = useState<AssetOption | null>(null);
    const [directUniqueIdInput, setDirectUniqueIdInput] = useState('');

    // User Search State
    const [userQuery, setUserQuery] = useState('');
    const [userLookupResults, setUserLookupResults] = useState<TargetUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<TargetUser | null>(null);
    const [isSearchingUser, setIsSearchingUser] = useState(false);

    // Form Config
    const [durationDays, setDurationDays] = useState<number>(30);
    const [customDaysInput, setCustomDaysInput] = useState('30');
    const [customMessage, setCustomMessage] = useState('');
    const [autoEquip, setAutoEquip] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // History & Modals
    const [history, setHistory] = useState<GrantHistoryItem[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    // Fetch Assets Catalog
    const fetchCatalog = useCallback(async () => {
        try {
            setLoadingAssets(true);
            const res = await apiClient.get<any>('/api/store/asset-catalog');
            if (res.success && res.data) {
                setAssets(res.data.assets || []);
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to load assets catalog');
        } finally {
            setLoadingAssets(false);
        }
    }, []);

    // Fetch Grant History
    const fetchHistory = useCallback(async () => {
        try {
            setLoadingHistory(true);
            const res = await apiClient.get<any>('/api/store/grant-history');
            if (res.success && res.data) {
                setHistory(res.data.history || []);
            }
        } catch (err: any) {
            console.warn('Grant history load notice:', err.message);
        } finally {
            setLoadingHistory(false);
        }
    }, []);

    useEffect(() => {
        fetchCatalog();
        fetchHistory();
    }, [fetchCatalog, fetchHistory]);

    // Lookup User by ID / Phone / Name
    const handleSearchUser = async (val: string) => {
        setUserQuery(val);
        if (!val.trim()) {
            setUserLookupResults([]);
            return;
        }
        try {
            setIsSearchingUser(true);
            const res = await apiClient.get<any>('/api/store/user-lookup', { query: val.trim() });
            if (res.success && res.data) {
                setUserLookupResults(res.data.users || []);
            }
        } catch (err) {
            console.warn('User search notice:', err);
        } finally {
            setIsSearchingUser(false);
        }
    };

    // Quick Asset Lookup by Unique ID
    const handleQuickUniqueIdLookup = (uniqueIdToFind: string) => {
        const clean = uniqueIdToFind.trim();
        setDirectUniqueIdInput(clean);
        if (!clean) return;
        const found = assets.find(a => 
            String(a.uniqueId).toLowerCase() === clean.toLowerCase() ||
            String(a._id) === clean
        );
        if (found) {
            setSelectedAsset(found);
            toast.success(`Selected asset: ${found.name} (ID: ${found.uniqueId})`);
        } else {
            toast.info(`No loaded asset with ID "${clean}". You can still type it manually.`);
        }
    };

    // Filtered Assets List
    const filteredAssets = useMemo(() => {
        return assets.filter(item => {
            // Category filter
            if (selectedCategoryTab === 'Employee') {
                if (item.audience !== 'employee' && !item.isStaffOnly) return false;
            } else if (selectedCategoryTab !== 'All') {
                if (item.category !== selectedCategoryTab) return false;
            }

            // Search query filter (matches name, uniqueId, category)
            if (assetSearchQuery.trim()) {
                const q = assetSearchQuery.toLowerCase();
                const matchName = item.name.toLowerCase().includes(q);
                const matchId = String(item.uniqueId || '').toLowerCase().includes(q);
                const matchCat = String(item.category || '').toLowerCase().includes(q);
                return matchName || matchId || matchCat;
            }
            return true;
        });
    }, [assets, selectedCategoryTab, assetSearchQuery]);

    // Handle Preset Duration Click
    const handleDurationPreset = (days: number) => {
        setDurationDays(days);
        setCustomDaysInput(String(days));
    };

    // Handle Custom Days Input
    const handleCustomDaysChange = (val: string) => {
        setCustomDaysInput(val);
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed) && parsed >= 0) {
            setDurationDays(parsed);
        }
    };

    // Execute Asset Grant
    const handleExecuteGrant = async () => {
        if (!selectedUser && !userQuery.trim()) {
            toast.error('Please specify a target user (User ID, phone or email)');
            return;
        }
        if (!selectedAsset && !directUniqueIdInput.trim()) {
            toast.error('Please select an asset or enter a Unique Asset ID (e.g. 555)');
            return;
        }

        try {
            setSubmitting(true);
            const userIdentifier = selectedUser ? String(selectedUser.userId || selectedUser._id) : userQuery.trim();
            const assetIdentifier = selectedAsset ? (selectedAsset.uniqueId || selectedAsset._id) : directUniqueIdInput.trim();

            const payload = {
                userQuery: userIdentifier,
                assetQuery: assetIdentifier,
                durationDays: Number(durationDays),
                message: customMessage.trim(),
                autoEquip,
            };

            const res = await apiClient.post<any>('/api/store/grant-asset', payload);

            if (res.success) {
                toast.success(res.message || 'Asset granted successfully!');
                setConfirmModalOpen(false);
                // Clear selection
                setSelectedUser(null);
                setUserQuery('');
                setUserLookupResults([]);
                setSelectedAsset(null);
                setDirectUniqueIdInput('');
                setCustomMessage('');
                // Refresh history & catalog
                fetchHistory();
                fetchCatalog();
            } else {
                toast.error(res.message || 'Failed to grant asset');
            }
        } catch (err: any) {
            toast.error(err.message || 'Error occurred while granting asset');
        } finally {
            setSubmitting(false);
        }
    };

    // Computed message preview
    const previewDisplayMessage = useMemo(() => {
        const assetName = selectedAsset?.name || directUniqueIdInput || 'Exclusive Asset';
        const daysText = durationDays > 0 ? `${durationDays} Days` : 'Permanent Lifetime';
        if (customMessage.trim()) return customMessage.trim();
        return `🎁 Congratulations! You have received ${assetName} (${daysText}) from the Official Admin Team. Tap View to equip in My Items.`;
    }, [customMessage, selectedAsset, directUniqueIdInput, durationDays]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-amber-500/20 border border-purple-500/30 rounded-xl text-purple-400">
                            <Sparkles className="h-6 w-6 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                                Asset Distribution & Rewards
                            </h1>
                            <p className="text-slate-400 text-sm mt-0.5 font-medium">
                                Direct grant of Frames, Rides, Tags, SVIP & King of Kings to user backpacks with real-time System Messages.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { fetchCatalog(); fetchHistory(); }}
                        className="flex items-center gap-2 border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800"
                    >
                        <RefreshCw size={14} className={loadingAssets ? 'animate-spin' : ''} />
                        Refresh Catalog
                    </Button>
                </div>
            </div>

            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
                    <CardContent className="p-4 flex items-center gap-3.5">
                        <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl">
                            <Gift className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Active Asset Catalog</p>
                            <p className="text-2xl font-black text-slate-100">{assets.length}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
                    <CardContent className="p-4 flex items-center gap-3.5">
                        <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
                            <Crown className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">SVIP & King Packages</p>
                            <p className="text-2xl font-black text-slate-100">
                                {assets.filter(a => a.category === 'VIP' || a.category === 'King of Kings').length}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
                    <CardContent className="p-4 flex items-center gap-3.5">
                        <div className="p-3 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Staff & Employee Only</p>
                            <p className="text-2xl font-black text-slate-100">
                                {assets.filter(a => a.isStaffOnly || a.audience === 'employee').length}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
                    <CardContent className="p-4 flex items-center gap-3.5">
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
                            <Send className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Total Rewards Sent</p>
                            <p className="text-2xl font-black text-slate-100">{history.length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Interactive Command Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 7 Columns: Grant Action Engine */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Step 1: Target User Search */}
                    <Card className="bg-slate-900/80 border-slate-800 shadow-xl backdrop-blur-lg">
                        <CardHeader className="pb-3 border-b border-slate-800/80">
                            <div className="flex items-center gap-2">
                                <span className="h-6 w-6 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black text-xs flex items-center justify-center">1</span>
                                <CardTitle className="text-base font-bold text-slate-100">Select Target User (Recipient)</CardTitle>
                            </div>
                            <CardDescription className="text-xs text-slate-400">
                                Enter user numeric ID (e.g. 1000000086), Meethi ID, phone number or name.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by User Numeric ID, Phone or Name..."
                                    value={userQuery}
                                    onChange={(e) => handleSearchUser(e.target.value)}
                                    className="pl-10 bg-slate-950/70 border-slate-700 text-slate-100 placeholder:text-slate-500"
                                />
                                {isSearchingUser && (
                                    <div className="absolute right-3.5 top-3.5">
                                        <RefreshCw size={14} className="animate-spin text-purple-400" />
                                    </div>
                                )}
                            </div>

                            {/* Search Dropdown Results */}
                            {userLookupResults.length > 0 && !selectedUser && (
                                <div className="border border-slate-800 rounded-xl bg-slate-950 p-2 max-h-56 overflow-y-auto space-y-1.5 shadow-2xl">
                                    {userLookupResults.map((u) => (
                                        <div
                                            key={u._id}
                                            onClick={() => { setSelectedUser(u); setUserQuery(String(u.userId)); }}
                                            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-900/90 cursor-pointer border border-transparent hover:border-slate-800 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-slate-800 overflow-hidden border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-200">
                                                    <img src={getAdminAvatar(u)} alt={u.name} className="h-full w-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-sm text-slate-200">{u.name || 'Unnamed'}</p>
                                                        <Badge variant="outline" className="text-[10px] py-0 border-purple-500/30 text-purple-400">
                                                            {u.role || 'user'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-slate-400 font-mono">ID: {u.userId} {u.phoneNumber ? `• ${u.phoneNumber}` : ''}</p>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300">
                                                Select
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Selected User Verification Card */}
                            {selectedUser && (
                                <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-purple-400/50 flex items-center justify-center bg-slate-800">
                                            <img src={getAdminAvatar(selectedUser)} alt={selectedUser.name} className="h-full w-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-black text-base text-slate-100">{selectedUser.name}</p>
                                                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                                                    Verified Target
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-purple-300 font-mono">
                                                User ID: <span className="font-bold text-white">{selectedUser.userId}</span> • Role: {selectedUser.role}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => { setSelectedUser(null); setUserQuery(''); }}
                                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                                    >
                                        <X size={16} />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Step 2: Asset Selection by ID or Picker */}
                    <Card className="bg-slate-900/80 border-slate-800 shadow-xl backdrop-blur-lg">
                        <CardHeader className="pb-3 border-b border-slate-800/80">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="h-6 w-6 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 font-black text-xs flex items-center justify-center">2</span>
                                    <CardTitle className="text-base font-bold text-slate-100">Select Asset to Grant</CardTitle>
                                </div>
                                <span className="text-xs text-slate-400 font-mono">E.g. SVIP 1 ID = 555</span>
                            </div>
                            <CardDescription className="text-xs text-slate-400">
                                Enter the Unique Asset ID directly or browse visually by category below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {/* Fast Direct Unique ID Input */}
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Tag className="absolute left-3.5 top-3.5 h-4 w-4 text-pink-400" />
                                    <Input
                                        placeholder="Enter Unique Asset ID directly (e.g. 555, 1001)..."
                                        value={directUniqueIdInput}
                                        onChange={(e) => handleQuickUniqueIdLookup(e.target.value)}
                                        className="pl-10 font-mono font-bold text-pink-300 bg-slate-950/70 border-slate-700"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => handleQuickUniqueIdLookup(directUniqueIdInput)}
                                    className="border-pink-500/30 text-pink-300 hover:bg-pink-500/10 font-bold"
                                >
                                    Lookup
                                </Button>
                            </div>

                            {/* Category Filter Pills */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                                {CATEGORY_TABS.map((tab) => (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        onClick={() => setSelectedCategoryTab(tab.value)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                                            selectedCategoryTab === tab.value
                                                ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                                                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Search Within Assets */}
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                <Input
                                    placeholder="Search by asset name or unique ID..."
                                    value={assetSearchQuery}
                                    onChange={(e) => setAssetSearchQuery(e.target.value)}
                                    className="pl-9 h-9 text-xs bg-slate-950/50 border-slate-800"
                                />
                            </div>

                            {/* Assets Visual Grid (Selectable) */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1.5 rounded-xl border border-slate-800/80 bg-slate-950/40">
                                {loadingAssets ? (
                                    <div className="col-span-full py-8 text-center text-xs text-slate-500">Loading catalog...</div>
                                ) : filteredAssets.length === 0 ? (
                                    <div className="col-span-full py-8 text-center text-xs text-slate-500">No assets match this category/search</div>
                                ) : (
                                    filteredAssets.map((asset) => {
                                        const isSelected = selectedAsset?._id === asset._id || directUniqueIdInput === asset.uniqueId;
                                        return (
                                            <div
                                                key={asset._id}
                                                onClick={() => { setSelectedAsset(asset); setDirectUniqueIdInput(asset.uniqueId || ''); }}
                                                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                                                    isSelected
                                                        ? 'bg-pink-950/40 border-pink-500 shadow-lg shadow-pink-500/20'
                                                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-1 mb-2">
                                                    <Badge className="bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-mono font-bold">
                                                        ID: {asset.uniqueId || 'N/A'}
                                                    </Badge>
                                                    {asset.isStaffOnly && (
                                                        <Badge className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px]">
                                                            Staff
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="h-16 w-full flex items-center justify-center my-1">
                                                    {asset.imageUrl ? (
                                                        <img src={asset.imageUrl} alt={asset.name} className="max-h-full max-w-full object-contain" />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-lg bg-slate-800 flex items-center justify-center text-purple-400">
                                                            <Sparkles size={20} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="font-bold text-xs text-slate-200 truncate">{asset.name}</p>
                                                    <p className="text-[10px] text-slate-400 truncate">{asset.category}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Selected Asset Banner */}
                            {selectedAsset && (
                                <div className="p-3 rounded-xl bg-gradient-to-r from-pink-950/30 to-purple-950/30 border border-pink-500/40 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center p-1">
                                            {selectedAsset.imageUrl ? (
                                                <img src={selectedAsset.imageUrl} alt={selectedAsset.name} className="h-full w-full object-contain" />
                                            ) : (
                                                <Sparkles className="text-pink-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-black text-sm text-slate-100">{selectedAsset.name}</p>
                                                <Badge className="bg-pink-500 text-black font-black text-[10px]">
                                                    ID: {selectedAsset.uniqueId}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-400">
                                                Category: <span className="text-purple-300 font-semibold">{selectedAsset.category}</span>
                                                {selectedAsset.isStaffOnly ? ' • Staff Exclusive' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => { setSelectedAsset(null); setDirectUniqueIdInput(''); }}
                                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                                    >
                                        <X size={16} />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Step 3: Duration, Validity & Notification */}
                    <Card className="bg-slate-900/80 border-slate-800 shadow-xl backdrop-blur-lg">
                        <CardHeader className="pb-3 border-b border-slate-800/80">
                            <div className="flex items-center gap-2">
                                <span className="h-6 w-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs flex items-center justify-center">3</span>
                                <CardTitle className="text-base font-bold text-slate-100">Validity, Message & Execution</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {/* Duration Presets */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                    <span>Reward Validity Duration</span>
                                    <span className="text-amber-400 font-mono normal-case">
                                        {durationDays > 0 ? `${durationDays} Days continuous validity` : 'Permanent Lifetime'}
                                    </span>
                                </label>
                                <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                                    {DURATION_PRESETS.map((p) => (
                                        <button
                                            key={p.days}
                                            type="button"
                                            onClick={() => handleDurationPreset(p.days)}
                                            className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                                                durationDays === p.days
                                                    ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/25 font-black'
                                                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                    <span className="text-xs text-slate-400 font-medium">Custom Days:</span>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="3650"
                                        value={customDaysInput}
                                        onChange={(e) => handleCustomDaysChange(e.target.value)}
                                        className="w-24 h-8 text-xs font-bold text-center bg-slate-950 border-slate-700"
                                    />
                                    <span className="text-xs text-slate-500">(0 = permanent lifetime)</span>
                                </div>

                                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                                    <Clock className="h-4 w-4 mt-0.5 shrink-0 text-amber-400" />
                                    <span>
                                        <strong>Strict Expiry Rule:</strong> Validity countdown starts immediately upon sending. Whether the user equips it or leaves it unequipped in My Items, the validity remains strictly time-bound.
                                    </span>
                                </div>
                            </div>

                            {/* Custom Message to User */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        Official Message / Reason (Optional)
                                    </label>
                                    <span className="text-xs text-purple-400">Sent as System Notification</span>
                                </div>
                                <textarea
                                    rows={2}
                                    placeholder="E.g. Congratulations! You have received SVIP King of Kings frame from Admin Team."
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    className="w-full text-xs p-3 rounded-lg bg-slate-950/70 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-all resize-none"
                                />
                            </div>

                            {/* Auto Equip Checkbox */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-slate-200">Auto-Equip for User</p>
                                    <p className="text-[11px] text-slate-400">Equip frame / ride / tag immediately upon grant.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAutoEquip(!autoEquip)}
                                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                                        autoEquip ? 'bg-purple-600' : 'bg-slate-800'
                                    }`}
                                >
                                    <div
                                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                            autoEquip ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Submit Button */}
                            <Button
                                onClick={() => setConfirmModalOpen(true)}
                                disabled={(!selectedUser && !userQuery.trim()) || (!selectedAsset && !directUniqueIdInput.trim())}
                                className="w-full py-5 text-sm font-black bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2"
                            >
                                <Send size={16} />
                                Grant Asset to User Now
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right 5 Columns: Live Notification Preview & Audit Feed */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Live Mobile Notification Preview */}
                    <Card className="bg-slate-900/80 border-slate-800 shadow-xl backdrop-blur-lg">
                        <CardHeader className="pb-3 border-b border-slate-800/80">
                            <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-purple-400" />
                                User Mobile Notification Preview
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-400">
                                This is how the recipient will see it in the app's System Notice screen:
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {/* Mock In-App System Notice Card */}
                            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/40 border border-purple-500/30 shadow-2xl space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-10 w-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                                            <Gift size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white">🎁 New Asset Reward Received!</p>
                                            <p className="text-[10px] text-purple-300 font-semibold">Official Management • Just now</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[9px] font-bold">
                                        NEW
                                    </Badge>
                                </div>

                                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                    {previewDisplayMessage}
                                </p>

                                {/* Deep-link View button that redirects to My Items */}
                                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                                    <span className="text-[10px] text-slate-500 font-mono">Action: Redirect to My Items</span>
                                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-md">
                                        <Eye size={12} />
                                        <span>View in My Items</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Grants Log Table */}
                    <Card className="bg-slate-900/80 border-slate-800 shadow-xl backdrop-blur-lg">
                        <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-200">Recent Distribution History</CardTitle>
                                <CardDescription className="text-xs text-slate-400">Audit trail of rewards granted by admins</CardDescription>
                            </div>
                            <Button size="sm" variant="ghost" onClick={fetchHistory} className="h-7 w-7 p-0 text-slate-400">
                                <RefreshCw size={13} className={loadingHistory ? 'animate-spin' : ''} />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 max-h-96 overflow-y-auto">
                            {loadingHistory ? (
                                <div className="py-8 text-center text-xs text-slate-500">Loading history...</div>
                            ) : history.length === 0 ? (
                                <div className="py-8 text-center text-xs text-slate-500">No grant records found</div>
                            ) : (
                                <div className="divide-y divide-slate-800/60">
                                    {history.map((item) => (
                                        <div key={item._id} className="p-3 text-xs hover:bg-slate-800/40 transition-colors">
                                            <div className="flex items-center justify-between gap-1 mb-1">
                                                <span className="font-bold text-slate-200">
                                                    {item.newValue?.assetName || 'Asset'}
                                                </span>
                                                <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-mono">
                                                    ID: {item.newValue?.uniqueId || 'N/A'}
                                                </Badge>
                                            </div>
                                            <p className="text-[11px] text-slate-400">
                                                Granted to: <span className="font-semibold text-slate-300">{item.newValue?.userName || item.target}</span> (ID: {item.newValue?.userNumericId || 'N/A'})
                                            </p>
                                            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                                                <span>Duration: {item.newValue?.durationDays ? `${item.newValue.durationDays} Days` : 'Permanent'}</span>
                                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Confirmation Dialog Before Grant */}
            <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-100">
                            <Sparkles className="h-5 w-5 text-amber-400" />
                            <span>Confirm Asset Grant</span>
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to grant this asset? The validity timer will start immediately and a system message will be delivered to the user.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2 text-sm">
                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                            <p className="text-xs text-slate-400">Target Recipient:</p>
                            <p className="font-bold text-slate-100">
                                {selectedUser ? `${selectedUser.name} (User ID: ${selectedUser.userId})` : userQuery}
                            </p>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                            <p className="text-xs text-slate-400">Asset to Grant:</p>
                            <p className="font-bold text-purple-300">
                                {selectedAsset ? `${selectedAsset.name} (Unique ID: ${selectedAsset.uniqueId})` : `Asset ID: ${directUniqueIdInput}`}
                            </p>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                            <p className="text-xs text-slate-400">Validity & Auto-Equip:</p>
                            <p className="font-bold text-amber-400">
                                {durationDays > 0 ? `${durationDays} Days` : 'Permanent Lifetime'} • {autoEquip ? 'Auto-Equip Enabled' : 'Leave in Inventory'}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setConfirmModalOpen(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleExecuteGrant}
                            disabled={submitting}
                            className="bg-purple-600 hover:bg-purple-700 font-bold flex items-center gap-2"
                        >
                            {submitting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                            Confirm & Send Grant
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

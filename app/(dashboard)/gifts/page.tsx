'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from '@/components/ui/Table';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from '@/components/ui/Dialog';
import {
    Gift, Plus, Trash2, Pencil, Search, PackageOpen,
    Sparkles, Gem, Flame, Crown, Zap, Clock, Eye, ExternalLink,
    Volume2, FileUp, LayoutGrid, List, CheckCircle2, Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import GiftFormModal, { GiftFormData } from '@/components/gifts/GiftFormModal';

export default function GiftsPage() {
    const [gifts, setGifts] = useState<GiftFormData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editingGift, setEditingGift] = useState<GiftFormData | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<GiftFormData | null>(null);
    const [previewTarget, setPreviewTarget] = useState<GiftFormData | null>(null);
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

    useEffect(() => {
        fetchGifts();
    }, []);

    const fetchGifts = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(API_ENDPOINTS.GIFTS.LIST);
            if (res.success && res.data) {
                setGifts((res.data as any) || []);
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to load gifts');
        } finally {
            setLoading(false);
        }
    };

    const existingCategories = Array.from(
        new Set(['Popular', 'Luxury', 'Romantic', 'Special', ...gifts.map(g => g.category).filter(Boolean)])
    );

    const openCreateModal = () => {
        setEditingGift(null);
        setShowAddDialog(true);
    };

    const openEditModal = (gift: GiftFormData) => {
        setEditingGift(gift);
        setShowAddDialog(true);
    };

    const handleToggle = async (gift: GiftFormData) => {
        if (!gift._id) return;
        try {
            const endpoint = `${API_ENDPOINTS.GIFTS.TOGGLE(gift._id)}`.replace('/toggle', '');
            const res = await apiClient.put(endpoint, { isActive: !gift.isActive });
            if (res.success) {
                toast.success(`Gift "${gift.name}" status updated to ${!gift.isActive ? 'Active' : 'Inactive'}`);
                setGifts(prev => prev.map(g => g._id === gift._id ? { ...g, isActive: !g.isActive } : g));
            } else {
                toast.error(res.message || 'Failed to update gift status');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to update gift status');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget || !deleteTarget._id) return;
        try {
            const res = await apiClient.delete(API_ENDPOINTS.GIFTS.DELETE(deleteTarget._id));
            if (res.success) {
                toast.success(`Gift "${deleteTarget.name}" deleted successfully`);
                setDeleteTarget(null);
                fetchGifts();
            } else {
                toast.error(res.message || 'Failed to delete gift');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete gift');
        }
    };

    const filtered = gifts.filter(gift => {
        const matchesCategory =
            selectedCategoryFilter.toLowerCase() === 'all' ||
            (gift.category && gift.category.toLowerCase() === selectedCategoryFilter.toLowerCase());

        const matchesSearch =
            gift.name.toLowerCase().includes(search.toLowerCase()) ||
            (gift.category && gift.category.toLowerCase().includes(search.toLowerCase())) ||
            (gift.rarity && gift.rarity.toLowerCase().includes(search.toLowerCase()));

        return matchesCategory && matchesSearch;
    });

    const activeCount = gifts.filter(g => g.isActive).length;

    // Helper for card glow and border based on rarity
    const getRarityTheme = (rarity?: string) => {
        const r = (rarity || 'common').toLowerCase();
        if (r === 'legendary' || r === 'mythic') {
            return {
                border: 'border-amber-500/50 hover:border-amber-400',
                glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]',
                bgGradient: 'bg-gradient-to-b from-amber-950/40 via-purple-950/30 to-slate-950',
                badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                halo: 'bg-amber-500/20',
                icon: Crown,
            };
        }
        if (r === 'epic') {
            return {
                border: 'border-purple-500/50 hover:border-purple-400',
                glow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]',
                bgGradient: 'bg-gradient-to-b from-purple-950/40 via-pink-950/30 to-slate-950',
                badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
                halo: 'bg-purple-500/20',
                icon: Sparkles,
            };
        }
        if (r === 'rare') {
            return {
                border: 'border-cyan-500/50 hover:border-cyan-400',
                glow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]',
                bgGradient: 'bg-gradient-to-b from-cyan-950/40 via-blue-950/30 to-slate-950',
                badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
                halo: 'bg-cyan-500/20',
                icon: Gem,
            };
        }
        return {
            border: 'border-purple-500/20 hover:border-purple-400/40',
            glow: 'hover:shadow-[0_0_25px_rgba(147,51,234,0.15)]',
            bgGradient: 'bg-gradient-to-b from-slate-900/60 via-purple-950/20 to-slate-950',
            badgeBg: 'bg-slate-800/40 text-slate-300 border-slate-700',
            halo: 'bg-purple-500/10',
            icon: Gift,
        };
    };

    return (
        <div className="space-y-6">
            {/* Header with Title and Royal Neon Glow */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 tracking-tight">
                        Virtual Gift Showroom &amp; Economy
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Manage interactive 3D gift cards, SVGA animations, diamond prices, and rarity categories with live preview.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={openCreateModal}
                        className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-lg shadow-pink-600/30 border border-pink-400/30 cursor-pointer"
                    >
                        <Plus className="mr-1.5 h-4 w-4" /> Add Virtual Gift
                    </Button>
                </div>
            </div>

            {/* Stat Cards with Royal Luxury & Neon Glow theme */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-3xl bg-gradient-to-b from-pink-950/30 via-slate-900/60 to-slate-950 border border-pink-500/30 shadow-lg shadow-pink-500/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-all" />
                    <div className="flex items-center justify-between pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-pink-300/80">Total Gifts</span>
                        <Gift className="h-4 w-4 text-pink-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white">{gifts.length}</div>
                    <span className="text-[10px] text-slate-400 font-medium">In catalog</span>
                </div>

                <div className="p-4 rounded-3xl bg-gradient-to-b from-emerald-950/30 via-slate-900/60 to-slate-950 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                    <div className="flex items-center justify-between pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-300/80">Active Live</span>
                        <Sparkles className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400">{activeCount}</div>
                    <span className="text-[10px] text-emerald-400/80 font-medium">Live in mobile app</span>
                </div>

                <div className="p-4 rounded-3xl bg-gradient-to-b from-purple-950/30 via-slate-900/60 to-slate-950 border border-purple-500/30 shadow-lg shadow-purple-500/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
                    <div className="flex items-center justify-between pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-300/80">Inactive / Draft</span>
                        <PackageOpen className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-300">{gifts.length - activeCount}</div>
                    <span className="text-[10px] text-slate-400 font-medium">Hidden from tray</span>
                </div>

                <div className="p-4 rounded-3xl bg-gradient-to-b from-amber-950/30 via-slate-900/60 to-slate-950 border border-amber-500/30 shadow-lg shadow-amber-500/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
                    <div className="flex items-center justify-between pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-300/80">Categories</span>
                        <Crown className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-400">{existingCategories.length}</div>
                    <span className="text-[10px] text-amber-400/80 font-medium">Active trays</span>
                </div>
            </div>

            {/* Category Filter Bar & View Toggle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded-2xl bg-slate-950/60 border border-purple-500/20 backdrop-blur-xl">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Category:</span>
                    {['All', ...existingCategories].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategoryFilter(cat)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border cursor-pointer ${
                                selectedCategoryFilter.toLowerCase() === cat.toLowerCase()
                                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 border-pink-400 text-white shadow-md shadow-pink-600/30 font-black'
                                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* View Switcher: Showroom Cards vs Table */}
                <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shrink-0 self-start md:self-auto">
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            viewMode === 'cards'
                                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/30'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Visual 3D Cards Showroom"
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Showroom Cards</span>
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            viewMode === 'table'
                                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/30'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Dense Table View"
                    >
                        <List className="w-3.5 h-3.5" />
                        <span>Table View</span>
                    </button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search by name, category, rarity..."
                        className="pl-9.5 bg-slate-950 border-purple-500/20 focus:border-pink-500 h-10 text-xs rounded-xl text-slate-200"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <span className="text-xs font-bold text-slate-400">
                    Showing <strong className="text-pink-400">{filtered.length}</strong> gifts
                </span>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="text-center py-20 text-slate-500 flex flex-col items-center justify-center gap-3 bg-slate-950/40 rounded-3xl border border-purple-500/20">
                    <Sparkles className="w-8 h-8 text-pink-400 animate-spin" />
                    <p className="text-sm font-bold text-slate-300">Loading virtual gifts...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-slate-500 bg-slate-950/40 rounded-3xl border border-purple-500/20 p-8">
                    <Gift className="h-12 w-12 mx-auto mb-3 opacity-30 text-pink-400" />
                    <p className="text-base font-bold text-slate-300">No virtual gifts match your criteria.</p>
                    <p className="text-xs text-slate-500 mt-1">Try another category filter or add a new gift.</p>
                    <Button
                        onClick={openCreateModal}
                        className="mt-4 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add New Gift
                    </Button>
                </div>
            ) : viewMode === 'cards' ? (
                /* =========================================================================
                   ROYAL LUXURY & NEON GLOW VISUAL SHOWROOM CARDS
                   ========================================================================= */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4.5">
                    {filtered.map(gift => {
                        const diamondVal = gift.diamond ?? gift.diamonds ?? gift.price ?? gift.cost ?? 0;
                        const iconUrl = gift.icon || (gift as any).image || '';
                        const animUrl = gift.animationUrl || (gift as any).animation || '';
                        const theme = getRarityTheme(gift.rarity);
                        const RarityIcon = theme.icon;

                        return (
                            <div
                                key={gift._id}
                                className={`rounded-3xl p-4 border transition-all duration-300 relative group overflow-hidden flex flex-col justify-between ${theme.border} ${theme.glow} ${theme.bgGradient} backdrop-blur-xl`}
                            >
                                {/* Top Glow Accent Line */}
                                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div>
                                    {/* Top Row: Rarity Badge & Feature Chips */}
                                    <div className="flex items-center justify-between gap-1 mb-2">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${theme.badgeBg}`}>
                                            <RarityIcon className="w-2.5 h-2.5" />
                                            {gift.rarity || 'Common'}
                                        </span>

                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${gift.isActive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-600'}`} />
                                            <Switch
                                                checked={gift.isActive}
                                                onCheckedChange={() => handleToggle(gift)}
                                                className="scale-75 origin-right cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    {/* Floating Feature Tags */}
                                    <div className="flex items-center gap-1 flex-wrap min-h-[18px] mb-2">
                                        {gift.isHot && (
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-rose-500/25 border border-rose-500/50 text-rose-300">
                                                <Flame className="w-2.5 h-2.5" /> HOT
                                            </span>
                                        )}
                                        {gift.isNewItem && (
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-cyan-500/25 border border-cyan-500/50 text-cyan-300">
                                                <Sparkles className="w-2.5 h-2.5" /> NEW
                                            </span>
                                        )}
                                        {gift.isVipOnly && (
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-amber-500/25 border border-amber-500/50 text-amber-300">
                                                <Crown className="w-2.5 h-2.5" /> VIP
                                            </span>
                                        )}
                                        {gift.comboEnabled && (
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-pink-500/20 border border-pink-500/40 text-pink-300">
                                                <Zap className="w-2.5 h-2.5" /> COMBO
                                            </span>
                                        )}
                                    </div>

                                    {/* Centered Pedestal & Media Container */}
                                    <div
                                        onClick={() => setPreviewTarget(gift)}
                                        className="relative w-full aspect-square max-h-36 rounded-2xl bg-slate-950/60 border border-purple-500/20 flex items-center justify-center cursor-pointer overflow-hidden group/media my-1"
                                    >
                                        {/* Glowing Pedestal Circle */}
                                        <div className={`absolute w-24 h-24 rounded-full blur-xl ${theme.halo} group-hover/media:scale-125 transition-transform duration-500`} />

                                        {iconUrl ? (
                                            <img
                                                src={iconUrl}
                                                alt={gift.name}
                                                className="w-24 h-24 object-contain relative z-10 group-hover/media:scale-115 group-hover/media:-translate-y-1 transition-all duration-300 drop-shadow-[0_10px_18px_rgba(0,0,0,0.6)]"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        ) : (
                                            <Gift className="w-16 h-16 text-slate-600 relative z-10" />
                                        )}

                                        {/* Hover Overlay with Preview Icon */}
                                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/media:opacity-100 flex flex-col items-center justify-center transition-all duration-200 z-20 backdrop-blur-[2px]">
                                            <div className="w-10 h-10 rounded-full bg-pink-600/90 text-white flex items-center justify-center shadow-lg shadow-pink-600/40 scale-75 group-hover/media:scale-100 transition-transform">
                                                <Eye className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-extrabold text-pink-200 mt-1">Live Preview</span>
                                        </div>
                                    </div>

                                    {/* Gift Name and Category */}
                                    <div className="mt-2.5 space-y-1">
                                        <h3
                                            className="text-sm font-black text-slate-100 truncate group-hover:text-pink-300 transition-colors"
                                            title={gift.name}
                                        >
                                            {gift.name}
                                        </h3>
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="px-2 py-0.5 rounded-md bg-pink-950/40 text-pink-300 border border-pink-700/30 text-[10px] font-bold">
                                                {gift.category || 'Popular'}
                                            </span>
                                            <span className="text-[10px] text-cyan-400 font-mono uppercase font-bold">
                                                {gift.mediaType || 'image'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-purple-500/15 space-y-2">
                                    {/* 💎 24K Diamond Price Banner */}
                                    <div className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-400/10 to-amber-500/20 border border-amber-500/35 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm">💎</span>
                                            <span className="text-sm font-black text-amber-300">
                                                {Number(diamondVal).toLocaleString()}
                                            </span>
                                        </div>
                                        <span className="text-[9.5px] uppercase font-black text-amber-400/90 tracking-wider">
                                            Diamonds
                                        </span>
                                    </div>

                                    {/* Actions Row */}
                                    <div className="flex items-center gap-1.5 pt-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setPreviewTarget(gift)}
                                            className="flex-1 h-8 text-[11px] font-bold bg-slate-900/80 hover:bg-purple-900/40 text-slate-300 hover:text-white border border-slate-800 rounded-xl cursor-pointer"
                                            title="Preview gift assets"
                                        >
                                            <Eye className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Preview
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => openEditModal(gift)}
                                            className="h-8 px-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl cursor-pointer"
                                            title="Edit gift details"
                                        >
                                            <Pencil className="w-3.5 h-3.5 text-pink-400" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setDeleteTarget(gift)}
                                            className="h-8 px-2.5 bg-slate-900/80 hover:bg-rose-950/50 text-slate-300 hover:text-rose-400 border border-slate-800 rounded-xl cursor-pointer"
                                            title="Delete gift"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* =========================================================================
                   DENSE TABLE VIEW (PRESERVED)
                   ========================================================================= */
                <Card glass className="border-purple-500/20 bg-slate-950/80">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold text-slate-100">Virtual Gifts Table</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-800">
                                    <TableHead>Preview</TableHead>
                                    <TableHead>Name &amp; Badges</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price (Diamonds 💎)</TableHead>
                                    <TableHead>Animation &amp; File</TableHead>
                                    <TableHead>Rarity</TableHead>
                                    <TableHead>Active</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(gift => {
                                    const diamondVal = gift.diamond ?? gift.diamonds ?? gift.price ?? gift.cost ?? 0;
                                    const iconUrl = gift.icon || (gift as any).image || '';
                                    const animUrl = gift.animationUrl || (gift as any).animation || '';

                                    return (
                                        <TableRow key={gift._id} className="border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                                            {/* Preview Icon */}
                                            <TableCell>
                                                <div
                                                    onClick={() => setPreviewTarget(gift)}
                                                    className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center p-1 relative group cursor-pointer overflow-hidden"
                                                    title="Click to preview asset"
                                                >
                                                    {iconUrl ? (
                                                        <img
                                                            src={iconUrl}
                                                            alt={gift.name}
                                                            className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <Gift className="h-5 w-5 text-slate-500" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <Eye className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Name & Badges */}
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <span className="font-bold text-slate-100 text-sm">{gift.name}</span>
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        {gift.isHot && (
                                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black bg-rose-500/20 border border-rose-500/40 text-rose-300">
                                                                <Flame className="w-2.5 h-2.5" /> HOT
                                                            </span>
                                                        )}
                                                        {gift.isNewItem && (
                                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                                                                <Sparkles className="w-2.5 h-2.5" /> NEW
                                                            </span>
                                                        )}
                                                        {gift.isVipOnly && (
                                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 border border-amber-500/40 text-amber-300">
                                                                <Crown className="w-2.5 h-2.5" /> VIP
                                                            </span>
                                                        )}
                                                        {gift.comboEnabled && (
                                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-pink-500/15 border border-pink-500/30 text-pink-300">
                                                                <Zap className="w-2.5 h-2.5" /> COMBO
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Category */}
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-pink-950/40 text-pink-300 border border-pink-800/40 font-semibold text-xs">
                                                    {gift.category || 'Popular'}
                                                </Badge>
                                            </TableCell>

                                            {/* Diamond Price */}
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-black text-amber-300 text-sm">
                                                        💎 {Number(diamondVal).toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400">Diamonds</span>
                                                </div>
                                            </TableCell>

                                            {/* Animation & File */}
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Badge variant="outline" className="text-cyan-400 border-cyan-500/40 uppercase text-[10px] font-bold">
                                                            {gift.mediaType || 'image'}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-slate-300 border-slate-700 uppercase text-[10px] font-semibold">
                                                            {gift.animationType || 'NORMAL'}
                                                        </Badge>
                                                    </div>
                                                    {animUrl ? (
                                                        <a
                                                            href={animUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 truncate max-w-[150px]"
                                                            title={animUrl}
                                                        >
                                                            <FileUp className="w-3 h-3 shrink-0" />
                                                            <span className="truncate">{animUrl.split('/').pop()}</span>
                                                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-500">Static Icon Only</span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Rarity */}
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`uppercase text-[10px] font-extrabold ${
                                                        gift.rarity === 'legendary'
                                                            ? 'text-amber-400 border-amber-500/40 bg-amber-950/20'
                                                            : gift.rarity === 'epic'
                                                            ? 'text-purple-300 border-purple-500/40 bg-purple-950/20'
                                                            : gift.rarity === 'rare'
                                                            ? 'text-sky-300 border-sky-500/40 bg-sky-950/20'
                                                            : 'text-slate-400 border-slate-700 bg-slate-900/40'
                                                    }`}
                                                >
                                                    {gift.rarity || 'common'}
                                                </Badge>
                                            </TableCell>

                                            {/* Active Switch */}
                                            <TableCell>
                                                <Switch
                                                    checked={gift.isActive}
                                                    onCheckedChange={() => handleToggle(gift)}
                                                />
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setPreviewTarget(gift)}
                                                        className="h-8 w-8 p-0 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                                                        title="Preview Gift"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditModal(gift)}
                                                        className="h-8 w-8 p-0 text-slate-400 hover:text-pink-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                                                        title="Edit Gift"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDeleteTarget(gift)}
                                                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                                                        title="Delete Gift"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Reusable Comprehensive Add / Edit Gift Modal */}
            <GiftFormModal
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                gift={editingGift}
                existingCategories={existingCategories}
                onSuccess={fetchGifts}
            />

            {/* Quick Preview Asset Dialog */}
            <Dialog open={!!previewTarget} onOpenChange={open => !open && setPreviewTarget(null)}>
                <DialogContent className="max-w-md bg-slate-950 border border-purple-500/30 text-slate-100 p-6 rounded-3xl shadow-2xl shadow-purple-950/80">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
                            <Sparkles className="w-5 h-5 text-pink-400" />
                            {previewTarget?.name} Preview
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-400">
                            Category: <span className="text-pink-300 font-bold">{previewTarget?.category}</span> | Price: <span className="text-amber-300 font-bold">💎 {Number(previewTarget?.diamond ?? previewTarget?.diamonds ?? previewTarget?.price ?? previewTarget?.cost ?? 0).toLocaleString()}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                        {/* Icon Preview on Glowing Pedestal */}
                        <div className="flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-2xl border border-purple-500/20 relative overflow-hidden">
                            <div className="absolute w-28 h-28 rounded-full bg-pink-500/15 blur-2xl" />
                            {previewTarget?.icon || (previewTarget as any)?.image ? (
                                <img
                                    src={previewTarget?.icon || (previewTarget as any)?.image}
                                    alt={previewTarget?.name}
                                    className="w-28 h-28 object-contain relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                                />
                            ) : (
                                <Gift className="w-20 h-20 text-slate-600 relative z-10" />
                            )}
                            <p className="text-sm font-black text-white mt-3 relative z-10">{previewTarget?.name}</p>
                            <p className="text-xs font-mono text-amber-300 font-bold relative z-10">💎 {Number(previewTarget?.diamond ?? previewTarget?.diamonds ?? previewTarget?.price ?? previewTarget?.cost ?? 0).toLocaleString()} Diamonds</p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800">
                                <span className="text-slate-500 text-[10px] uppercase font-bold block">Animation Type</span>
                                <span className="font-bold text-slate-200">{previewTarget?.animationType || 'NORMAL'}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800">
                                <span className="text-slate-500 text-[10px] uppercase font-bold block">Format</span>
                                <span className="font-bold text-cyan-400 uppercase">{previewTarget?.mediaType || 'image'}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800">
                                <span className="text-slate-500 text-[10px] uppercase font-bold block">Rarity</span>
                                <span className="font-bold text-purple-300 uppercase">{previewTarget?.rarity || 'common'}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800">
                                <span className="text-slate-500 text-[10px] uppercase font-bold block">Duration</span>
                                <span className="font-bold text-slate-200">{previewTarget?.duration || 2500} ms</span>
                            </div>
                        </div>

                        {/* Animation Asset File Link */}
                        {previewTarget?.animationUrl && (
                            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 space-y-1">
                                <span className="text-[10px] font-bold text-cyan-300 uppercase block">Animation Asset URL (.svga / .gif)</span>
                                <a
                                    href={previewTarget.animationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1.5 break-all font-mono"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                    {previewTarget.animationUrl}
                                </a>
                            </div>
                        )}

                        {/* Sound Effect Link */}
                        {previewTarget?.sound && (
                            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-1">
                                <span className="text-[10px] font-bold text-amber-300 uppercase flex items-center gap-1">
                                    <Volume2 className="w-3 h-3" /> Sound Effect
                                </span>
                                <audio controls className="w-full h-8 mt-1">
                                    <source src={previewTarget.sound} />
                                </audio>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1 border-slate-700 cursor-pointer"
                            onClick={() => setPreviewTarget(null)}
                        >
                            Close
                        </Button>
                        <Button
                            className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold cursor-pointer"
                            onClick={() => {
                                const target = previewTarget;
                                setPreviewTarget(null);
                                if (target) openEditModal(target);
                            }}
                        >
                            Edit Gift
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm bg-slate-950 border border-slate-800 text-slate-100">
                    <DialogHeader>
                        <DialogTitle className="text-rose-400 font-bold">Delete Virtual Gift</DialogTitle>
                        <DialogDescription className="text-xs text-slate-400">
                            Are you sure you want to delete <strong>&quot;{deleteTarget?.name}&quot;</strong>?
                            This action cannot be undone and will remove the gift from all live room pickers.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 pt-3">
                        <Button variant="outline" className="flex-1 border-slate-700 cursor-pointer" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" className="flex-1 cursor-pointer" onClick={handleDelete}>
                            Delete Gift
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

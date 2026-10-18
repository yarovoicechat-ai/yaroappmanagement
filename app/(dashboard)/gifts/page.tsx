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
    Sparkles, Gem, Flame, Crown, Zap, Clock, Eye, ExternalLink, Volume2, FileUp
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
            await apiClient.patch(API_ENDPOINTS.GIFTS.TOGGLE(gift._id), {
                isActive: !gift.isActive,
            });
            toast.success(`Gift ${!gift.isActive ? 'enabled' : 'disabled'}`);
            fetchGifts();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update gift status');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget || !deleteTarget._id) return;
        try {
            await apiClient.delete(API_ENDPOINTS.GIFTS.DELETE(deleteTarget._id));
            toast.success('Gift deleted successfully');
            setDeleteTarget(null);
            fetchGifts();
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete gift');
        }
    };

    const filtered = gifts.filter(g => {
        const matchesSearch =
            g.name.toLowerCase().includes(search.toLowerCase()) ||
            g.category?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory =
            selectedCategoryFilter === 'All' ||
            (g.category || 'Popular').toLowerCase() === selectedCategoryFilter.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    const activeCount = gifts.filter(g => g.isActive).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300 bg-clip-text text-transparent flex items-center gap-2.5">
                        <Gift className="w-8 h-8 text-pink-400" />
                        Virtual Gifts Management (💎)
                    </h2>
                    <p className="text-slate-400 mt-1 text-sm">
                        Create custom gift categories, upload SVGA/GIF assets, set Diamond prices (💎), and publish gifts directly to live room streams.
                    </p>
                </div>
                <Button
                    onClick={openCreateModal}
                    className="bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 text-white font-extrabold shadow-lg shadow-pink-600/25 border-none h-11 px-5 rounded-2xl shrink-0 cursor-pointer"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add New Gift (💎)
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Card glass className="bg-slate-900/40 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Gifts</CardTitle>
                        <Gift className="h-4 w-4 text-pink-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-100">{gifts.length}</div>
                    </CardContent>
                </Card>

                <Card glass className="bg-slate-900/40 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Live</CardTitle>
                        <Sparkles className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-emerald-400">{activeCount}</div>
                    </CardContent>
                </Card>

                <Card glass className="bg-slate-900/40 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Inactive</CardTitle>
                        <PackageOpen className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-400">{gifts.length - activeCount}</div>
                    </CardContent>
                </Card>

                <Card glass className="bg-slate-900/40 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Categories</CardTitle>
                        <Sparkles className="h-4 w-4 text-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-amber-400">{existingCategories.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Category Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs font-bold text-slate-400 mr-1 uppercase tracking-wider shrink-0">Category Filter:</span>
                {['All', ...existingCategories].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border cursor-pointer ${
                            selectedCategoryFilter.toLowerCase() === cat.toLowerCase()
                                ? 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-600/30 font-extrabold'
                                : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Main Table */}
            <Card glass className="border-slate-800">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <CardTitle className="text-lg font-bold text-slate-100">All Virtual Gifts ({filtered.length})</CardTitle>
                        <div className="flex items-center gap-3">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search by name, category..."
                                    className="pl-9 bg-slate-900 border-slate-700 h-9 text-xs"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={openCreateModal}
                                className="bg-pink-600 hover:bg-pink-500 text-white border-none font-bold text-xs h-9 px-3 rounded-xl shadow cursor-pointer shrink-0"
                            >
                                <Plus className="mr-1 h-3.5 w-3.5" /> Add Gift
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12 text-slate-500 flex flex-col items-center justify-center gap-2">
                            <Sparkles className="w-6 h-6 text-pink-400 animate-spin" />
                            <p className="text-xs font-bold">Loading virtual gifts...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-800">
                                    <TableHead>Preview</TableHead>
                                    <TableHead>Name & Badges</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price (Diamonds 💎)</TableHead>
                                    <TableHead>Animation & File</TableHead>
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
                                                    className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden cursor-pointer hover:border-pink-500/50 transition-all group relative"
                                                    title="Click to preview assets"
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
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                                                        onClick={() => setPreviewTarget(gift)}
                                                        title="Quick Preview"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 border-slate-700 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40 cursor-pointer"
                                                        onClick={() => openEditModal(gift)}
                                                        title="Edit Gift"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 cursor-pointer"
                                                        onClick={() => setDeleteTarget(gift)}
                                                        title="Delete Gift"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                                            <Gift className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                            No virtual gifts found. Click &quot;Add New Gift (💎)&quot; to publish your first gift!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

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
                <DialogContent className="max-w-md bg-slate-950 border border-slate-800 text-slate-100 p-6 rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-black text-pink-400">
                            <Sparkles className="w-5 h-5 text-pink-400" />
                            {previewTarget?.name} Preview
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-400">
                            Category: <span className="text-pink-300 font-bold">{previewTarget?.category}</span> | Price: <span className="text-amber-300 font-bold">💎 {Number(previewTarget?.diamond ?? previewTarget?.diamonds ?? previewTarget?.price ?? previewTarget?.cost ?? 0).toLocaleString()}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                        {/* Icon Preview */}
                        <div className="flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-2xl border border-slate-800">
                            {previewTarget?.icon || (previewTarget as any)?.image ? (
                                <img
                                    src={previewTarget?.icon || (previewTarget as any)?.image}
                                    alt={previewTarget?.name}
                                    className="w-24 h-24 object-contain"
                                />
                            ) : (
                                <Gift className="w-20 h-20 text-slate-600" />
                            )}
                            <p className="text-xs font-bold text-slate-300 mt-2">{previewTarget?.name}</p>
                            <p className="text-[11px] font-mono text-amber-300">💎 {Number(previewTarget?.diamond ?? previewTarget?.diamonds ?? previewTarget?.price ?? previewTarget?.cost ?? 0).toLocaleString()} Diamonds</p>
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
                            className="flex-1 bg-pink-600 hover:bg-pink-500 text-white font-bold cursor-pointer"
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

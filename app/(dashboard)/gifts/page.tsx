'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from '@/components/ui/Table';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from '@/components/ui/Dialog';
import { Gift, Plus, Trash2, Search, PackageOpen } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

interface GiftItem {
    _id: string;
    name: string;
    icon: string;
    animationUrl?: string;
    mediaType?: 'image' | 'gif' | 'webp' | 'svg' | 'svga';
    cost: number;
    category: string;
    isActive: boolean;
    createdAt: string;
}

const EMPTY_FORM = {
    name: '',
    icon: '',
    animationUrl: '',
    mediaType: 'image' as GiftItem['mediaType'],
    cost: 0,
    category: 'Standard',
};

export default function GiftsPage() {
    const [gifts, setGifts] = useState<GiftItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<GiftItem | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchGifts(); }, []);

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

    const handleAddGift = async () => {
        if (!form.name || !form.icon || !form.cost) {
            toast.error('Name, Icon URL and Cost are required');
            return;
        }
        try {
            setSaving(true);
            const res = await apiClient.post(API_ENDPOINTS.GIFTS.CREATE, form);
            if (res.success) {
                toast.success('Gift added successfully');
                setShowAddDialog(false);
                setForm(EMPTY_FORM);
                fetchGifts();
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to add gift');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (gift: GiftItem) => {
        try {
            await apiClient.patch(API_ENDPOINTS.GIFTS.TOGGLE(gift._id), {
                isActive: !gift.isActive,
            });
            toast.success(`Gift ${!gift.isActive ? 'enabled' : 'disabled'}`);
            fetchGifts();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update gift');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await apiClient.delete(API_ENDPOINTS.GIFTS.DELETE(deleteTarget._id));
            toast.success('Gift deleted');
            setDeleteTarget(null);
            fetchGifts();
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete gift');
        }
    };

    const filtered = gifts.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.category?.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = gifts.filter(g => g.isActive).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-300 to-purple-400 bg-clip-text text-transparent">
                    Gift Management
                </h2>
                <p className="text-slate-400 mt-1">Add, manage and toggle gifts shown in the live call screen.</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card glass className="bg-slate-900/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Gifts</CardTitle>
                        <Gift className="h-4 w-4 text-pink-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-100">{gifts.length}</div>
                    </CardContent>
                </Card>
                <Card glass className="bg-slate-900/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-400">Active</CardTitle>
                        <Gift className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-400">{activeCount}</div>
                    </CardContent>
                </Card>
                <Card glass className="bg-slate-900/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-400">Inactive</CardTitle>
                        <PackageOpen className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-400">{gifts.length - activeCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card glass>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Gifts</CardTitle>
                        <div className="flex items-center gap-3">
                            <div className="relative w-56">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search gifts..."
                                    className="pl-8 bg-slate-800/50 border-slate-700/50"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <Button onClick={() => { setForm(EMPTY_FORM); setShowAddDialog(true); }}
                                className="bg-pink-600 hover:bg-pink-500 text-white border-none">
                                <Plus className="mr-2 h-4 w-4" /> Add Gift
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-10 text-slate-500">Loading gifts...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-700/50">
                                    <TableHead>Preview</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Cost (Coins)</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Active</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(gift => (
                                    <TableRow key={gift._id} className="border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                        <TableCell>
                                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                                                {gift.icon ? (
                                                    <img
                                                        src={gift.icon}
                                                        alt={gift.name}
                                                        className="w-10 h-10 object-contain"
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <Gift className="h-5 w-5 text-slate-500" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold text-slate-100">{gift.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-slate-700/50 text-slate-300">
                                                {gift.category || 'Standard'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-bold text-yellow-400">🪙 {gift.cost}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={gift.isActive ? 'success' : 'destructive'}>
                                                {gift.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={gift.isActive}
                                                onCheckedChange={() => handleToggle(gift)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => setDeleteTarget(gift)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                                            <Gift className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                            No gifts found. Add your first gift!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Add Gift Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Gift</DialogTitle>
                        <DialogDescription>
                            Add a gift that users can send during live calls.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Gift Name</Label>
                            <Input placeholder="e.g. Rose, Diamond Ring..."
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Icon URL <span className="text-slate-500 text-xs">(image or SVG URL)</span></Label>
                            <Input placeholder="https://..."
                                value={form.icon}
                                onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
                            {form.icon && (
                                <div className="mt-2 p-3 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-3">
                                    <img src={form.icon} alt="preview" className="w-12 h-12 object-contain"
                                        onError={e => { (e.target as HTMLImageElement).src = ''; }} />
                                    <span className="text-xs text-slate-400">Preview</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Gift Media Type</Label>
                            <select
                                value={form.mediaType}
                                onChange={e => setForm(f => ({
                                    ...f,
                                    mediaType: e.target.value as GiftItem['mediaType'],
                                }))}
                                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                            >
                                <option value="image">Static Image</option>
                                <option value="gif">Animated GIF</option>
                                <option value="webp">Animated WebP</option>
                                <option value="svg">SVG</option>
                                <option value="svga">SVGA Animation</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>
                                Animation URL <span className="text-slate-500 text-xs">(GIF, WebP or .svga)</span>
                            </Label>
                            <Input
                                placeholder="https://.../gift.svga"
                                value={form.animationUrl}
                                onChange={e => setForm(f => ({ ...f, animationUrl: e.target.value }))}
                            />
                            <p className="text-xs text-slate-500">
                                Optional for images. For animated gifts, this media plays full-screen during the call.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Cost (in Coins)</Label>
                            <Input type="number" min={1} placeholder="e.g. 50"
                                value={form.cost || ''}
                                onChange={e => setForm(f => ({ ...f, cost: parseInt(e.target.value) || 0 }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Category</Label>
                            <Input placeholder="Standard, Premium, Special..."
                                value={form.category}
                                onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1" onClick={() => setShowAddDialog(false)}>
                                Cancel
                            </Button>
                            <Button className="flex-1 bg-pink-600 hover:bg-pink-500 text-white border-none"
                                onClick={handleAddGift} disabled={saving}>
                                {saving ? 'Adding...' : 'Add Gift'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Gift</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>&quot;{deleteTarget?.name}&quot;</strong>?
                            This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

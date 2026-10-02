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
import { Layers, Plus, Trash2, Edit2, Coins, Phone, Clock, UploadCloud } from "lucide-react";
import { toast } from 'sonner';
import { apiClient as api } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

interface LevelReward {
    type: 'frame' | 'entry';
    name: string;
    imageUrl: string;
    animationUrl: string;
    durationDays: number;
}

interface LevelData {
    _id: string;
    level: number;
    name: string;
    minCalls: number;
    minMinutes: number;
    coinPerMinute: number;
    rewards?: LevelReward[];
}

export default function LevelsPage() {
    const [levels, setLevels] = useState<LevelData[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [level, setLevel] = useState('');
    const [name, setName] = useState('');
    const [minCalls, setMinCalls] = useState('0');
    const [minMinutes, setMinMinutes] = useState('0');
    const [coinPerMinute, setCoinPerMinute] = useState('1');
    const [rewards, setRewards] = useState<LevelReward[]>([]);
    const [uploadingReward, setUploadingReward] = useState<number | null>(null);

    const updateReward = (index: number, patch: Partial<LevelReward>) =>
        setRewards(current => current.map((reward, position) => position === index ? { ...reward, ...patch } : reward));

    const addReward = (type: LevelReward['type']) =>
        setRewards(current => [...current, { type, name: '', imageUrl: '', animationUrl: '', durationDays: 30 }]);

    const uploadReward = async (index: number, file?: File) => {
        if (!file) return;
        if (!/\.(svga|png|jpe?g|gif|webp)$/i.test(file.name)) {
            toast.error('Please select an image, GIF, WebP, or SVGA file');
            return;
        }
        try {
            setUploadingReward(index);
            const body = new FormData();
            body.append('file', file);
            const response = await api.uploadFile<{ url: string }>('/api/upload/file', body);
            const url = response.data?.url;
            if (!url) throw new Error('Upload URL missing');
            updateReward(index, /\.svga$/i.test(file.name) ? { animationUrl: url } : { imageUrl: url });
            toast.success('Reward asset uploaded');
        } catch (error: any) {
            toast.error(error.message || 'Upload failed');
        } finally {
            setUploadingReward(null);
        }
    };

    useEffect(() => {
        fetchLevels();
    }, []);

    const fetchLevels = async () => {
        try {
            setLoading(true);
            const res = await api.get(API_ENDPOINTS.LEVELS_MGMT.LIST);
            if (res.success) {
                setLevels(res.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch levels:', error);
            toast.error('Failed to load levels');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!level || !name || !coinPerMinute) return;

        const payload = {
            level: Number(level),
            name,
            minCalls: Number(minCalls),
            minMinutes: Number(minMinutes),
            coinPerMinute: Number(coinPerMinute),
            rewards: rewards.filter(reward => reward.name.trim()).map(reward => ({ ...reward, name: reward.name.trim() })),
        };

        try {
            if (editingId) {
                const res = await api.patch(API_ENDPOINTS.LEVELS_MGMT.UPDATE(editingId), payload);
                if (res.success) {
                    toast.success('Level updated successfully');
                    setLevels(prev => prev.map(l => l._id === editingId ? res.data : l));
                    resetForm();
                } else {
                    // BUG-10 FIX: show error when API returns success:false
                    toast.error(res.message || 'Failed to update level');
                }
            } else {
                const res = await api.post(API_ENDPOINTS.LEVELS_MGMT.CREATE, payload);
                if (res.success) {
                    toast.success('Level created successfully');
                    setLevels(prev => [...prev, res.data].sort((a, b) => a.level - b.level));
                    resetForm();
                } else {
                    // BUG-10 FIX: show error when API returns success:false
                    toast.error(res.message || 'Failed to create level');
                }
            }
        } catch (error: any) {
            console.error('Save failed:', error);
            toast.error(error.message || 'Failed to save level');
        }
    };

    const handleEdit = (item: LevelData) => {
        setEditingId(item._id);
        setLevel(String(item.level));
        setName(item.name);
        setMinCalls(String(item.minCalls));
        setMinMinutes(String(item.minMinutes));
        setCoinPerMinute(String(item.coinPerMinute));
        setRewards((item.rewards || []).map(reward => ({ ...reward })));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this level?')) return;
        try {
            const res = await api.delete(API_ENDPOINTS.LEVELS_MGMT.DELETE(id));
            if (res.success) {
                toast.success('Level deleted');
                setLevels(prev => prev.filter(l => l._id !== id));
            } else {
                // BUG-10 FIX: show error when API returns success:false
                toast.error(res.message || 'Failed to delete level');
            }
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete level');
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setLevel('');
        setName('');
        setMinCalls('0');
        setMinMinutes('0');
        setCoinPerMinute('1');
        setRewards([]);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Level Management</h2>
                    <p className="text-muted-foreground mt-1 font-medium font-sans">Configure host levels, requirements, and commission rates</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Create/Edit Form */}
                <Card className="glass-card md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            {editingId ? <Edit2 size={20} className="text-amber-500" /> : <Plus size={20} className="text-primary" />}
                            {editingId ? 'Edit Level' : 'Add New Level'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Level Number</label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 1"
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    required
                                    disabled={!!editingId} // Cannot change level number once created
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Level Name</label>
                                <Input
                                    placeholder="e.g. Bronze, Silver, Gold"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Required Total Calls</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={minCalls}
                                    onChange={(e) => setMinCalls(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Required Total Minutes</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={minMinutes}
                                    onChange={(e) => setMinMinutes(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Commission Rate (Coins/Min)</label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 5"
                                    value={coinPerMinute}
                                    onChange={(e) => setCoinPerMinute(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-3 rounded-xl border border-violet-500/25 bg-violet-500/5 p-3">
                                <p className="text-sm font-bold text-violet-200">Level rewards (optional)</p>
                                <p className="text-xs text-slate-400">Add a frame, entry, or both. Duration 0 means permanent.</p>
                                <div className="flex gap-2">
                                    <Button type="button" size="sm" variant="outline" onClick={() => addReward('frame')}>+ Frame</Button>
                                    <Button type="button" size="sm" variant="outline" onClick={() => addReward('entry')}>+ Entry</Button>
                                </div>
                                {rewards.map((reward, index) => (
                                    <div key={`${index}-${reward.type}`} className="space-y-2 rounded-lg border border-slate-700 bg-slate-900/70 p-3">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="capitalize">{reward.type}</Badge>
                                            <Button type="button" size="sm" variant="ghost" className="text-red-400" onClick={() => setRewards(current => current.filter((_, position) => position !== index))}>
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                        <Input value={reward.name} onChange={event => updateReward(index, { name: event.target.value })} placeholder={`${reward.type} name`} required />
                                        <label className="block text-xs text-slate-400">Duration in days</label>
                                        <Input type="number" min="0" value={reward.durationDays} onChange={event => updateReward(index, { durationDays: Number(event.target.value) })} />
                                        <label className="block text-xs text-slate-400">Preview image</label>
                                        <Input value={reward.imageUrl} onChange={event => updateReward(index, { imageUrl: event.target.value })} placeholder="Image URL" />
                                        <label className="block text-xs text-slate-400">Animation / SVGA file</label>
                                        <Input value={reward.animationUrl} onChange={event => updateReward(index, { animationUrl: event.target.value })} placeholder="Animation URL" />
                                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-violet-500/40 p-2 text-xs text-violet-200">
                                            <UploadCloud size={15} /> {uploadingReward === index ? 'Uploading...' : 'Upload image / SVGA'}
                                            <input type="file" accept=".svga,image/png,image/jpeg,image/gif,image/webp" className="hidden" disabled={uploadingReward !== null} onChange={event => uploadReward(index, event.target.files?.[0])} />
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1 font-bold">
                                    {editingId ? 'Update Level' : 'Save Level'}
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

                {/* Levels list */}
                <Card className="glass-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Layers size={20} className="text-primary" />
                            Configured Levels
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold text-slate-300">Level</TableHead>
                                    <TableHead className="font-bold text-slate-300">Name</TableHead>
                                    <TableHead className="font-bold text-slate-300">Requirements</TableHead>
                                    <TableHead className="font-bold text-slate-300">Commission</TableHead>
                                    <TableHead className="font-bold text-slate-300">Rewards</TableHead>
                                    <TableHead className="text-right font-bold text-slate-300">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">Loading levels...</TableCell>
                                    </TableRow>
                                ) : levels.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No levels configured yet.</TableCell>
                                    </TableRow>
                                ) : (
                                    levels.map((item) => (
                                        <TableRow key={item._id} className="hover:bg-muted/30">
                                            <TableCell className="font-bold text-slate-200">
                                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                                    Level {item.level}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-bold text-slate-200">{item.name}</TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1 text-xs text-slate-300">
                                                        <Phone size={12} className="text-slate-400" />
                                                        <span>{item.minCalls.toLocaleString()} Calls</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-slate-300">
                                                        <Clock size={12} className="text-slate-400" />
                                                        <span>{item.minMinutes.toLocaleString()} Mins</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-bold text-yellow-500">
                                                <div className="flex items-center gap-1">
                                                    <Coins size={14} />
                                                    <span>{item.coinPerMinute} / min</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex min-w-[140px] flex-wrap gap-1">
                                                    {(item.rewards || []).length ? item.rewards?.map((reward, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs capitalize">
                                                            {reward.type}: {reward.name} ({reward.durationDays === 0 ? 'Permanent' : `${reward.durationDays}d`})
                                                        </Badge>
                                                    )) : <span className="text-xs text-slate-500">None</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        <Edit2 size={14} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDelete(item._id)}
                                                    >
                                                        <Trash2 size={14} />
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
        </div>
    );
}

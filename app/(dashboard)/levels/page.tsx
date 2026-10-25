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
    type: 'frame' | 'entry' | 'badge' | 'tag' | 'vehicle' | 'micWave' | 'theme';
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
    image?: string;
    badgeIcon?: string;
    badgeAnimation?: string;
    levelTag?: string;
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
    const [badgeIcon, setBadgeIcon] = useState('');
    const [badgeAnimation, setBadgeAnimation] = useState('');
    const [levelTag, setLevelTag] = useState('');
    const [uploadingBadgeIcon, setUploadingBadgeIcon] = useState(false);
    const [uploadingBadgeAnimation, setUploadingBadgeAnimation] = useState(false);
    const [rewards, setRewards] = useState<LevelReward[]>([]);
    const [uploadingReward, setUploadingReward] = useState<number | null>(null);

    const updateReward = (index: number, patch: Partial<LevelReward>) =>
        setRewards(current => current.map((reward, position) => position === index ? { ...reward, ...patch } : reward));

    const addReward = (type: LevelReward['type']) =>
        setRewards(current => [...current, { type, name: '', imageUrl: '', animationUrl: '', durationDays: 30 }]);

    const uploadBadgeAsset = async (type: 'badgeIcon' | 'badgeAnimation', file?: File) => {
        if (!file) return;
        try {
            if (type === 'badgeIcon') setUploadingBadgeIcon(true);
            else setUploadingBadgeAnimation(true);
            const body = new FormData();
            body.append('file', file);
            const response = await api.uploadFile<{ url: string }>('/api/upload/file', body);
            const url = response.data?.url;
            if (!url) throw new Error('Upload URL missing');
            if (type === 'badgeIcon') setBadgeIcon(url);
            else setBadgeAnimation(url);
            toast.success(`${type === 'badgeIcon' ? 'Badge icon' : 'Badge animation'} uploaded`);
        } catch (error: any) {
            toast.error(error.message || 'Upload failed');
        } finally {
            if (type === 'badgeIcon') setUploadingBadgeIcon(false);
            else setUploadingBadgeAnimation(false);
        }
    };

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
            badgeIcon: badgeIcon.trim(),
            badgeAnimation: badgeAnimation.trim(),
            levelTag: levelTag.trim(),
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
                    toast.error(res.message || 'Failed to update level');
                }
            } else {
                const res = await api.post(API_ENDPOINTS.LEVELS_MGMT.CREATE, payload);
                if (res.success) {
                    toast.success('Level created successfully');
                    setLevels(prev => [...prev, res.data].sort((a, b) => a.level - b.level));
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

    const handleEdit = (item: LevelData) => {
        setEditingId(item._id);
        setLevel(String(item.level));
        setName(item.name);
        setMinCalls(String(item.minCalls));
        setMinMinutes(String(item.minMinutes));
        setCoinPerMinute(String(item.coinPerMinute));
        setBadgeIcon(item.badgeIcon || '');
        setBadgeAnimation(item.badgeAnimation || '');
        setLevelTag(item.levelTag || '');
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
        setBadgeIcon('');
        setBadgeAnimation('');
        setLevelTag('');
        setRewards([]);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Level Management</h2>
                    <p className="text-muted-foreground mt-1 font-medium font-sans">Configure host levels, badge assets, animation SVGA, requirements, and reward perks</p>
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
                                    disabled={!!editingId}
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
                                <label className="text-sm font-semibold text-slate-300">Level Tag / Title</label>
                                <Input
                                    placeholder="e.g. 🌟 Star Host, 👑 Super Idol"
                                    value={levelTag}
                                    onChange={(e) => setLevelTag(e.target.value)}
                                />
                            </div>

                            {/* Level Badge Assets */}
                            <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                                <p className="text-sm font-bold text-amber-200">Level Badge Assets</p>
                                <p className="text-xs text-slate-400">Upload static badge icon (PNG/WebP) and optional animated badge (.svga / .gif).</p>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-300 font-semibold">Badge Icon URL / Upload</label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={badgeIcon}
                                            onChange={(e) => setBadgeIcon(e.target.value)}
                                            placeholder="https://... or upload below"
                                            className="text-xs"
                                        />
                                        {badgeIcon && (
                                            <div className="w-9 h-9 rounded-lg border border-slate-700 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                                                <img src={badgeIcon} alt="Badge" className="w-full h-full object-contain" />
                                            </div>
                                        )}
                                    </div>
                                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-amber-500/40 p-2 text-xs text-amber-200 hover:bg-amber-500/10">
                                        <UploadCloud size={15} /> {uploadingBadgeIcon ? 'Uploading...' : 'Upload Badge Icon (PNG/JPG/WebP)'}
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/gif,image/webp"
                                            className="hidden"
                                            disabled={uploadingBadgeIcon}
                                            onChange={(e) => uploadBadgeAsset('badgeIcon', e.target.files?.[0])}
                                        />
                                    </label>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-300 font-semibold">Badge Animation / SVGA</label>
                                    <Input
                                        value={badgeAnimation}
                                        onChange={(e) => setBadgeAnimation(e.target.value)}
                                        placeholder="SVGA / Animation URL"
                                        className="text-xs"
                                    />
                                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-amber-500/40 p-2 text-xs text-amber-200 hover:bg-amber-500/10">
                                        <UploadCloud size={15} /> {uploadingBadgeAnimation ? 'Uploading...' : 'Upload Badge SVGA (.svga, .gif)'}
                                        <input
                                            type="file"
                                            accept=".svga,image/gif,image/webp"
                                            className="hidden"
                                            disabled={uploadingBadgeAnimation}
                                            onChange={(e) => uploadBadgeAsset('badgeAnimation', e.target.files?.[0])}
                                        />
                                    </label>
                                </div>
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

                            {/* Rewards Section with multi-type buttons */}
                            <div className="space-y-3 rounded-xl border border-violet-500/25 bg-violet-500/5 p-3">
                                <p className="text-sm font-bold text-violet-200">Level Rewards & Perks</p>
                                <p className="text-xs text-slate-400">Duration 0 means permanent. Add frames, entry effects, badges, tags, or vehicles.</p>
                                <div className="flex flex-wrap gap-1.5">
                                    <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => addReward('frame')}>+ Frame</Button>
                                    <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => addReward('entry')}>+ Entry</Button>
                                    <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => addReward('badge')}>+ Badge</Button>
                                    <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => addReward('tag')}>+ Tag</Button>
                                    <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => addReward('vehicle')}>+ Vehicle</Button>
                                    <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => addReward('micWave')}>+ Mic Wave</Button>
                                    <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => addReward('theme')}>+ Theme</Button>
                                </div>
                                {rewards.map((reward, index) => (
                                    <div key={`${index}-${reward.type}`} className="space-y-2 rounded-lg border border-slate-700 bg-slate-900/70 p-3">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="capitalize text-violet-300 border-violet-500/30">{reward.type}</Badge>
                                            <Button type="button" size="sm" variant="ghost" className="text-red-400 hover:text-red-300 h-6 px-1.5" onClick={() => setRewards(current => current.filter((_, position) => position !== index))}>
                                                <Trash2 size={13} />
                                            </Button>
                                        </div>
                                        <Input value={reward.name} onChange={event => updateReward(index, { name: event.target.value })} placeholder={`${reward.type} name`} required className="text-xs" />
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400 shrink-0">Duration:</span>
                                            <Input type="number" min="0" value={reward.durationDays} onChange={event => updateReward(index, { durationDays: Number(event.target.value) })} className="text-xs h-7" placeholder="Days (0 = Perm)" />
                                            <span className="text-xs text-slate-400 shrink-0">days</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input value={reward.imageUrl} onChange={event => updateReward(index, { imageUrl: event.target.value })} placeholder="Preview Image URL" className="text-xs h-7" />
                                            {reward.imageUrl && (
                                                <div className="w-7 h-7 rounded border border-slate-700 bg-slate-950 overflow-hidden shrink-0">
                                                    <img src={reward.imageUrl} alt="" className="w-full h-full object-contain" />
                                                </div>
                                            )}
                                        </div>
                                        <Input value={reward.animationUrl} onChange={event => updateReward(index, { animationUrl: event.target.value })} placeholder="SVGA / Animation URL" className="text-xs h-7" />
                                        <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-violet-500/40 p-1.5 text-xs text-violet-200 hover:bg-violet-500/10">
                                            <UploadCloud size={13} /> {uploadingReward === index ? 'Uploading...' : 'Upload Image / SVGA'}
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
                                    <TableHead className="font-bold text-slate-300">Level & Badge</TableHead>
                                    <TableHead className="font-bold text-slate-300">Name / Tag</TableHead>
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
                                                <div className="flex items-center gap-2">
                                                    {item.badgeIcon ? (
                                                        <div className="w-8 h-8 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-center justify-center overflow-hidden shrink-0">
                                                            <img src={item.badgeIcon} alt={`Lv.${item.level}`} className="w-full h-full object-contain" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-800 flex items-center justify-center shrink-0 text-xs text-slate-400">
                                                            Lv.{item.level}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                                                            Level {item.level}
                                                        </Badge>
                                                        {item.badgeAnimation && (
                                                            <span className="block text-[10px] text-amber-400 font-normal">✨ SVGA</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-bold text-slate-200">
                                                <div>{item.name}</div>
                                                {item.levelTag && (
                                                    <span className="text-xs font-normal text-amber-300/80">{item.levelTag}</span>
                                                )}
                                            </TableCell>
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
                                                        <Badge key={index} variant="outline" className="text-[11px] capitalize border-slate-700 bg-slate-900/60">
                                                            {reward.type}: {reward.name} ({reward.durationDays === 0 ? 'Perm' : `${reward.durationDays}d`})
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

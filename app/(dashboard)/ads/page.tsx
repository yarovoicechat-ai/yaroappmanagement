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
import { Plus, Trash2, ToggleLeft, ToggleRight, BarChart, Sliders } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function AdsPage() {
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [title, setTitle] = useState('');
    const [type, setType] = useState('banner');
    const [provider, setProvider] = useState('admob');
    const [adUnitId, setAdUnitId] = useState('');
    const [priority, setPriority] = useState('0');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/admin/ads');
            if (response.success && response.data) {
                setAds(response.data || []);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch ads configurations');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !adUnitId) {
            toast.error('Title and Ad Unit ID are required');
            return;
        }

        try {
            setSubmitting(true);
            const response = await apiClient.post('/api/admin/ads', {
                title,
                type,
                provider,
                adUnitId,
                priority
            });

            if (response.success) {
                toast.success('Ad Slot configured successfully');
                setTitle('');
                setAdUnitId('');
                setPriority('0');
                fetchAds();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create ad slot config');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (ad: any) => {
        try {
            const response = await apiClient.patch(`/api/admin/ads/${ad._id}`, {
                isActive: !ad.isActive
            });
            if (response.success) {
                toast.success(`Ad placement successfully ${!ad.isActive ? 'activated' : 'deactivated'}`);
                fetchAds();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update ad state');
        }
    };

    const handleDeleteAd = async (adId: string) => {
        if (!confirm('Are you sure you want to delete this ad placement?')) return;
        try {
            const response = await apiClient.delete(`/api/admin/ads/${adId}`);
            if (response.success) {
                toast.success('Ad configuration deleted successfully');
                fetchAds();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete ad config');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Ad Placements</h2>
                <p className="text-muted-foreground mt-1 font-medium">Configure network advertisement slots and SDK unit IDs</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Create Form */}
                <Card className="glass-card md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Plus size={20} />
                            Add Ad Slot
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateAd} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Slot Title</label>
                                <Input
                                    placeholder="e.g. Home Page Bottom Banner"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Format</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    >
                                        <option value="banner">Banner</option>
                                        <option value="native">Native</option>
                                        <option value="interstitial">Interstitial</option>
                                        <option value="rewarded">Rewarded Video</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Provider</label>
                                    <select
                                        value={provider}
                                        onChange={(e) => setProvider(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    >
                                        <option value="admob">Google AdMob</option>
                                        <option value="facebook">Meta Audience</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">SDK Ad Unit ID</label>
                                <Input
                                    placeholder="ca-app-pub-3940256099942544/6300978111"
                                    value={adUnitId}
                                    onChange={(e) => setAdUnitId(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Priority Weight</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full font-bold" disabled={submitting}>
                                {submitting ? 'Adding...' : 'Configure Slot'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Ads placements list */}
                <Card className="glass-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <BarChart size={20} />
                            Ad Slots Configurations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold text-slate-300">Placement</TableHead>
                                    <TableHead className="font-bold text-slate-300">Type</TableHead>
                                    <TableHead className="font-bold text-slate-300">Network</TableHead>
                                    <TableHead className="font-bold text-slate-300">Unit ID</TableHead>
                                    <TableHead className="font-bold text-slate-300">Weight</TableHead>
                                    <TableHead className="font-bold text-slate-300">Status</TableHead>
                                    <TableHead className="text-right font-bold text-slate-300">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-slate-400">Loading configurations...</TableCell>
                                    </TableRow>
                                ) : ads.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-slate-400 font-medium">No ad placements configured</TableCell>
                                    </TableRow>
                                ) : (
                                    ads.map((ad) => (
                                        <TableRow key={ad._id} className="hover:bg-muted/30">
                                            <TableCell className="font-bold text-slate-200">{ad.title}</TableCell>
                                            <TableCell className="font-semibold text-slate-300 uppercase text-xs">{ad.type}</TableCell>
                                            <TableCell className="font-semibold text-slate-300 capitalize">{ad.provider}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[120px]">{ad.adUnitId}</TableCell>
                                            <TableCell className="font-semibold text-slate-300">
                                                <div className="flex items-center gap-1">
                                                    <Sliders size={14} className="text-muted-foreground" />
                                                    {ad.priority}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={ad.isActive ? "success" : "destructive"}>
                                                    {ad.isActive ? 'Active' : 'Disabled'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleToggleStatus(ad)}
                                                    >
                                                        {ad.isActive ? <ToggleRight size={22} className="text-emerald-500" /> : <ToggleLeft size={22} className="text-muted-foreground" />}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDeleteAd(ad._id)}
                                                    >
                                                        <Trash2 size={16} />
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

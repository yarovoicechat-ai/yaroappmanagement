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
import { Plus, Trash2, ShieldAlert, Tag, ShieldCheck, CheckCircle2, AlertOctagon, HelpCircle } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function ModerationPage() {
    const [blockedWords, setBlockedWords] = useState<any[]>([]);
    const [wordInput, setWordInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Mock pending avatar validations for high fidelity UI
    const [pendingAvatars, setPendingAvatars] = useState<any[]>([
        { id: '1', userId: 10001, name: 'Rahul Sharma', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80', status: 'pending' },
        { id: '2', userId: 10022, name: 'Sanjana Roy', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', status: 'pending' },
        { id: '3', userId: 10034, name: 'Aman Patel', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', status: 'pending' }
    ]);

    useEffect(() => {
        fetchBlockedWords();
    }, []);

    const fetchBlockedWords = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/admin/moderation/blocked-words');
            if (response.success && response.data) {
                setBlockedWords(response.data || []);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch blocked words');
        } finally {
            setLoading(false);
        }
    };

    const handleAddWord = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!wordInput.trim()) return;

        try {
            setSubmitting(true);
            const response = await apiClient.post('/api/admin/moderation/blocked-words', {
                word: wordInput.trim()
            });

            if (response.success) {
                toast.success('Banned word added successfully');
                setWordInput('');
                fetchBlockedWords();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to block word');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteWord = async (wordId: string) => {
        try {
            const response = await apiClient.delete(`/api/admin/moderation/blocked-words/${wordId}`);
            if (response.success) {
                toast.success('Blocked word removed successfully');
                fetchBlockedWords();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete blocked word');
        }
    };

    const handleAvatarReview = (avatarId: string, action: 'approve' | 'flag') => {
        setPendingAvatars(prev => prev.filter(av => av.id !== avatarId));
        toast.success(`Profile image successfully ${action}d`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Content Moderation</h2>
                <p className="text-muted-foreground mt-1 font-medium font-sans">Moderate banned keywords, abusive terms, and profile image verification queues</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Blocked Words Management */}
                <Card className="glass-card md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Tag size={20} />
                            Banned Keywords List
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddWord} className="flex gap-2 mb-4">
                            <Input
                                placeholder="Enter bad word..."
                                value={wordInput}
                                onChange={(e) => setWordInput(e.target.value)}
                                required
                            />
                            <Button type="submit" disabled={submitting} className="font-bold">Add</Button>
                        </form>

                        <div className="flex flex-wrap gap-1.5 max-h-[300px] overflow-y-auto p-2 bg-slate-900/50 rounded-lg border border-border">
                            {loading ? (
                                <p className="text-xs text-slate-400">Loading words...</p>
                            ) : blockedWords.length === 0 ? (
                                <p className="text-xs text-slate-400">No banned words configured</p>
                            ) : (
                                blockedWords.map((wordDoc) => (
                                    <Badge key={wordDoc._id} variant="secondary" className="flex items-center gap-1 py-1 font-semibold text-slate-300">
                                        <span>{wordDoc.word}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteWord(wordDoc._id)}
                                            className="text-destructive font-black text-xs hover:text-red-300 ml-1"
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Avatar Validation Queue */}
                <Card className="glass-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <ShieldAlert size={20} className="text-yellow-500 animate-pulse" />
                            Pending Avatar Images Review ({pendingAvatars.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold text-slate-300">Avatar Image</TableHead>
                                    <TableHead className="font-bold text-slate-300">User Profile Name</TableHead>
                                    <TableHead className="font-bold text-slate-300">System ID</TableHead>
                                    <TableHead className="font-bold text-slate-300">Submission Date</TableHead>
                                    <TableHead className="text-right font-bold text-slate-300">Action Queue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingAvatars.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-emerald-400 font-bold flex items-center justify-center gap-2">
                                            <ShieldCheck size={20} />
                                            <span>Validation queue is fully cleared!</span>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pendingAvatars.map((avatar) => (
                                        <TableRow key={avatar.id} className="hover:bg-muted/30">
                                            <TableCell>
                                                <div className="h-14 w-14 rounded-full overflow-hidden border border-slate-700 bg-slate-800">
                                                    <img src={avatar.image} alt={avatar.name} className="h-full w-full object-cover" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-slate-200">{avatar.name}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{avatar.userId}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground font-semibold">Today, 2:40 PM</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleAvatarReview(avatar.id, 'approve')}
                                                        className="flex items-center gap-1 text-emerald-500 font-bold hover:bg-emerald-500/10 border-emerald-500/20"
                                                    >
                                                        <CheckCircle2 size={14} />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleAvatarReview(avatar.id, 'flag')}
                                                        className="flex items-center gap-1 font-bold"
                                                    >
                                                        <AlertOctagon size={14} />
                                                        Flag
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

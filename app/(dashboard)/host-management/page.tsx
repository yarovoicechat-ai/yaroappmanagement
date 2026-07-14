'use client';

import { useState } from 'react';
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
import { Star, Video, Phone, ShieldCheck, Hourglass, Award, Search } from "lucide-react";
import { toast } from 'sonner';

export default function HostManagementPage() {
    const [search, setSearch] = useState('');
    
    // Mock Host Data
    const [hosts, setHosts] = useState<any[]>([
        { id: '1', name: 'Riya Sen', rating: 4.8, streamHours: 120, earnedCoins: 850000, callAcceptRatio: '95%', isApproved: true },
        { id: '2', name: 'Neha Sharma', rating: 4.9, streamHours: 240, earnedCoins: 1450000, callAcceptRatio: '98%', isApproved: true },
        { id: '3', name: 'Aditi Rao', rating: 4.5, streamHours: 85, earnedCoins: 310000, callAcceptRatio: '88%', isApproved: false }
    ]);

    const handleToggleVerification = (id: string) => {
        setHosts(prev => prev.map(h => {
            if (h.id === id) {
                const nextState = !h.isApproved;
                toast.success(`Host ${h.name} is now ${nextState ? 'approved' : 'pending approval'}`);
                return { ...h, isApproved: nextState };
            }
            return h;
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Host Performance</h2>
                    <p className="text-muted-foreground mt-1 font-medium font-sans">Track streaming hours, quality ratings, call accept ratios, and commission payouts</p>
                </div>
            </div>

            {/* Quick overview */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs font-bold text-slate-400">Total Approved Hosts</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-100">120</div>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs font-bold text-slate-400">Total Streaming Hours</CardTitle>
                        <Hourglass className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-100">4,250 hrs</div>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs font-bold text-slate-400">Hosts Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-100">4.7 / 5.0</div>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs font-bold text-slate-400">Coins Distributed</CardTitle>
                        <Award className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-100">24.5M</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search host performance..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <Card className="glass-card">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold text-slate-300">Host Name</TableHead>
                                <TableHead className="font-bold text-slate-300">Star Rating</TableHead>
                                <TableHead className="font-bold text-slate-300">Streaming Time</TableHead>
                                <TableHead className="font-bold text-slate-300">Coins Earned</TableHead>
                                <TableHead className="font-bold text-slate-300">Call Accept Ratio</TableHead>
                                <TableHead className="font-bold text-slate-300">Verification Status</TableHead>
                                <TableHead className="text-right font-bold text-slate-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {hosts.filter(h => h.name.toLowerCase().includes(search.toLowerCase())).map((host) => (
                                <TableRow key={host.id} className="hover:bg-muted/30">
                                    <TableCell className="font-bold text-slate-200">
                                        <div className="flex items-center gap-2">
                                            <Video size={16} className="text-primary" />
                                            <span>{host.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold text-yellow-400">
                                        <div className="flex items-center gap-1">
                                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                            <span>{host.rating}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold text-slate-300">{host.streamHours} hrs</TableCell>
                                    <TableCell className="font-bold text-slate-200">{host.earnedCoins.toLocaleString()} coins</TableCell>
                                    <TableCell className="font-semibold text-slate-300">{host.callAcceptRatio}</TableCell>
                                    <TableCell>
                                        <Badge variant={host.isApproved ? 'success' : 'secondary'} className="font-semibold">
                                            {host.isApproved ? 'Approved' : 'Pending Verification'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant={host.isApproved ? 'destructive' : 'outline'}
                                            onClick={() => handleToggleVerification(host.id)}
                                            className="font-bold text-xs"
                                        >
                                            {host.isApproved ? 'Revoke Approval' : 'Approve Host'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
